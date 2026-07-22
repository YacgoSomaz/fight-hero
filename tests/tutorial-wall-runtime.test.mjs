import test from 'node:test';
import assert from 'node:assert/strict';
import { createTutorialWallSet } from '../src/tutorial-wall-runtime.mjs';
import { TUTORIAL_WALL_SOURCE } from '../src/tutorial-wall-source.mjs';

function loadedFrames() {
  return TUTORIAL_WALL_SOURCE.frames.map((frame) => ({ ...frame, image: { id: `original-${frame.frame}` } }));
}

test('tutorial collision selects the matching original Wall_tut frame mask', () => {
  const wallSet = createTutorialWallSet(loadedFrames(), (image) => ({ sourceImage: image }));
  assert.deepEqual(wallSet.at(1), { sourceImage: { id: 'original-1' } });
  assert.deepEqual(wallSet.at(9), { sourceImage: { id: 'original-9' } });
  assert.throws(() => wallSet.at(17), /Wall_tut frame 17/);
});

test('tutorial collision rejects an incomplete original Wall_tut sequence', () => {
  assert.throws(
    () => createTutorialWallSet(loadedFrames().slice(0, 15), () => ({})),
    /missing original Wall_tut frame 16/,
  );
});
