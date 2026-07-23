import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// User journey: a local copy must be startable without killing another
// project already using the default port. The project service keeps 4173 as
// its default but accepts a deliberate PORT override.
test('local server preserves port 4173 by default and accepts a PORT override', async () => {
  const server = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');

  assert.match(server, /const\s+port\s*=\s*Number\(process\.env\.PORT\s*\?\?\s*4173\)/);
  assert.match(server, /\.listen\(port,/);
});
