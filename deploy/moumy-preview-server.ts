import { startPreviewServer } from '../scripts/preview-server';

const server = startPreviewServer();
console.log(`Preview server listening on http://${server.hostname}:${server.port}`);
