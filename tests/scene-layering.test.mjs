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

test('the visible actor layer upgrades from the source idle fallback to original UnitMC DOM parts when a decoded frame is available', async () => {
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const css = await readFile(new URL('../style.css', import.meta.url), 'utf8');

  assert.match(main, /import\s*\{\s*getUnitDomRigFrame\s*\}\s*from\s*'\.\/unit-dom-rig\.mjs'/);
  assert.match(main, /className\s*=\s*'actor-rig'/);
  assert.match(main, /getUnitDomRigFrame\(\{/);
  assert.match(main, /sprite\.hidden\s*=\s*!player\.alive\s*\|\|\s*rig\.length\s*>=\s*1/);
  assert.match(css, /\.actor-rig\{[^}]*position:absolute/);
  assert.match(css, /\.actor-rig-part\{[^}]*transform-origin:0 0/);
});
