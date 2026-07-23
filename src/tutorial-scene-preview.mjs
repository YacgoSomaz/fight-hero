import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, beginTutorialActorGunAction, createTutorialActorPlayback, requestTutorialActorMotion, sampleTutorialActorPlayback, synchronizeTutorialActorWeapon } from './tutorial-actor-playback.mjs';
import { advanceCampaignOneSessionAi, advanceCampaignOneSessionAiGuns, advanceCampaignOneSessionAiMovement, advanceCampaignOneSessionUnits, applyCampaignOneSessionDeath, applyCampaignOneSessionFrame, applyCampaignOneSessionPlayerGunSwap } from './campaign-one-session.mjs';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from './tutorial-arena-camera.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { traceTutorialLineBullet } from './tutorial-bullet-line-runtime.mjs';
import { applyTutorialLineBulletHit } from './tutorial-bullet-hit-effects.mjs';
import { renderTutorialLineBullet } from './tutorial-bullet-line-renderer.mjs';
import { advanceTutorialGunRuntime, tutorialPlayerMouseDown, tutorialPlayerMouseUp } from './tutorial-gun-runtime.mjs';
import { advanceTutorialPlayerAim, canvasPointToTutorialStage, deriveTutorialUnitAim, tutorialArenaPointer } from './tutorial-aim-runtime.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';
import { getTutorialUnitOverheadHud } from './tutorial-unit-overhead-hud.mjs';
import { getTutorialUnitOverheadIcon } from './tutorial-unit-overhead-icon.mjs';
import { getTutorialUnitJugMarker } from './tutorial-unit-jug-marker.mjs';
import { getTutorialUnitOverheadLabels, TUTORIAL_UNIT_OVERHEAD_FONT } from './tutorial-unit-overhead-labels.mjs';
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

