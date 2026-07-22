import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractArmGunCallbacks } from '../private-assets/parse-arm-gun-callbacks.mjs';
import { extractUnitMCRootFrameActions } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { TUTORIAL_ARM_CALLBACKS } from '../src/tutorial-m4-callback-source.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from '../src/tutorial-unitmc-root-frame-actions-source.mjs';

const unitMcSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/UnitMC.as', import.meta.url), 'utf8');
const armSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/MBFZ_fla/arm_gun_316.as', import.meta.url), 'utf8');

test('browser-owned Tutorial tick sources exactly preserve the decoded UnitMC and active M4/USP2 callbacks', () => {
  assert.deepEqual(TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS, extractUnitMCRootFrameActions(unitMcSource));
  const armCallbacks = extractArmGunCallbacks(armSource);
  // arm_gun_316 is shared by every gun. The browser currently consumes the
  // extracted M4 and Campaign-1 USP2 spans, not a hand-written callback map.
  assert.deepEqual(TUTORIAL_ARM_CALLBACKS, Object.fromEntries([8, 9, 37, 80, 81, 115].map((frame) => [frame, armCallbacks[frame]])));
});

test('Tutorial actor preview carries the original actor tick into a canvas instead of the generic quick-match rig', () => {
  const page = fs.readFileSync(new URL('../tutorial-actor-preview.html', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../src/tutorial-actor-preview.mjs', import.meta.url), 'utf8');
  assert.match(page, /<canvas id="tutorialActor" width="800" height="600"/);
  assert.match(page, /src="src\/tutorial-actor-preview\.mjs"/);
  assert.match(script, /createTutorialActorPlayback/);
  assert.match(script, /sampleTutorialActorPlayback/);
  assert.match(script, /advanceTutorialActorPlayback/);
  assert.match(script, /drawTutorialUnitPose/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /canvas\.dataset\.ready = 'true'/);
  assert.match(script, /canvas\.dataset\.ready = 'false'/);
  assert.doesNotMatch(script, /main\.mjs|engine\.mjs|unit-dom-rig|unit-parts/);
});
