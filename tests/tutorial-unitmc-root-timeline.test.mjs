import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCRootTimeline } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { TUTORIAL_UNITMC_ROOT_TIMELINE } from '../src/tutorial-unitmc-root-timeline-source.mjs';

test('UnitMC root animation labels come from the original DefineSprite 669 FrameLabel tags', () => {
  const timeline = extractUnitMCRootTimeline();
  assert.equal(timeline.frameCount, 449);
  assert.deepEqual(timeline.labels, [
    [1, 'idle'], [21, 'run1'], [39, 'landrun1'], [58, 'runback1'], [76, 'landrunback1'],
    [95, 'run2'], [119, 'landrun2'], [143, 'runback2'], [167, 'landrunback2'], [191, 'jump'],
    [209, 'fall'], [230, 'fallloop'], [265, 'land'], [280, 'tuck'], [291, 'slide'], [302, 'duck'],
    [306, 'duckloop'], [322, 'duckrun'], [355, 'duckrunback'], [388, 'getup'], [392, 'climbsmall'],
    [397, 'climbbig'], [409, 'landhard'],
  ]);
});

test('the browser Tutorial root timeline source exactly preserves every original label boundary', () => {
  const timeline = extractUnitMCRootTimeline();
  assert.deepEqual(TUTORIAL_UNITMC_ROOT_TIMELINE, timeline);
});
