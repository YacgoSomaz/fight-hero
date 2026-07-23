import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createWorld, step } from './src/engine.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
const extractedRoot = fileURLToPath(new URL('./public/assets/unit-parts/', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png' };
const rooms = new Map();
// Keep the historical local default while allowing a second checked-out copy
// to run without terminating another project's development service.
const port = Number(process.env.PORT ?? 4173);

function roomSnapshot(world) {
  return {
    elapsed: world.elapsed,
    score: world.score,
    players: world.players.map(({ id, x, y, vx, vy, aimAngle, facing, animation, animationFrame, crouching, alive, hp, maxHp, weapon }) => ({ id, x, y, vx, vy, aimAngle, facing, animation, animationFrame, crouching, alive, hp, maxHp, weapon })),
    bullets: world.bullets.map(({ owner, x, y, vx, vy }) => ({ owner, x, y, vx, vy })),
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
    if (chunks.reduce((size, part) => size + part.length, 0) > 32_768) throw new Error('payload too large');
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function json(response, status, value) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(value));
}

function safeInput(input = {}) {
  return {
    left: Boolean(input.left), right: Boolean(input.right), jump: Boolean(input.jump), down: Boolean(input.down), reload: Boolean(input.reload), fire: Boolean(input.fire), firePressed: Boolean(input.firePressed),
    aimX: Number.isFinite(input.aimX) ? input.aimX : undefined, aimY: Number.isFinite(input.aimY) ? input.aimY : undefined,
  };
}

http.createServer(async (request, response) => {
  const pathname = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.split('?')[0]).replace(/^\/+/, '');
  const api = pathname.match(/^api\/rooms\/([a-zA-Z0-9_-]{1,32})\/(join|input|state)$/);
  if (api) {
    const [, roomId, action] = api;
    try {
      if (action === 'join' && request.method === 'POST') {
        const room = rooms.get(roomId) ?? { world: createWorld({ multiplayer: true }), clients: new Map(), inputs: {} };
        if (room.clients.size >= 2) return json(response, 409, { error: 'room is full' });
        const slot = room.clients.size === 0 ? 'p1' : 'p2';
        const token = randomUUID();
        room.clients.set(token, slot);
        rooms.set(roomId, room);
        return json(response, 200, { token, slot, state: roomSnapshot(room.world) });
      }
      const room = rooms.get(roomId);
      if (!room) return json(response, 404, { error: 'room not found' });
      if (action === 'state' && request.method === 'GET') return json(response, 200, roomSnapshot(room.world));
      if (action === 'input' && request.method === 'POST') {
        const body = await readJson(request);
        const slot = room.clients.get(body.token);
        if (!slot) return json(response, 401, { error: 'invalid room token' });
        room.inputs[slot] = safeInput(body.input);
        // Inputs are validated and simulation advances only here, on the server.
        step(room.world, room.inputs, Math.min(Math.max(Number(body.dt) || 1 / 60, 0), .05));
        room.world.events.length = 0;
        return json(response, 200, roomSnapshot(room.world));
      }
      return json(response, 405, { error: 'method not allowed' });
    } catch (error) { return json(response, 400, { error: error.message }); }
  }
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
}).listen(port, () => console.log(`Prototype ready: http://localhost:${port}`));
