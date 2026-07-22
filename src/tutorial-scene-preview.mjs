import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, beginTutorialActorGunAction, createTutorialActorPlayback, requestTutorialActorMotion, sampleTutorialActorPlayback, synchronizeTutorialActorWeapon } from './tutorial-actor-playback.mjs';
import { applyCampaignOneSessionFrame } from './campaign-one-session.mjs';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from './tutorial-arena-camera.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { traceTutorialLineBullet } from './tutorial-bullet-line-runtime.mjs';
import { renderTutorialLineBullet } from './tutorial-bullet-line-renderer.mjs';
import { advanceTutorialGunRuntime, createTutorialGunRuntime, tutorialPlayerMouseDown, tutorialPlayerMouseUp } from './tutorial-gun-runtime.mjs';
import { advanceTutorialPlayerAim, canvasPointToTutorialStage, tutorialArenaPointer } from './tutorial-aim-runtime.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';
import { applyTutorialBulletEnvironmentHit, applyTutorialFootContact } from './tutorial-world.mjs';
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
  let gunState = null;
  let movementState = createTutorialMovementState({ noJump: player.noJump });
  let movementKeys = 0;
  let arenaPosition = { x: 0, y: 0 };
  let stageMouse = { x: STAGE.width * 0.5, y: STAGE.height * 0.5 };
  let aimState = { aimX: player.position.x + 200, aimY: player.position.y - 50, aimRotation: 0, reloadRotation: 0 };
  let sourceLineTraces = [];
  let previous = performance.now();
  let accumulated = 0;

  function sourceArmHolder() {
    const rootFrame = unitTimeline.frames[actorState.rootState.frame - 1];
    const holder = rootFrame?.find(([id]) => id === 'arm1hold');
    if (!holder) throw new Error(`original UnitMC arm holder is unavailable: ${actorState.rootState.frame}`);
    return { x: holder[1], y: holder[2] };
  }

  function syncPlayerRestrictionsFromSourceSession() {
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    if (!sourcePlayer) throw new Error('Campaign 1 source player is unavailable');
    player = {
      ...player,
      noAim: sourcePlayer.noAim,
      noJump: sourcePlayer.noJump,
      guns: { ...sourcePlayer.guns },
    };
    // Campaign 1 state eight calls setGuns('USP2', 'none').  Only the two
    // source weapon arm spans currently decoded here may become visible.
    if (player.guns.active === 'USP2' && actorState.weaponId !== 'USP2') {
      actorState = synchronizeTutorialActorWeapon(actorState, 'USP2');
    } else if (player.guns.active === 'M4' && actorState.weaponId !== 'M4') {
      actorState = synchronizeTutorialActorWeapon(actorState, 'M4');
    }
    // `unitInfo.amm` is now the decoded initial SD save value. USP2 is
    // noAmmo, but passing the original multiplier keeps this setGuns port
    // valid when the decoded Campaign state changes weapon.
    if ((player.guns.active === 'USP2' || player.guns.active === 'none') && gunState?.gunId !== player.guns.active) {
      gunState = createTutorialGunRuntime({ gunId: player.guns.active, ammoMultiplier: player.sourcePlayerProfile.ammo });
    } else if (player.guns.active !== 'USP2' && player.guns.active !== 'none') {
      gunState = null;
    }
    movementState = { ...movementState, noJump: player.noJump };
  }

  function syncPlayerCollisionState() {
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    if (!sourcePlayer) throw new Error('Campaign 1 source player collision record is unavailable');
    sourcePlayer.position = { ...player.position };
    sourcePlayer.scaleX = aimState.flip ? -1 : 1;
    sourcePlayer.crouching = movementState.crouching;
  }

  function render() {
    context.clearRect(0, 0, STAGE.width, STAGE.height);
    drawParallax(layers.sky, skyCrop, arenaPosition, wall);
    drawParallax(layers.map, backgroundCrop, arenaPosition, wall);
    drawArena(layers.terrain, terrainCrop, arenaPosition);
    const screen = worldToTutorialScreen(player.position, arenaPosition);
    const sample = sampleTutorialActorPlayback(actorState, source, { aim: aimState });
    // `none` and later weapons outside this decoded source subset must remain
    // invisible rather than borrowing M4 or USP2 art.
    const pose = player.guns.active === actorState.weaponId
      ? sample.pose
      : { ...sample.pose, gunParts: [], muzzleParts: [] };
    context.save();
    context.translate(screen.x, screen.y);
    drawTutorialUnitPose(context, pose, assets);
    context.restore();
    // Game creates lineCont after unitCont within Arena.midCont, then clears
    // it once per source frame. Draw the same source trace above this frame's
    // unit layers using Arena's x/y translation.
    for (const trace of sourceLineTraces) {
      renderTutorialLineBullet(context, trace, (point) => worldToTutorialScreen(point, arenaPosition));
    }
  }

  function frame(now) {
    accumulated += Math.min(now - previous, 250);
    previous = now;
    while (accumulated >= TICK_MS) {
      // Game.EnterFrame clears lineCont before Player/Guns may add a fresh
      // Bullet_Line_Basic trace in this source frame.
      sourceLineTraces = [];
      applyCampaignOneSessionFrame(session);
      syncPlayerRestrictionsFromSourceSession();
      const armHolder = sourceArmHolder();
      aimState = advanceTutorialPlayerAim(aimState, {
        actor: player,
        arenaMouse: tutorialArenaPointer(stageMouse, arenaPosition),
        armHolder,
        mcRotation: movementState.rotation,
        jumping: movementState.jumping,
        noAim: player.noAim,
        reloading: gunState?.reloading ?? false,
        stageMouse,
      });
      player = { ...player, flip: aimState.flip, aim: { x: aimState.aimX, y: aimState.aimY } };
      syncPlayerCollisionState();
      let gunTick = { fired: false };
      if (gunState) {
        gunTick = advanceTutorialGunRuntime(gunState, {
          human: player.human,
          unit: {
            aim: player.sourcePlayerProfile.aim,
            crouching: movementState.crouching,
            jumping: movementState.jumping,
            xVelocity: movementState.xVel,
            // Guns.reflecting is false on original setGuns construction;
            // no decoded Tutorial state has changed it yet.
            reflecting: false,
          },
        });
        gunState = gunTick.state;
        if (gunTick.fired) {
          actorState = beginTutorialActorGunAction(actorState, gunTick.action);
          const trace = traceTutorialLineBullet({
            gunId: gunTick.bullet.gunId,
            shooter: {
              id: player.id,
              team: player.team,
              position: player.position,
              aimRotation: aimState.aimRotation,
              mcRotation: movementState.rotation,
              armY: armHolder.y,
              scaleX: aimState.flip ? -1 : 1,
              dynRecoil: gunTick.bullet.dynRecoil,
              dynRecoilMod: gunTick.bullet.dynRecoilMod,
            },
            wall: tutorialWorld.wall,
            units: session.actors,
          });
          sourceLineTraces.push(trace);
          if (trace.hit?.type === 'wall') applyTutorialBulletEnvironmentHit(tutorialWorld, trace.impact);
        }
      }
      const movement = stepTutorialMovement({
        state: movementState,
        actor: player,
        wall: tutorialWorld.wall,
        keys: movementKeys,
      });
      player = movement.actor;
      movementState = movement.state;
      syncPlayerCollisionState();
      applyTutorialFootContact(tutorialWorld, {
        x: player.position.x,
        y: player.position.y + 1,
        human: player.human,
      });
      syncPlayerRestrictionsFromSourceSession();
      actorState = requestTutorialActorMotion(actorState, movement.nextAnim);
      if (movement.aim) aimState = { ...aimState, aimX: movement.aim.x, aimY: movement.aim.y };
      arenaPosition = advanceTutorialArenaPosition(arenaPosition, player.position, wall, STAGE);
      actorState = advanceTutorialActorPlayback(actorState, source, { advanceArm: !gunTick.fired });
      accumulated -= TICK_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  render();
  canvas.addEventListener('mousemove', (event) => {
    stageMouse = canvasPointToTutorialStage(event, canvas.getBoundingClientRect());
  });
  canvas.addEventListener('mousedown', (event) => {
    if (event.button !== 0 || !gunState) return;
    event.preventDefault();
    stageMouse = canvasPointToTutorialStage(event, canvas.getBoundingClientRect());
    // Player.MouseDown() changes only mDown; the subsequent source tick owns
    // Guns.shoot(), shotPressed and uint shootDelay.
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    gunState = tutorialPlayerMouseDown(gunState, { gameStarted: true, noShoot: Boolean(sourcePlayer?.definition?.extra?.noShoot) });
  });
  canvas.addEventListener('mouseup', (event) => {
    if (event.button !== 0 || !gunState) return;
    gunState = tutorialPlayerMouseUp(gunState);
  });
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
