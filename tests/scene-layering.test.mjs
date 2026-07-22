import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the original DOM map has a dedicated actor overlay above terrain art when Canvas compositing is unavailable', async () => {
  const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="actorOverlay"/, 'the source map needs an actor overlay container');
  assert.match(css, /#mapBackdrop \.map-layer\{[^}]*z-index:1/, 'map art must stay below actor sprites');
  assert.match(css, /#actorOverlay\{[^}]*z-index:2/, 'actor sprites must be above terrain art');
});
