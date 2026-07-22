import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from '../src/tutorial-arena-camera.mjs';

test('Tutorial camera follows the original Arena EnterFrame 0.7 step and clamps at the left map edge', () => {
  assert.deepEqual(
    advanceTutorialArenaPosition({ x: 0, y: 0 }, { x: 285, y: 705 }, { width: 2757, height: 1541 }),
    { x: 0, y: -269.5 },
  );
});

test('Tutorial background parallax uses Arena wall dimensions and the source crop origin', () => {
  assert.deepEqual(
    getTutorialParallaxLayerPosition({ x: -400, y: -300 }, { width: 2757, height: 1541 }, { x: 10, y: 20, width: 1200, height: 900 }),
    { x: -91.75779253960143, y: -115.64293304994686 },
  );
});

test('Tutorial actor position stays in the same Arena coordinate system as the foreground', () => {
  assert.deepEqual(worldToTutorialScreen({ x: 285, y: 705 }, { x: 0, y: -269.5 }), { x: 285, y: 435.5 });
});