function reportTutorialSceneFailure(reason) {
  error.textContent = reason instanceof Error ? reason.message : String(reason);
  canvas.dataset.ready = 'false';
  window.tutorialSceneReady = false;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Tutorial source image failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

async function loadOriginalUnitOverheadFont() {
  if (typeof FontFace !== 'function' || !document.fonts) {
    throw new Error('original Unit 683 font cannot be loaded in this browser');
  }
  const font = await new FontFace(
    TUTORIAL_UNIT_OVERHEAD_FONT.fontFamily,
    `url(${TUTORIAL_UNIT_OVERHEAD_FONT.assetSrc})`,
  ).load();
  document.fonts.add(font);
  return font;
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
  const [layers, unitTimeline, assets, tutorialWorld, unitBarImage, unitIconImages, unitJugMarkerImage] = await Promise.all([
    loadMapLayers(visual),
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    loadTutorialUnitPoseAssets({ loadImage }),
    loadTutorialWorld(),
    loadImage('./public/assets/original-swf/unit-bar-670.png'),
    Promise.all([
      './public/assets/original-swf/unit-icon-682-sniper-frame1.png',
      './public/assets/original-swf/unit-icon-682-medic-frame2.png',
      './public/assets/original-swf/unit-icon-682-soldier-frame3.png',
      './public/assets/original-swf/unit-icon-682-tank-frame4.png',
    ].map(async (source) => [source, await loadImage(source)])),
    loadImage('./public/assets/original-swf/unit-jug-marker-686.png'),
    loadOriginalUnitOverheadFont(),
  ]);
  const unitIcons = new Map(unitIconImages);
  const skyCrop = getMapLayerCrop(visual.sky);
  const backgroundCrop = getMapLayerCrop(visual.background);
  const terrainCrop = getMapLayerCrop(visual.terrain);
  const session = tutorialWorld.session;
  const wall = { width: tutorialWorld.wall.width, height: tutorialWorld.wall.height };
  const initialActorBindings = createTutorialActorBindings(session).actors;
  let [player] = initialActorBindings;
  const source = { unitTimeline, rootFrameActions: TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS, m4Runtime: assets.runtime, armCallbacks: TUTORIAL_M4_ARM_CALLBACKS };
  let actorState = createTutorialActorPlayback(player);
  const sceneActorStates = new Map(initialActorBindings
    .filter((binding) => binding.id !== 'unit0' && binding.spawned)
    .map((binding) => [binding.id, createTutorialActorPlayback(binding)]));
  const sceneActorAimStates = new Map(session.actors
    .filter((actor) => !actor.human && actor.spawned && actor.position)
    .map((actor) => [actor.id, {
      aimX: actor.aim?.x ?? actor.position.x,
      aimY: actor.aim?.y ?? actor.position.y,
      aimRotation: 0,
      reloadRotation: 0,
      flip: actor.scaleX < 0,
    }]));
  let gunState = null;
  let movementState = createTutorialMovementState({ noJump: player.noJump });
  let movementKeys = 0;
  let arenaPosition = { x: 0, y: 0 };
  let stageMouse = { x: STAGE.width * 0.5, y: STAGE.height * 0.5 };
  let aimState = { aimX: player.position.x + 200, aimY: player.position.y - 50, aimRotation: 0, reloadRotation: 0 };
  let sourceLineTraces = [];
  let previous = performance.now();
  let accumulated = 0;

  function sourceArmHolderFor(playbackState) {
    const rootFrame = unitTimeline.frames[playbackState.rootState.frame - 1];
    const holder = rootFrame?.find(([id]) => id === 'arm1hold');
    if (!holder) throw new Error(`original UnitMC arm holder is unavailable: ${playbackState.rootState.frame}`);
    return { x: holder[1], y: holder[2] };
  }

  function sourceArmHolder() {
    return sourceArmHolderFor(actorState);
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
    // The decoded pistol arm timeline is shared by USP and USP2, and the M4
    // has its own original rifle span.  Do not hide a source-selected weapon
    // merely because the prior page bridge named only two IDs. `none` remains
    // deliberately invisible until Campaign grants a real gun.
    if (player.guns.active !== 'none' && actorState.weaponId !== player.guns.active) {
      actorState = synchronizeTutorialActorWeapon(actorState, player.guns.active);
    }
    // There is exactly one Guns record per source actor slot.  Rendering may
    // support only a subset of arm timelines, but input and bullets still
    // consume this authoritative record (including M4) rather than making a
    // browser-only USP state or disabling the weapon outright.
    gunState = sourcePlayer.gunRuntime;
    movementState = { ...movementState, noJump: player.noJump };
  }

  function syncPlayerCollisionState() {
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    if (!sourcePlayer) throw new Error('Campaign 1 source player collision record is unavailable');
    // Player.EnterFrame returns immediately while Unit.die() owns this actor.
    // Never overwrite its corpse/respawn position with stale local input.
    if (sourcePlayer.dead) return;
    sourcePlayer.position = { ...player.position };
    sourcePlayer.scaleX = aimState.flip ? -1 : 1;
    sourcePlayer.crouching = movementState.crouching;
    sourcePlayer.movement = { xVelocity: movementState.xVel, yVelocity: movementState.yVel };
  }

  // Player.as calls unitSpawn() only after its dead-frame timer reaches zero.
  // The source session has then reset UnitMC, Movement, Status and the exact
  // Arena NodeSpawn position. Rebuild the visible binding from that session
  // record instead of continuing to display the dead local actor at its old
  // coordinate or borrowing a generic quick-match respawn.
  function synchronizePlayerSourceRespawn() {
    const binding = createTutorialActorBindings(session).actors.find(({ id }) => id === 'unit0');
    if (!binding?.spawned || !binding.position) throw new Error('Campaign 1 Player respawn has no source actor binding');
    player = binding;
    actorState = createTutorialActorPlayback(binding);
    movementState = createTutorialMovementState({ noJump: binding.noJump });
    movementKeys = 0;
    aimState = {
      aimX: binding.position.x + 200,
      aimY: binding.position.y - 50,
      aimRotation: 0,
      reloadRotation: 0,
    };
    gunState = session.actors.find(({ id }) => id === 'unit0')?.gunRuntime ?? null;
  }

  // Campaign actors retain their own source UnitMC child skin and the weapon
  // chosen by Stats_Campaign.  AI movement writes back through the same
  // source actor records, so this synchronisation preserves the UnitMC state
  // while replacing only the live source binding fields.
  function syncSceneActorStates() {
    const bindings = createTutorialActorBindings(session).actors;
    for (const binding of bindings) {
      if (binding.id === 'unit0' || !binding.spawned) continue;
      let sceneActorState = sceneActorStates.get(binding.id);
      if (!sceneActorState) {
        sceneActorStates.set(binding.id, createTutorialActorPlayback(binding));
        continue;
      }
      sceneActorState = { ...sceneActorState, actor: { ...sceneActorState.actor, ...binding, position: binding.position && { ...binding.position } } };
      if (binding.guns.active !== sceneActorState.weaponId) sceneActorState = synchronizeTutorialActorWeapon(sceneActorState, binding.guns.active);
      sceneActorStates.set(binding.id, sceneActorState);
    }
  }

  // AI.as has already smoothed the target coordinates. Unit.as consumes them
  // directly after MC.goto(nextAnim), using that actor's current arm holder
  // and its prior aimRoation for the original one-tick flip behavior.
  function syncSceneActorAimStates() {
    for (const sourceActor of session.actors) {
      if (sourceActor.human || !sourceActor.spawned || !sourceActor.visible || sourceActor.dead || !sourceActor.position) continue;
      const playbackState = sceneActorStates.get(sourceActor.id);
      if (!playbackState) continue;
      const previous = sceneActorAimStates.get(sourceActor.id) ?? {
        aimX: sourceActor.position.x,
        aimY: sourceActor.position.y,
        aimRotation: 0,
        reloadRotation: 0,
      };
      const target = sourceActor.aim ?? { x: previous.aimX, y: previous.aimY };
      const mcRotation = sourceActor.movementState?.rotation ?? 0;
      const aim = deriveTutorialUnitAim({ ...previous, aimX: target.x, aimY: target.y }, {
        actor: sourceActor,
        armHolder: sourceArmHolderFor(playbackState),
        mcRotation,
        jumping: Boolean(sourceActor.movementState?.jumping),
        reloading: false,
      });
      sceneActorAimStates.set(sourceActor.id, aim);
      sourceActor.scaleX = aim.flip ? -1 : 1;
      sourceActor.aimRotation = aim.aimRotation;
      sourceActor.mcRotation = mcRotation;
      sourceActor.armY = sourceArmHolderFor(playbackState).y;
    }
  }

  // Unit symbol 687 owns this display child independently of UnitMC. Its
  // decoded matrix and Status.setBars() width are consumed by the source HUD
  // plan; Canvas only reproduces Flash's ColorTransform with source-in.
  function drawTutorialUnitOverheadBar(bar) {
    if (bar.width <= 0) return;
    context.save();
    context.drawImage(unitBarImage, 0, 0, bar.sourceWidth, bar.sourceHeight, bar.x, bar.y, bar.width, bar.height);
    context.globalCompositeOperation = 'source-in';
    context.globalAlpha = bar.alpha ?? 1;
    context.fillStyle = bar.colour;
    context.fillRect(bar.x, bar.y, bar.width, bar.height);
    context.restore();
  }

  function drawTutorialUnitOverheadIcon(icon) {
    const image = unitIcons.get(icon.assetSrc);
    if (!image) throw new Error(`original Unit icon image is unavailable for frame ${icon.frame}`);
    context.save();
    context.drawImage(image, 0, 0, icon.sourceWidth, icon.sourceHeight, icon.x, icon.y, icon.width, icon.height);
    context.globalCompositeOperation = 'source-in';
    context.globalAlpha = icon.alpha;
    context.fillStyle = icon.colour;
    context.fillRect(icon.x, icon.y, icon.width, icon.height);
    context.restore();
  }

  function drawTutorialUnitJugMarker(marker) {
    if (!marker) return;
    context.drawImage(unitJugMarkerImage, 0, 0, 39, 13, marker.x, marker.y, marker.width, marker.height);
  }

  function renderTutorialUnitOverheadBar(unit) {
    if (!unit.status || !unit.position) return;
    const screen = worldToTutorialScreen(unit.position, arenaPosition);
    const hud = getTutorialUnitOverheadHud(unit, screen);
    // The Unit 687 Display List order is hp depth 1 → icon depth 3 → hurt
    // depth 6 → text depths 8/9, so damage tint cannot accidentally cover the
    // original class icon.
    drawTutorialUnitOverheadBar(hud.hp);
    drawTutorialUnitOverheadIcon(getTutorialUnitOverheadIcon(unit, screen));
    drawTutorialUnitOverheadBar(hud.hurt);
    renderTutorialUnitOverheadLabels(unit);
    drawTutorialUnitJugMarker(getTutorialUnitJugMarker(unit, screen));
  }

  function renderTutorialUnitOverheadLabels(unit) {
    if (!unit.status || !unit.position) return;
    const labels = getTutorialUnitOverheadLabels(unit, worldToTutorialScreen(unit.position, arenaPosition));
    for (const label of labels) {
      context.save();
      context.font = `${label.fontSize}px "${label.fontFamily}"`;
      context.textAlign = 'left';
      context.textBaseline = 'top';
      context.globalAlpha = label.alpha;
      context.fillStyle = label.colour;
      context.fillText(label.text, label.x, label.y);
      context.restore();
    }
  }

  function render() {
    context.clearRect(0, 0, STAGE.width, STAGE.height);
    drawParallax(layers.sky, skyCrop, arenaPosition, wall);
    drawParallax(layers.map, backgroundCrop, arenaPosition, wall);
    drawArena(layers.terrain, terrainCrop, arenaPosition);
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    if (sourcePlayer?.spawned && sourcePlayer.visible && !sourcePlayer.dead) {
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
      renderTutorialUnitOverheadBar(sourcePlayer);
    }
    // Game.units owns this authored order. Only live, visible source Units
    // receive an original UnitMC pose; a dead Unit is intentionally absent
    // until PhysActor rendering is separately ported.
    for (const sourceActor of session.actors) {
      if (sourceActor.id === 'unit0' || !sourceActor.spawned || !sourceActor.visible || sourceActor.dead || !sourceActor.position) continue;
      const sceneActorState = sceneActorStates.get(sourceActor.id);
      if (!sceneActorState) continue;
      const actorSample = sampleTutorialActorPlayback(sceneActorState, source, { aim: sceneActorAimStates.get(sourceActor.id) });
      const actorScreen = worldToTutorialScreen(sourceActor.position, arenaPosition);
      context.save();
      context.translate(actorScreen.x, actorScreen.y);
      drawTutorialUnitPose(context, actorSample.pose, assets);
      context.restore();
      renderTutorialUnitOverheadBar(sourceActor);
    }
    // Game creates lineCont after unitCont within Arena.midCont, then clears
    // it once per source frame. Draw the same source trace above this frame's
    // unit layers using Arena's x/y translation.
    for (const trace of sourceLineTraces) {
      renderTutorialLineBullet(context, trace, (point) => worldToTutorialScreen(point, arenaPosition));
    }
  }

  function frame(now) {
    try {
    accumulated += Math.min(now - previous, 250);
    previous = now;
    while (accumulated >= TICK_MS) {
      // Game.EnterFrame clears lineCont before Player/Guns may add a fresh
      // Bullet_Line_Basic trace in this source frame.
      sourceLineTraces = [];
      applyCampaignOneSessionFrame(session);
      syncPlayerRestrictionsFromSourceSession();
      syncSceneActorStates();
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
        const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
        if (!sourcePlayer) throw new Error('Campaign 1 source player is unavailable for Guns state');
        sourcePlayer.gunRuntimes[sourcePlayer.gunSlot] = gunState;
        sourcePlayer.gunRuntime = gunState;
        if (gunTick.fired) {
          actorState = beginTutorialActorGunAction(actorState, gunTick.action);
          Object.assign(sourcePlayer, {
            aimRotation: aimState.aimRotation,
            mcRotation: movementState.rotation,
            armY: armHolder.y,
            dynRecoil: gunTick.bullet.dynRecoil,
            dynRecoilMod: gunTick.bullet.dynRecoilMod,
          });
          const trace = traceTutorialLineBullet({
            gunId: gunTick.bullet.gunId,
            shooter: sourcePlayer,
            wall: tutorialWorld.wall,
            units: session.actors,
            corpses: session.corpses,
          });
          sourceLineTraces.push(trace);
          if (trace.hit?.type === 'wall') applyTutorialBulletEnvironmentHit(tutorialWorld, trace.impact);
          else {
            const hitOutcome = applyTutorialLineBulletHit({ trace, shooter: sourcePlayer });
            if (hitOutcome.died) applyCampaignOneSessionDeath(session, {
              target: trace.hit.target,
              attacker: sourcePlayer,
              gun: sourcePlayer.gun.curGun,
              extra: hitOutcome.extra,
            });
          }
        }
      }
      // AI.EnterFrame decides its source key flags before its UnitEnterFrame
      // tail calls Status/Guns/Movement.  First preserve those decisions,
      // then run the shared Status phase and consume keys with Movement.as.
      // This keeps AI collision out of the old generic browser controller.
      advanceCampaignOneSessionAi(session, { wall: tutorialWorld.wall, gameStarted: true });
      const aiGuns = advanceCampaignOneSessionAiGuns(session);
      for (const gun of aiGuns) {
        if (!gun.fired || !gun.bullet) continue;
        const sourceActor = session.actors.find(({ id }) => id === gun.id);
        const sceneActorState = sceneActorStates.get(gun.id);
        if (!sourceActor || !sceneActorState) continue;
        sceneActorStates.set(gun.id, beginTutorialActorGunAction(sceneActorState, gun.action));
        Object.assign(sourceActor, {
          dynRecoil: gun.bullet.dynRecoil,
          dynRecoilMod: gun.bullet.dynRecoilMod,
        });
        const trace = traceTutorialLineBullet({
          gunId: gun.bullet.gunId,
          shooter: sourceActor,
          wall: tutorialWorld.wall,
          units: session.actors,
          corpses: session.corpses,
        });
        sourceLineTraces.push(trace);
        if (trace.hit?.type === 'wall') applyTutorialBulletEnvironmentHit(tutorialWorld, trace.impact);
        else if (trace.hit) {
          const hitOutcome = applyTutorialLineBulletHit({ trace, shooter: sourceActor });
          if (hitOutcome.died) applyCampaignOneSessionDeath(session, {
            target: trace.hit.target,
            attacker: sourceActor,
            gun: sourceActor.gun.curGun,
            extra: hitOutcome.extra,
          });
        }
      }
      const sourcePlayerBeforeUnits = session.actors.find(({ id }) => id === 'unit0');
      const playerWasDead = Boolean(sourcePlayerBeforeUnits?.dead);
      advanceCampaignOneSessionUnits(session);
      const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
      const playerRespawned = Boolean(playerWasDead && !sourcePlayer?.dead);
      if (playerRespawned) {
        synchronizePlayerSourceRespawn();
        syncPlayerRestrictionsFromSourceSession();
      }
      const aiMovements = advanceCampaignOneSessionAiMovement(session, { wall: tutorialWorld.wall });
      syncSceneActorStates();
      for (const movement of aiMovements) {
        const sceneActorState = sceneActorStates.get(movement.id);
        if (sceneActorState) sceneActorStates.set(movement.id, requestTutorialActorMotion(sceneActorState, movement.nextAnim));
      }
      syncSceneActorAimStates();
      for (const sourceActor of session.actors) {
        if (sourceActor.id === 'unit0' || !sourceActor.spawned || !sourceActor.visible || sourceActor.dead) continue;
        const sceneActorState = sceneActorStates.get(sourceActor.id);
        if (sceneActorState) sceneActorStates.set(sourceActor.id, advanceTutorialActorPlayback(sceneActorState, source));
      }
      if (!sourcePlayer?.dead) {
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
        // Player.spawn() returns immediately after UnitMC.goto('idle'), so a
        // fresh source actor must retain that frame for this tick.
        if (!playerRespawned) actorState = advanceTutorialActorPlayback(actorState, source, { advanceArm: !gunTick.fired });
      }
      accumulated -= TICK_MS;
    }
    render();
    requestAnimationFrame(frame);
    } catch (reason) {
      reportTutorialSceneFailure(reason);
    }
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
    if (!event.repeat && (event.code === 'KeyQ' || event.code === 'ShiftLeft' || event.code === 'ShiftRight')) {
      event.preventDefault();
      applyCampaignOneSessionPlayerGunSwap(session);
      syncPlayerRestrictionsFromSourceSession();
      return;
    }
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
  reportTutorialSceneFailure(reason);
}
