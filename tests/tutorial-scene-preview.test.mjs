import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function readPreview() {
  return {
    page: fs.readFileSync(new URL('../tutorial-scene-preview.html', import.meta.url), 'utf8'),
    script: fs.readFileSync(new URL('../src/tutorial-scene-preview.mjs', import.meta.url), 'utf8'),
  };
}

// Browser integration guard: the preview is a renderer/input adapter over
// one Tutorial world tick, not a second Game loop which batches actors by
// feature and thereby changes original AS3 timing.
test('Tutorial scene preview consumes the source Game tick rather than browser phase batches', () => {
  const { page, script } = readPreview();
  assert.match(page, /<canvas id="tutorialScene" width="800" height="600"/);
  assert.match(page, /src="src\/tutorial-scene-preview\.mjs"/);
  assert.match(script, /getMapVisual\('tut'\)/);
  assert.match(script, /loadMapLayers/);
  assert.match(script, /loadTutorialWorld/);
  assert.match(script, /advanceTutorialWorldGameTick\(tutorialWorld/);
  assert.match(script, /onLineBullet\(\{ actorId, bullet \}\)/);
  assert.match(script, /playerKeys: movementKeys/);
  assert.match(script, /playerJumpRequested/);
  assert.match(script, /sourceTick\.actorResults/);
  assert.match(script, /traceTutorialLineBullet/);
  assert.match(script, /applyTutorialLineBulletHit/);
  assert.match(script, /applyCampaignOneSessionDeath/);
  assert.match(script, /applyTutorialBulletEnvironmentHit/);
  assert.match(script, /requestTutorialActorMotion/);
  assert.match(script, /beginTutorialActorGunAction/);
  assert.match(script, /advanceTutorialActorPlayback/);
  assert.match(script, /advanceTutorialPlayerAim/);
  assert.match(script, /deriveTutorialUnitAim/);
  assert.match(script, /getTutorialUnitOverheadHud/);
  assert.match(script, /getTutorialDownArrowRenderPlan/);
  assert.match(script, /drawVectorRuntimeSprite/);
  assert.match(script, /tutorial-down-arrow-vector-runtime\.local\.json/);
  assert.match(script, /getTutorialDownArrowRenderPlan\(session\.hud\.arrows, tutorialWorld\.tickRuntime\.tick, arenaPosition\)/);
  assert.match(script, /drawVectorRuntimeSprite\(context, downArrowRuntime, 1395, arrow\.frame, drawRuntimeShape\)/);
  assert.match(script, /unit-bar-670\.png/);
  assert.match(script, /globalCompositeOperation = 'source-in'/);
  assert.match(script, /canvas\.dataset\.ready = 'true'/);
  assert.match(script, /function reportTutorialSceneFailure\(reason\)/);
  assert.doesNotMatch(script, /applyCampaignOneSessionFrame\(/);
  assert.doesNotMatch(script, /advanceCampaignOneSessionAi\(/);
  assert.doesNotMatch(script, /advanceCampaignOneSessionAiGuns\(/);
  assert.doesNotMatch(script, /advanceCampaignOneSessionAiMovement\(/);
  assert.doesNotMatch(script, /advanceCampaignOneSessionUnits\(/);
  assert.doesNotMatch(script, /advanceCampaignOneSessionPlayerGun\(/);
  assert.doesNotMatch(script, /stepTutorialMovement\(/);
  assert.doesNotMatch(script, /applyTutorialFootContact\(/);
});

test('Tutorial scene queues original mouse and swap inputs to the source runtime', () => {
  const { script } = readPreview();
  assert.match(script, /enqueueCampaignOneSourceInput\(tutorialWorld\.tickRuntime, \{ type: 'mouseDown' \}\)/);
  assert.match(script, /enqueueCampaignOneSourceInput\(tutorialWorld\.tickRuntime, \{ type: 'mouseUp' \}\)/);
  assert.match(script, /enqueueCampaignOneSourceInput\(tutorialWorld\.tickRuntime, \{ type: 'swapGuns' \}\)/);
  assert.match(script, /event\.code === 'KeyQ'/);
  assert.match(script, /event\.code === 'ShiftLeft'/);
  assert.match(script, /event\.code === 'ShiftRight'/);
  assert.doesNotMatch(script, /applyCampaignOneSessionPlayerMouseDown/);
  assert.doesNotMatch(script, /applyCampaignOneSessionPlayerMouseUp/);
  assert.doesNotMatch(script, /applyCampaignOneSessionPlayerGunSwap/);
  assert.doesNotMatch(script, /createTutorialGunRuntime/);
});
