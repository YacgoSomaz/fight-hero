import test from 'node:test';
import assert from 'node:assert/strict';
import { ORIGINAL_AIMER } from '../src/aimer-source.mjs';

test('the gameplay crosshair uses the directly extracted Aimer symbol instead of a CSS/canvas substitute', () => {
  assert.deepEqual(ORIGINAL_AIMER, {
    source: './public/assets/original-swf/aimer-1431-frame1.png',
    sourceSymbol: 1431,
    sourceFrame: 1,
    width: 26,
    height: 26,
    origin: { x: 13, y: 13 },
  });
});
