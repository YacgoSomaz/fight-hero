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
  assert.match(script, /getTutorialEnvironmentRenderPlan/);
  assert.match(script, /drawTutorialEnvironment/);
  assert.match(script, /drawVectorRuntimeSprite/);
  assert.match(script, /tutorial-down-arrow-vector-runtime\.local\.json/);
  assert.match(script, /tutorial-environment-timeline-runtime\.local\.json/);
  assert.match(script, /tutorial-environment\/1359\.svg/);
  assert.match(script, /tutorial-environment\/1360\.svg/);
  assert.match(script, /tutorial-environment\/1387\.svg/);
  assert.match(script, /unitJugMarkerImage, originalUnitOverheadFont, environmentAssets/);
  assert.match(script, /getTutorialDownArrowRenderPlan\(session\.hud\.arrows, tutorialWorld\.tickRuntime\.tick, arenaPosition\)/);
  assert.match(script, /getTutorialEnvironmentRenderPlan\(session\.environment, environmentTimelineRuntime, arenaPosition\)/);
  assert.match(script, /drawTutorialEnvironment\(context, environmentPlan, environmentAssets, \{\s*createCanvas/);
  assert.match(script, /drawVectorRuntimeSprite\(context, downArrowRuntime, 1395, arrow\.frame, drawRuntimeShape\)/);
  assert.match(script, /unit-bar-670\.png/);
  assert.match(script, /drawSourceTintedImage/);
  assert.match(script, /createSourceTintedCanvas/);
  assert.doesNotMatch(script, /context\.globalCompositeOperation = 'source-in'/);
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

// User journey: Under Siege must expose its live score, weapon/ammo, class,
// HP and experience through Hud 1540 source children. The playable Tutorial
// may not fall back to the previous prototype's handmade bars or fixed labels
// merely because it has its own renderer entrypoint.
test('Tutorial scene preview renders the Campaign 1 HUD from original Hud 1540 assets and plans', () => {
  const { script } = readPreview();
  assert.match(script, /getHudScorebarRenderPlan/);
  assert.match(script, /getHudTextFields/);
  assert.match(script, /getHudExperienceRenderPlan/);
  assert.match(script, /getHudAmmoBoxes/);
  assert.match(script, /function renderTutorialHud\(\)/);
  assert.match(script, /hud-scorebar-1462\.png/);
  assert.match(script, /hud-exp-base-1474\.svg/);
  assert.match(script, /hud-exp-green-1475\.svg/);
  assert.match(script, /hud-exp-fill-699-source\.svg/);
  assert.match(script, /hud-gunsmenu-724-m4-frame20\.png/);
  assert.match(script, /renderTutorialHud\(\);/);
  assert.doesNotMatch(script, /P1\s+HP\s+\$\{/);
});

// The Campaign 1 dialogue is not a browser toast. Hud.setMsg() owns
// Speak_187, its original display list and actor portrait frame; the scene
// must load and render those direct source records above the world.
test('Tutorial scene preview renders original Speak_187 assets from the live Campaign HUD', () => {
  const { script } = readPreview();
  assert.match(script, /getTutorialSpeakRenderPlan/);
  assert.match(script, /drawTutorialSpeak/);
  assert.match(script, /tutorial-speak-timeline-runtime\.local\.json/);
  assert.match(script, /tutorial-speak-portrait-timeline-runtime\.local\.json/);
  assert.match(script, /TUTORIAL_SPEAK_SOURCE_ASSETS\.chrome/);
  assert.match(script, /TUTORIAL_SPEAK_SOURCE_ASSETS\.portraits/);
  assert.match(script, /font-1485\.ttf/);
  assert.match(script, /font-800\.ttf/);
  assert.match(script, /function renderTutorialSpeak\(\)/);
  assert.match(script, /getTutorialSpeakRenderPlan\(\{\s*hud: session\.hud/);
  assert.match(script, /drawTutorialSpeak\(context, speakPlan, tutorialSpeakAssets/);
  assert.match(script, /renderTutorialSpeak\(\);/);
});

// Browser screenshot verification needs the values actually consumed by the
// source tick, not a parallel debug simulation. These attributes make the
// current Camera/Arena and source Unit position inspectable without drawing
// any non-original diagnostic visual inside the 800x600 stage.
test('Tutorial scene exposes its live source-tick camera and player coordinates for visual verification', () => {
  const { script } = readPreview();
  assert.match(script, /function publishTutorialSourceSnapshot\(\)/);
  assert.match(script, /canvas\.dataset\.sourceGameFrame/);
  assert.match(script, /canvas\.dataset\.sourceCampaignState/);
  assert.match(script, /canvas\.dataset\.sourceWallFrame/);
  assert.match(script, /canvas\.dataset\.sourceArenaPosition/);
  assert.match(script, /canvas\.dataset\.sourcePlayerPosition/);
  assert.match(script, /tutorialWorld\.session\.runtime\.state/);
  assert.match(script, /tutorialWorld\.session\.map\.wallFrame/);
  assert.match(script, /tutorialWorld\.tickRuntime\.gameFrame/);
  assert.match(script, /publishTutorialSourceSnapshot\(\);/);
});

// The visual acceptance check must distinguish a source-map load failure from
// a Canvas draw failure. These attributes report only the already-loaded
// original image dimensions and the exact source crop/camera draw positions;
// they do not add any diagnostic art to the stage.
test('Tutorial scene exposes loaded original map dimensions and source draw positions for visual verification', () => {
  const { script } = readPreview();
  assert.match(script, /canvas\.dataset\.sourceMapLayerSizes/);
  assert.match(script, /canvas\.dataset\.sourceMapDrawPositions/);
  assert.match(script, /layers\.sky\.naturalWidth/);
  assert.match(script, /layers\.map\.naturalWidth/);
  assert.match(script, /layers\.terrain\.naturalWidth/);
  assert.match(script, /getTutorialParallaxLayerPosition\(arenaPosition, wall, skyCrop, STAGE\)/);
  assert.match(script, /getTutorialParallaxLayerPosition\(arenaPosition, wall, backgroundCrop, STAGE\)/);
});

// User journey: on a short desktop window, the 800×600 SWF stage must remain
// entirely visible. Browser-only explanatory copy must not make the source
// stage taller than the viewport and crop the opening dialogue/cinematic.
test('Tutorial page constrains the original 4:3 canvas to both viewport axes without a non-SWF instruction panel', () => {
  const { page } = readPreview();
  assert.match(page, /width:\s*min\(800px,\s*100vw,\s*calc\(\(100vh - 16px\) \* 4 \/ 3\)\)/);
  assert.match(page, /main\s*\{[^}]*width:\s*fit-content[^}]*\}/);
  assert.doesNotMatch(page, /Campaign 1 · tut 原 Sky\/Background\/Arena/);
});
