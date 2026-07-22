import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ORIGINAL_SCOREBAR_ASSETS = Object.freeze([
  ['hud-scorebar-bg-1444.png', 146, 16],
  ['hud-scorebar-mask-1445.png', 147, 16],
  ['hud-scorebar-bar-1449-frame1.png', 6, 16],
  ['hud-scorebar-bar-1449-frame2.png', 6, 16],
  ['hud-scorebar-bar-1449-frame3.png', 6, 16],
  ['hud-scorebar-bar-1449-frame4.png', 6, 16],
  ['hud-scorebar-fade-1454-frame1.png', 18, 16],
  ['hud-scorebar-fade-1454-frame2.png', 18, 16],
  ['hud-scorebar-fade-1454-frame3.png', 18, 16],
  ['hud-scorebar-fade-1454-frame4.png', 18, 16],
  ['hud-scorebar-cap-1456.png', 13, 19],
  ['hud-scorebar-edge-1457.png', 10, 20],
]);

function pngDimensions(source) {
  assert.equal(source.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: source.readUInt32BE(16), height: source.readUInt32BE(20) };
}

// User journey: the live score should use the original ScoreBar child
// artwork that Hud.setScoreBar() animates, not a flattened 1462 screenshot
// or a hand-drawn progress rectangle.
test('Hud ScoreBar ships every directly extracted dynamic child image with its FFDec dimensions', async () => {
  for (const [name, width, height] of ORIGINAL_SCOREBAR_ASSETS) {
    const source = await readFile(new URL(`../public/assets/original-swf/${name}`, import.meta.url));
    assert.deepEqual(pngDimensions(source), { width, height }, name);
  }
});
