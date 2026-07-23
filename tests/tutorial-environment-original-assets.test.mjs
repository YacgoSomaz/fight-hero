import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const ROOT = new URL('../', import.meta.url);

// These are direct FFDec exports from the user-supplied, canonical 4399 SWF.
// Keep the source vector artwork available to the browser instead of drawing
// stand-in door or elevator art.
test('keeps Campaign 1 environment vector art as the original extracted SVG assets', () => {
  for (const symbolId of [1359, 1360, 1387]) {
    const source = readFileSync(new URL(`../public/assets/original-swf/tutorial-environment/${symbolId}.svg`, import.meta.url), 'utf8');
    assert.match(source, /ffdec:objectType="shape"/);
    assert.match(source, /<path /);
  }
  assert.equal(ROOT.protocol, 'file:');
});
