import { createCampaignOneSession } from './campaign-one-session.mjs';
import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, createTutorialActorPlayback, sampleTutorialActorPlayback } from './tutorial-actor-playback.mjs';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from './tutorial-arena-camera.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';

const canvas = document.querySelector('#tutorialScene');
const context = canvas.getContext('2d');
const error = document.querySelector('#error');
const STAGE = { width: canvas.width, height: canvas.height };
const TICK_MS = 1000 / 30;
const TUTORIAL_WALL = { width: 2757, height: 1541 };

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Tutorial source image failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

function drawParallax(image, crop, arenaPosition) {
  const position = getTutorialParallaxLayerPosition(arenaPosition, TUTORIAL_WALL, crop, STAGE);
  context.drawImage(image, position.x, position.y);
}

function drawArena(image, crop, arenaPosition) {
  context.drawImage(image, arenaPosition.x - crop.x, arenaPosition.y - crop.y);
}

try {
  const visual = getMapVisual('tut');
  const [layers, unitTimeline, assets] = await Promise.all([
    loadMapLayers(visual),
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    loadTutorialUnitPoseAssets({ loadImage }),
  ]);
  const skyCrop = getMapLayerCrop(visual.sky);
  const backgroundCrop = getMapLayerCrop(visual.background);
  const terrainCrop = getMapLayerCrop(visual.terrain);
  const session = createCampaignOneSession();
  const [player] = createTutorialActorBindings(session).actors;
  const source = { unitTimeline, rootFrameActions: TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS, m4Runtime: assets.runtime, armCallbacks: TUTORIAL_M4_ARM_CALLBACKS };
  let actorState = createTutorialActorPlayback(player);
  let arenaPosition = { x: 0, y: 0 };
  let previous = performance.now();
  let accumulated = 0;

  function render() {
    context.clearRect(0, 0, STAGE.width, STAGE.height);
    drawParallax(layers.sky, skyCrop, arenaPosition);
    drawParallax(layers.map, backgroundCrop, arenaPosition);
    drawArena(layers.terrain, terrainCrop, arenaPosition);
    const screen = worldToTutorialScreen(player.position, arenaPosition);
    const sample = sampleTutorialActorPlayback(actorState, source);
    context.save();
    context.translate(screen.x, screen.y);
    drawTutorialUnitPose(context, sample.pose, assets);
    context.restore();
  }

  function frame(now) {
    accumulated += Math.min(now - previous, 250);
    previous = now;
    while (accumulated >= TICK_MS) {
      arenaPosition = advanceTutorialArenaPosition(arenaPosition, player.position, TUTORIAL_WALL, STAGE);
      actorState = advanceTutorialActorPlayback(actorState, source);
      accumulated -= TICK_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  render();
  canvas.dataset.ready = 'true';
  window.tutorialSceneReady = true;
  requestAnimationFrame(frame);
} catch (reason) {
  error.textContent = reason.message;
  canvas.dataset.ready = 'false';
  window.tutorialSceneReady = false;
}
