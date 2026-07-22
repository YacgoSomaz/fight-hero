import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the source-only Tutorial pose preview loads original Shape assets without the generic quick-match rig', () => {
  const page = fs.readFileSync(new URL('../tutorial-pose-preview.html', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../src/tutorial-pose-preview.mjs', import.meta.url), 'utf8');
  assert.match(page, /<canvas id="tutorialPose" width="800" height="600"/);
  assert.match(page, /src="src\/tutorial-pose-preview\.mjs"/);
  assert.match(script, /loadTutorialUnitPoseAssets/);
  assert.match(script, /createTutorialUnitPosePlan/);
  assert.match(script, /drawTutorialUnitPose/);
  assert.doesNotMatch(script, /unit-dom-rig|unit-parts|main\.mjs/);
});
