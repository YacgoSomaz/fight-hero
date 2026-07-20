import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const extractedRoot = fileURLToPath(new URL('../../work/ffdec_unit_parts/', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
http.createServer(async (request, response) => {
  const pathname = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
  const fromExtract = pathname.startsWith('source-assets/');
  const relativePath = fromExtract ? pathname.slice('source-assets/'.length) : pathname;
  const allowedRoot = fromExtract ? extractedRoot : root;
  const target = normalize(join(allowedRoot, relativePath));
  if (!target.startsWith(allowedRoot)) { response.writeHead(403).end('Forbidden'); return; }
  try {
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4173, () => console.log('Prototype ready: http://localhost:4173'));
