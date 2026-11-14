# Atlas static preview

The public site remains `adapter-static` for Cloudflare Pages. The editor-facing preview uses the same adapter and the same local working tree, but writes each on-demand build into a versioned directory outside the checkout.

## Editor contract

The Editor backend can invoke these commands from the recipe repository on Atlas:

```sh
bun run preview:status
bun run preview:build
```

Both print a machine-readable `PREVIEW_RESULT {json}` line. The build command checks the source fingerprint first; it emits `status: "fresh"` without rebuilding when unchanged. Otherwise it emits `PREVIEW_STATE {"status":"building",...}`, runs one build, and only emits `status: "built"` after the generated site and sitemap have been validated and atomically selected as current. Failures emit `status: "failed"` and exit non-zero; the old `current` link is not changed.

The fingerprint covers all files under `src/`, `static/`, and `scripts/`, build manifests/configuration, and root `.env*` files. It hashes file contents (including new/deleted files), never stores environment values in the manifest, and also fingerprints public `PUBLIC_*` / `VITE_*` environment variables. Dependencies and generated output are excluded.

Measured builds took about 15 seconds and peaked at roughly 1.6 GiB RSS. On Linux, builds are refused by default below 2,800 MiB `MemAvailable`; tune `MOUMY_PREVIEW_MIN_AVAILABLE_MIB` for Atlas based on its actual memory budget. Systems without `/proc/meminfo` skip this guard. A kernel-managed Linux `flock` prevents overlapping builds. The lock is acquired before the worker rechecks freshness and remains held by the worker process through build, validation, and publication. Because the Vite build runs in that process rather than a detached child, the kernel releases the lock automatically when the worker exits or is killed. If source files change while a build is running, its output is discarded rather than advertised as current.

## Static server

`bun run preview:serve` is the development entry point. The deployed server is a compiled, standalone Bun executable; it supports GET/HEAD and SvelteKit clean URLs, rejects traversal/hidden-file access and other methods, disables caching, and refuses non-loopback binds. It does not build, watch, run Vite, expose an API, or load the repository at runtime.

Install `deploy/systemd/moumy-preview.service` as a **system service running under a dedicated unprivileged account** on Atlas. This creates an OS-level read boundary rather than relying only on the HTTP handler:

1. Create the read-only service identity and shared artifact group (skip account/group creation if they already exist), then add the editor/build account to the group:

   ```sh
   sudo groupadd --system moumy-preview-artifacts
   sudo useradd --system --no-create-home --gid moumy-preview-artifacts --shell /usr/bin/false moumy-preview
   sudo usermod --append --groups moumy-preview-artifacts "$USER"
   ```

   Log out and back in so the editor/build process receives the new supplementary group.

2. Prepare the artifact location. The parent has group execute but not group list/read; only the `releases/` directory is group-readable. The setgid bit carries the artifact group onto staged builds and releases:

   ```sh
   sudo install -d -o "$USER" -g moumy-preview-artifacts -m 2710 /var/lib/moumy-preview
   sudo install -d -o "$USER" -g moumy-preview-artifacts -m 2750 /var/lib/moumy-preview/releases
   ```

   Configure the Editor's build/status process to use `MOUMY_PREVIEW_DIR=/var/lib/moumy-preview`. From the shared checkout, run `MOUMY_PREVIEW_DIR=/var/lib/moumy-preview bun run preview:build` once.

3. Compile the serve-only entry point and install the root-owned executable outside the checkout: `bun build --compile deploy/moumy-preview-server.ts --outfile /tmp/moumy-preview-server && sudo install -D -o root -g root -m 0755 /tmp/moumy-preview-server /usr/local/libexec/moumy-preview-server`. Repeat this installation when serving code changes.
4. Install the unit to `/etc/systemd/system/moumy-preview.service`, then run `sudo systemctl daemon-reload && sudo systemctl enable --now moumy-preview.service`.
5. Verify under the service's actual identity and sandbox that it can read `/var/lib/moumy-preview/releases/current/index.html` but cannot read a known recipe file in the shared checkout or a readable test file in the editor's home. `User=moumy-preview` has no login/home; `ProtectHome=tmpfs` hides home directories; only the release directory is bind-mounted read-only. The parent artifact directory is not listable by the service group, the build lock is mode `0600`, and staging directories are mode `0700`. Staging output, lock files, and publication metadata are therefore inaccessible even while a build runs. The root-owned executable embeds the server and needs neither Bun nor the checkout at runtime.
6. Verify `ss -ltn` shows `127.0.0.1:4175`, then configure the machine's Tailscale Serve to proxy to `http://127.0.0.1:4175`. Do not bind this process to a LAN or public interface. Set the Editor's `PREVIEW_URL` to the private Tailscale URL.

The unit also enables a read-only system filesystem, no new privileges, and restricts address families. The server itself enforces loopback-only binding and has no outbound/network-client code. Logs go to the system journal (`journalctl -u moumy-preview.service`). The Editor/build process owns and can write the artifacts; the dedicated serving account can read only successful releases. Keep the shared checkout beneath a protected home directory (or add its actual path to `InaccessiblePaths=` in the Atlas unit). The service has no repository path or credentials, executes no code from the checkout, and cannot read it through the unit's mount namespace.

## Publication, failures, and retention

Builds land in a unique staging directory inside `MOUMY_PREVIEW_DIR`; SvelteKit's static adapter and sitemap generator write there. After a successful build and a second input fingerprint check, the output is renamed into `releases/` and a symlink rename switches `releases/current` atomically. The server resolves that symlink per request. Failed builds leave the last successful release available and return an explicit failure to the caller.

Successful releases are intentionally **not automatically deleted**. This avoids deleting data without an operator-approved retention policy and ensures rollback remains possible. Check sizes with `du -sh "$MOUMY_PREVIEW_DIR"/releases`; after verifying the active `current` target, an operator may remove old release directories manually. Establish an Atlas-specific retention/backup policy before enabling automatic cleanup.

## Verification

The code is tested locally by `bun run test:preview`. Atlas service installation and Tailscale Serve configuration are operational steps and must be performed/verified on Atlas; this change does not deploy or expose a service. The separate Editor integration is tracked by [lelabdev/moumy-editor#35](https://github.com/lelabdev/moumy-editor/issues/35).
