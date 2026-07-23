import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { extractTutorialSpeakPortraitTimeline } from '../tools/extract-tutorial-environment-timeline.mjs';

const SOURCE = new URL('../assets/reverse/4399-90433-25.swf', import.meta.url);

// User journey: the opening Scientist dialogue picks `head.gotoAndStop(57)`
// from Unit.unitInfo.frame.  The port must retain the source character at
// that exact portrait frame rather than substituting a generic Medic icon.
test('extracts the original 200-frame Speak head portrait timeline', () => {
  const portrait = extractTutorialSpeakPortraitTimeline(readFileSync(SOURCE));

  assert.deepEqual({
    symbolId: portrait.symbolId,
    frameCount: portrait.frameCount,
    labels: portrait.labels,
    scientist: portrait.frames[56].items,
  }, {
    symbolId: 666,
    frameCount: 200,
    labels: { sniper: 1, medic: 51, tank: 101, soldier: 151 },
    scientist: [{
      depth: 1,
      character: 645,
      clipDepth: null,
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotateSkew0: 0,
      rotateSkew1: 0,
    }],
  });
});
