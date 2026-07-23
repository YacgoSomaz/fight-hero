import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('local server labels extracted SVG source art as an image so Tutorial can decode it', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
  assert.match(server, /'\.svg': 'image\/svg\+xml'/);
});
