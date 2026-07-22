import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the live Canvas layer is explicitly above original map images so actors cannot be hidden by terrain art', async () => {
  const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');
  assert.match(css, /#mapBackdrop\{[^}]*z-index:0/, 'original map layers must have an explicit lower stacking level');
  assert.match(css, /canvas\s*\{[^}]*z-index:2/, 'live Canvas actors and HUD must be above original map layers');
});
