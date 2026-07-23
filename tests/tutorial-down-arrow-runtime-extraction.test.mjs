import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractTutorialDownArrowRuntime } from '../tools/extract-tutorial-down-arrow-runtime.mjs';

// The Tutorial arrows must remain the original 1395 MovieClip, not a CSS
// glyph.  This locks both its animated child placement and its direct Shape.
test('extracts the original Tutorial DownArrow 1395 display-list timeline from the canonical SWF', () => {
  const source = readFileSync(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
  const runtime = extractTutorialDownArrowRuntime(source);

  assert.equal(runtime.symbolId, 1395);
  assert.equal(runtime.frameCount, 16);
  assert.deepEqual(runtime.frames.map(({ items }) => items.map(({ depth, character, x, y }) => [depth, character, x, y])), [
    [[1, 1394, 0, -17.9]], [[1, 1394, 0, -18.85]], [[1, 1394, 0, -19.65]], [[1, 1394, 0, -20.35]],
    [[1, 1394, 0, -20.9]], [[1, 1394, 0, -21.35]], [[1, 1394, 0, -21.65]], [[1, 1394, 0, -21.85]],
    [[1, 1394, 0, -21.9]], [[1, 1394, 0, -21.8]], [[1, 1394, 0, -21.55]], [[1, 1394, 0, -21.15]],
    [[1, 1394, 0, -20.6]], [[1, 1394, 0, -19.85]], [[1, 1394, 0, -18.95]], [[1, 1394, 0, -17.9]],
  ]);
  assert.deepEqual(Object.keys(runtime.shapes).map(Number), [1394]);
  assert.ok(runtime.shapes[1394].fills.some(({ fill }) => fill.opacity < 1));
});
