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

Measured builds took about 15 seconds and peaked at roughly 1.6 GiB RSS. On Linux, builds are refused by default below 2,800 MiB `MemAvailable`; tune `MOUMY_PREVIEW_MIN_AVAILABLE_MIB` for Atlas based on its actual memory budget. Systems without `/proc/meminfo` skip this guard. A lock prevents overlapping builds. If source files change while a build is running, its output is discarded rather than advertised as current.

## Static server

`scripts/preview.ts serve` serves only the currently published artifact directory. It supports GET/HEAD and SvelteKit clean URLs, rejects traversal/hidden-file access and other methods, disables caching, and refuses non-loopback binds. It does not build, watch, run Vite, expose an API, or read recipe sources.

Install `deploy/systemd/moumy-preview.service` as a **user service** only after preparing the local Atlas configuration:

1. Create `~/.config/moumy-preview.env` with `MOUMY_PREVIEW_REPO=/absolute/path/to/the/shared/moumy-recettes/clone`. Keep this path private to the machine; do not commit it.
2. Ensure Bun is at `~/.bun/bin/bun` or update the unit's PATH.
3. From the shared checkout, run `bun run preview:build` once to create the artifact directory, then install the unit to `~/.config/systemd/user/` and run `systemctl --user daemon-reload && systemctl --user enable --now moumy-preview.service`.
4. Verify `ss -ltn` shows `127.0.0.1:4175`, then configure the machine's Tailscale Serve to proxy to `http://127.0.0.1:4175`. Do not bind this process to a LAN or public interface. Set the Editor's `PREVIEW_URL` to the private Tailscale URL.

The unit runs with a read-only filesystem/home view, no new privileges, and network access restricted to localhost. It only reads published files; its logs go to the user journal (`journalctl --user -u moumy-preview.service`). The Editor/build command needs write access to `MOUMY_PREVIEW_DIR`; the static service does not. For stronger OS-user separation, run the editor/build and static server as distinct Unix users with group read access to published artifacts and update the unit's filesystem permissions accordingly. Do not grant the static server access to the recipe checkout.

## Publication, failures, and retention

Builds land in a unique staging directory inside `MOUMY_PREVIEW_DIR`; SvelteKit's static adapter and sitemap generator write there. After a successful build and a second input fingerprint check, the output is renamed into `releases/` and a symlink rename switches `current` atomically. The server resolves that symlink per request. Failed builds leave the last successful release available and return an explicit failure to the caller.

Successful releases are intentionally **not automatically deleted**. This avoids deleting data without an operator-approved retention policy and ensures rollback remains possible. Check sizes with `du -sh "$MOUMY_PREVIEW_DIR"/releases`; after verifying the active `current` target, an operator may remove old release directories manually. Establish an Atlas-specific retention/backup policy before enabling automatic cleanup.

## Verification

The code is tested locally by `bun run test:preview`. Atlas service installation and Tailscale Serve configuration are operational steps and must be performed/verified on Atlas; this change does not deploy or expose a service. The separate Editor integration is tracked by [lelabdev/moumy-editor#35](https://github.com/lelabdev/moumy-editor/issues/35).
