import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, createTutorialActorPlayback, requestTutorialActorMotion, sampleTutorialActorPlayback } from './tutorial-actor-playback.mjs';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from './tutorial-arena-camera.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';
import { loadTutorialWorld } from './tutorial-world-loader.mjs';
import { beginTutorialMovementJump, createTutorialMovementState, stepTutorialMovement, TUTORIAL_MOVEMENT_KEYS } from './tutorial-movement.mjs';

const canvas = document.querySelector('#tutorialScene');
const context = canvas.getContext('2d');
const error = document.querySelector('#error');
const STAGE = { width: canvas.width, height: canvas.height };
const TICK_MS = 1000 / 30;
const KEY_BITS = Object.freeze({
  KeyW: TUTORIAL_MOVEMENT_KEYS.UP,
  ArrowUp: TUTORIAL_MOVEMENT_KEYS.UP,
  KeyS: TUTORIAL_MOVEMENT_KEYS.DOWN,
  ArrowDown: TUTORIAL_MOVEMENT_KEYS.DOWN,
  KeyA: TUTORIAL_MOVEMENT_KEYS.LEFT,
  ArrowLeft: TUTORIAL_MOVEMENT_KEYS.LEFT,
  KeyD: TUTORIAL_MOVEMENT_KEYS.RIGHT,
  ArrowRight: TUTORIAL_MOVEMENT_KEYS.RIGHT,
});

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Tutorial source image failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

function drawParallax(image, crop, arenaPosition, wall) {
  const position = getTutorialParallaxLayerPosition(arenaPosition, wall, crop, STAGE);
  context.drawImage(image, position.x, position.y);
}

function drawArena(image, crop, arenaPosition) {
  context.drawImage(image, arenaPosition.x - crop.x, arenaPosition.y - crop.y);
}

try {
  const visual = getMapVisual('tut');
  const [layers, unitTimeline, assets, tutorialWorld] = await Promise.all([
    loadMapLayers(visual),
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    loadTutorialUnitPoseAssets({ loadImage }),
    loadTutorialWorld(),
  ]);
  const skyCrop = getMapLayerCrop(visual.sky);
  const backgroundCrop = getMapLayerCrop(visual.background);
  const terrainCrop = getMapLayerCrop(visual.terrain);
  const session = tutorialWorld.session;
  const wall = { width: tutorialWorld.wall.width, height: tutorialWorld.wall.height };
  let [player] = createTutorialActorBindings(session).actors;
  const source = { unitTimeline, rootFrameActions: TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS, m4Runtime: assets.runtime, armCallbacks: TUTORIAL_M4_ARM_CALLBACKS };
  let actorState = createTutorialActorPlayback(player);
  let movementState = createTutorialMovementState({ noJump: player.noJump });
  let movementKeys = 0;
  let arenaPosition = { x: 0, y: 0 };
  let previous = performance.now();
  let accumulated = 0;

  function render() {
    context.clearRect(0, 0, STAGE.width, STAGE.height);
    drawParallax(layers.sky, skyCrop, arenaPosition, wall);
    drawParallax(layers.map, backgroundCrop, arenaPosition, wall);
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
      const movement = stepTutorialMovement({
        state: movementState,
        actor: player,
        wall: tutorialWorld.wall,
        keys: movementKeys,
      });
      player = movement.actor;
      movementState = movement.state;
      actorState = requestTutorialActorMotion(actorState, movement.nextAnim);
      if (movement.aim) player.aim = movement.aim;
      arenaPosition = advanceTutorialArenaPosition(arenaPosition, player.position, wall, STAGE);
      actorState = advanceTutorialActorPlayback(actorState, source);
      accumulated -= TICK_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  render();
  window.addEventListener('keydown', (event) => {
    const bit = KEY_BITS[event.code];
    if (!bit) return;
    event.preventDefault();
    if (bit === TUTORIAL_MOVEMENT_KEYS.UP && !event.repeat) {
      const jump = beginTutorialMovementJump({ state: movementState, actor: player });
      player = jump.actor;
      movementState = jump.state;
      if (jump.nextAnim) actorState = requestTutorialActorMotion(actorState, jump.nextAnim);
      return;
    }
    movementKeys |= bit;
  });
  window.addEventListener('keyup', (event) => {
    const bit = KEY_BITS[event.code];
    if (!bit) return;
    event.preventDefault();
    if (bit !== TUTORIAL_MOVEMENT_KEYS.UP) movementKeys &= ~bit;
  });
  canvas.dataset.ready = 'true';
  window.tutorialSceneReady = true;
  requestAnimationFrame(frame);
} catch (reason) {
  error.textContent = reason.message;
  canvas.dataset.ready = 'false';
  window.tutorialSceneReady = false;
}
