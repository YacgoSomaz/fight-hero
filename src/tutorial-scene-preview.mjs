import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, beginTutorialActorGunAction, createTutorialActorPlayback, requestTutorialActorMotion, sampleTutorialActorPlayback, synchronizeTutorialActorWeapon } from './tutorial-actor-playback.mjs';
import { applyCampaignOneSessionDeath } from './campaign-one-session.mjs';
import { enqueueCampaignOneSourceInput } from './campaign-one-tick-runtime.mjs';
import { advanceTutorialArenaPosition, getTutorialParallaxLayerPosition, worldToTutorialScreen } from './tutorial-arena-camera.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { traceTutorialLineBullet } from './tutorial-bullet-line-runtime.mjs';
import { applyTutorialLineBulletHit } from './tutorial-bullet-hit-effects.mjs';
import { renderTutorialLineBullet } from './tutorial-bullet-line-renderer.mjs';
import { advanceTutorialPlayerAim, canvasPointToTutorialStage, deriveTutorialUnitAim, tutorialArenaPointer } from './tutorial-aim-runtime.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';
import { getTutorialUnitOverheadHud } from './tutorial-unit-overhead-hud.mjs';
import { getTutorialUnitOverheadIcon } from './tutorial-unit-overhead-icon.mjs';
import { getTutorialUnitJugMarker } from './tutorial-unit-jug-marker.mjs';
import { getTutorialUnitOverheadLabels, TUTORIAL_UNIT_OVERHEAD_FONT } from './tutorial-unit-overhead-labels.mjs';
import { getTutorialDownArrowRenderPlan } from './tutorial-down-arrow-render-plan.mjs';
import { getTutorialEnvironmentRenderPlan } from './tutorial-environment-render-plan.mjs';
import { drawTutorialEnvironment } from './tutorial-environment-renderer.mjs';
import { advanceTutorialWorldGameTick, applyTutorialBulletEnvironmentHit } from './tutorial-world.mjs';
import { loadTutorialWorld } from './tutorial-world-loader.mjs';
import { createTutorialMovementState, TUTORIAL_MOVEMENT_KEYS } from './tutorial-movement.mjs';
import { drawVectorRuntimeSprite } from './vector-runtime-renderer.mjs';
import { drawRuntimeShape } from './vector-shape-canvas.mjs';
import { getHudAmmoBoxes } from './hud-ammo.mjs';
import { getHudExperienceRenderPlan } from './hud-experience-render-plan.mjs';
import { getHudScorebarRenderPlan } from './hud-scorebar-render-plan.mjs';
import { getHudTextFields } from './hud-text-source.mjs';
import { getTutorialSpeakRenderPlan } from './tutorial-speak-render-plan.mjs';
import { drawTutorialSpeak } from './tutorial-speak-renderer.mjs';
import { TUTORIAL_SPEAK_SOURCE_ASSETS } from './tutorial-speak-source.mjs';

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

async function loadOriginalHudFonts() {
  if (typeof FontFace !== 'function' || !document.fonts) {
    throw new Error('original Hud 1540 fonts cannot be loaded in this browser');
  }
  const fonts = await Promise.all([
    new FontFace('QTypeSquare-Bold_12pt_st', 'url(./public/assets/original-swf/hud-font-979.ttf)').load(),
    new FontFace('QTypeSquare-Bold_10pt_st', 'url(./public/assets/original-swf/hud-exp-font-981.ttf)').load(),
  ]);
  fonts.forEach((font) => document.fonts.add(font));
  return fonts;
}

async function loadOriginalSpeakFonts() {
  if (typeof FontFace !== 'function' || !document.fonts) {
    throw new Error('original Speak_187 fonts cannot be loaded in this browser');
  }
  const fonts = await Promise.all([
    new FontFace('QTypeSquare-Medium', 'url(./public/assets/original-swf/tutorial-speak/font-1485.ttf)').load(),
    new FontFace('QTypeSquare-Book_10pt_st', 'url(./public/assets/original-swf/tutorial-speak/font-800.ttf)').load(),
  ]);
  fonts.forEach((font) => document.fonts.add(font));
  return fonts;
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
  const [layers, unitTimeline, downArrowRuntime, environmentTimelineRuntime, speakTimelineRuntime, speakPortraitTimelineRuntime, assets, tutorialWorld, unitBarImage, unitIconImages, unitJugMarkerImage, originalUnitOverheadFont, environmentAssets, originalHudFonts, originalSpeakFonts, tutorialHudAssets, tutorialSpeakAssets] = await Promise.all([
    loadMapLayers(visual),
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    fetch('./public/assets/tutorial-down-arrow-vector-runtime.local.json').then((response) => {
      if (!response.ok) throw new Error(`Tutorial DownArrow runtime failed to load (${response.status})`);
      return response.json();
    }),
    fetch('./public/assets/tutorial-environment-timeline-runtime.local.json').then((response) => {
      if (!response.ok) throw new Error(`Tutorial environment runtime failed to load (${response.status})`);
      return response.json();
    }),
    fetch('./public/assets/tutorial-speak-timeline-runtime.local.json').then((response) => {
      if (!response.ok) throw new Error(`Tutorial Speak runtime failed to load (${response.status})`);
      return response.json();
    }),
    fetch('./public/assets/tutorial-speak-portrait-timeline-runtime.local.json').then((response) => {
      if (!response.ok) throw new Error(`Tutorial Speak portrait runtime failed to load (${response.status})`);
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
    Promise.all([
      './public/assets/original-swf/tutorial-environment/1359.svg',
      './public/assets/original-swf/tutorial-environment/1360.svg',
      './public/assets/original-swf/tutorial-environment/1387.svg',
    ].map(loadImage)).then(([doorMask, doorPanel, elevator]) => ({ doorMask, doorPanel, elevator })),
    loadOriginalHudFonts(),
    loadOriginalSpeakFonts(),
    Promise.all([
      './public/assets/original-swf/hud-scorebar-1462.png',
      './public/assets/original-swf/hud-exp-base-1474.svg',
      './public/assets/original-swf/hud-exp-green-1475.svg',
      './public/assets/original-swf/hud-exp-fill-699-source.svg',
      './public/assets/original-swf/hud-gunsmenu-724-m4-frame20.png',
    ].map(loadImage)).then(([scorebar, expBase, expGreen, expFill, m4]) => ({ scorebar, expBase, expGreen, expFill, m4 })),
    Promise.all([
      ...Object.entries(TUTORIAL_SPEAK_SOURCE_ASSETS.chrome).map(async ([character, source]) => ['chrome', Number(character), await loadImage(source)]),
      ...Object.entries(TUTORIAL_SPEAK_SOURCE_ASSETS.portraits).map(async ([character, source]) => ['portraits', Number(character), await loadImage(source)]),
    ]).then((records) => records.reduce((result, [kind, character, image]) => {
      result[kind][character] = image;
      return result;
    }, { chrome: {}, portraits: {} })),
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
  let movementState = createTutorialMovementState({ noJump: player.noJump });
  let movementKeys = 0;
  let playerJumpRequested = false;
  let arenaPosition = { x: 0, y: 0 };
  let stageMouse = { x: STAGE.width * 0.5, y: STAGE.height * 0.5 };
  let aimState = { aimX: player.position.x + 200, aimY: player.position.y - 50, aimRotation: 0, reloadRotation: 0 };
  let sourceLineTraces = [];
  let previous = performance.now();
  let accumulated = 0;

  // This companion source timeline documents the exact 200-frame head clip
  // selected by Hud.setMsg().  Rendering still uses the same direct source
  // Shape selected through that original frame number.
  if (speakPortraitTimelineRuntime.symbolId !== 666 || originalSpeakFonts.length !== 2) {
    throw new Error('original Speak portrait runtime is unavailable');
  }

  // Verification-only mirror of the records that this renderer already
  // consumes.  It deliberately adds no stage art or alternative physics: a
  // browser test can compare the exact source-tick camera and Unit position
  // to the visible 800×600 frame.
  function publishTutorialSourceSnapshot() {
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    canvas.dataset.sourceGameFrame = String(tutorialWorld.tickRuntime.gameFrame);
    canvas.dataset.sourceArenaPosition = `${arenaPosition.x},${arenaPosition.y}`;
    canvas.dataset.sourcePlayerPosition = sourcePlayer?.position
      ? `${sourcePlayer.position.x},${sourcePlayer.position.y}`
      : '';
  }

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
      position: sourcePlayer.position ? { ...sourcePlayer.position } : player.position,
      flip: sourcePlayer.scaleX < 0,
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
    movementState = sourcePlayer.movementState
      ? { ...sourcePlayer.movementState, noJump: player.noJump }
      : { ...movementState, noJump: player.noJump };
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

  function renderTutorialDownArrows() {
    const arrows = getTutorialDownArrowRenderPlan(session.hud.arrows, tutorialWorld.tickRuntime.tick, arenaPosition);
    for (const arrow of arrows) {
      context.save();
      context.translate(arrow.x, arrow.y);
      context.transform(arrow.matrix.scaleX, arrow.matrix.rotateSkew0, arrow.matrix.rotateSkew1, arrow.matrix.scaleY, 0, 0);
      drawVectorRuntimeSprite(context, downArrowRuntime, 1395, arrow.frame, drawRuntimeShape);
      context.restore();
    }
  }

  function renderTutorialEnvironment() {
    const environmentPlan = getTutorialEnvironmentRenderPlan(session.environment, environmentTimelineRuntime, arenaPosition);
    drawTutorialEnvironment(context, environmentPlan, environmentAssets, {
      createCanvas: (width, height) => {
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        return sourceCanvas;
      },
    });
  }

  // Direct Canvas transcription of Hud.as:drawBox().  The box geometry,
  // alpha and local -1/-1 bulletCont transform come from the original AS3;
  // all other visible HUD artwork below is loaded from Hud 1540 exports.
  function renderTutorialAmmo(gunRuntime, sourceGun) {
    const boxes = getHudAmmoBoxes({
      clip: gunRuntime.ammo.clipCur,
      clipMax: gunRuntime.ammo.clipMax,
      type: sourceGun.effect.hudBullet,
    });
    context.save();
    context.translate(664.3, 571.3);
    context.scale(-1, -1);
    context.lineWidth = 0.5;
    for (const box of boxes) {
      const alpha = box.filled ? 1 : 0.2;
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.strokeStyle = `rgba(255, 255, 255, ${box.filled ? 1 : 0.4})`;
      context.fillRect(box.x, box.y, box.width, box.height);
      context.strokeRect(box.x, box.y, box.width, box.height);
    }
    context.restore();
  }

  function renderTutorialExperience(save) {
    const experience = getHudExperienceRenderPlan({ level: save.level, exp: save.exp });
    context.save();
    context.translate(experience.holder.x, experience.holder.y);
    context.drawImage(tutorialHudAssets.expBase, experience.base.x, experience.base.y);
    context.drawImage(tutorialHudAssets.expGreen, experience.green.x, experience.green.y);
    context.save();
    context.scale(experience.bar.scaleX, 1);
    context.transform(
      experience.bar.matrix.a,
      experience.bar.matrix.b,
      experience.bar.matrix.c,
      experience.bar.matrix.d,
      experience.bar.matrix.x,
      experience.bar.matrix.y,
    );
    context.drawImage(tutorialHudAssets.expFill, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.globalAlpha = experience.bar.color.alpha;
    context.fillStyle = `rgb(${experience.bar.color.red}, ${experience.bar.color.green}, ${experience.bar.color.blue})`;
    context.fillRect(0, 0, experience.bar.sourceBounds.width, experience.bar.sourceBounds.height);
    context.restore();
    context.globalAlpha = 1;
    context.fillStyle = '#ffffff';
    context.font = `${experience.text.fontPx}px "${experience.text.fontFamily}"`;
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillText(experience.text.text, experience.text.x, experience.text.y);
    context.restore();
  }

  // Hud 1540 has an authored ScoreBar child at (180,23), ammo holder 954 at
  // (664.3,571.3), curgun 724 and expholder 1477.  Read all live values from
  // the same Campaign session consumed by the source Game tick; this page
  // intentionally has no independently designed HUD state.
  function renderTutorialHud() {
    const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
    if (!sourcePlayer?.status || !sourcePlayer?.unitInfo || !sourcePlayer.gunRuntime || !sourcePlayer.gun?.curGun) return;
    const sourceGun = sourcePlayer.gun.curGun;
    const scorebar = getHudScorebarRenderPlan({
      mode: session.match.mode,
      team1: 1,
      score1: session.match.team1score,
      team2: 2,
      score2: session.match.team2score,
      scoreLimit: session.match.scoreLimit,
    });
    context.drawImage(tutorialHudAssets.scorebar, scorebar.holder.x, scorebar.holder.y);
    context.save();
    context.translate(scorebar.holder.x, scorebar.holder.y);
    context.fillStyle = '#ffffff';
    context.font = '10px "QTypeSquare-Bold_10pt_st"';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    for (const value of Object.values(scorebar.text)) {
      context.fillText(value.text, value.matrix.x, value.matrix.y);
    }
    context.restore();

    renderTutorialAmmo(sourcePlayer.gunRuntime, sourceGun);
    if (sourceGun.id === 'M4') {
      context.save();
      context.transform(1.7536468505859375, -0.5263671875, 0.5263671875, 1.7536468505859375, 674.2, 568);
      context.drawImage(tutorialHudAssets.m4, 0, 0);
      context.restore();
    }
    const fields = getHudTextFields({
      className: sourcePlayer.unitInfo.name,
      hp: sourcePlayer.status.hpCur,
      level: sourcePlayer.unitInfo.level,
      weaponName: sourceGun.name,
      spare: sourcePlayer.gunRuntime.ammo.spareCur,
    });
    context.save();
    context.fillStyle = '#ffffff';
    context.textBaseline = 'top';
    for (const field of fields) {
      context.globalAlpha = field.alpha;
      context.textAlign = field.align;
      context.font = `${field.fontPx}px "${field.fontFamily}"`;
      context.fillText(field.text, field.x, field.y);
    }
    context.restore();
    renderTutorialExperience(session.classSaves[sourcePlayer.unitInfo.number]);
  }

  function renderTutorialSpeak() {
    const target = session.hud.message?.target;
    const speaker = target && session.actors.find((actor) => actor.id === (target === 'player' ? 'unit0' : target));
    const speakPlan = getTutorialSpeakRenderPlan({
      hud: session.hud,
      speaker,
      timeline: speakTimelineRuntime,
    });
    if (!speakPlan) return;
    drawTutorialSpeak(context, speakPlan, tutorialSpeakAssets, {
      createCanvas: (width, height) => {
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = width;
        sourceCanvas.height = height;
        return sourceCanvas;
      },
    });
  }

  function render() {
    context.clearRect(0, 0, STAGE.width, STAGE.height);
    drawParallax(layers.sky, skyCrop, arenaPosition, wall);
    drawParallax(layers.map, backgroundCrop, arenaPosition, wall);
    drawArena(layers.terrain, terrainCrop, arenaPosition);
    renderTutorialEnvironment();
    renderTutorialDownArrows();
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
    renderTutorialHud();
    renderTutorialSpeak();
    publishTutorialSourceSnapshot();
  }

  function frame(now) {
    try {
    accumulated += Math.min(now - previous, 250);
    previous = now;
    while (accumulated >= TICK_MS) {
      // Game.EnterFrame clears lineCont before Player/Guns may add a fresh
      // Bullet_Line_Basic trace in this source frame.
      sourceLineTraces = [];
      syncPlayerRestrictionsFromSourceSession();
      syncSceneActorStates();
      // UnitMC's previous-frame transform is what Bullet_Line_Basic sees if
      // an AI shoots in this frame. The source Game tick below then updates
      // each actor, rather than batching all NPC phases in the browser.
      syncSceneActorAimStates();
      const armHolder = sourceArmHolder();
      aimState = advanceTutorialPlayerAim(aimState, {
        actor: player,
        arenaMouse: tutorialArenaPointer(stageMouse, arenaPosition),
        armHolder,
        mcRotation: movementState.rotation,
        jumping: movementState.jumping,
        noAim: player.noAim,
        reloading: session.actors.find(({ id }) => id === 'unit0')?.gunRuntime?.reloading ?? false,
        stageMouse,
      });
      player = { ...player, flip: aimState.flip, aim: { x: aimState.aimX, y: aimState.aimY } };
      const sourcePlayerBeforeUnits = session.actors.find(({ id }) => id === 'unit0');
      const playerWasDead = Boolean(sourcePlayerBeforeUnits?.dead);
      const sourcePlayerBeforeTick = session.actors.find(({ id }) => id === 'unit0');
      if (!sourcePlayerBeforeTick) throw new Error('Campaign 1 source player is unavailable for Game tick');
      Object.assign(sourcePlayerBeforeTick, {
        scaleX: aimState.flip ? -1 : 1,
        aimRotation: aimState.aimRotation,
        mcRotation: movementState.rotation,
        armY: armHolder.y,
      });
      const sourceTick = advanceTutorialWorldGameTick(tutorialWorld, {
        playerKeys: movementKeys,
        playerJumpRequested,
        onLineBullet({ actorId, bullet }) {
          const sourceActor = session.actors.find(({ id }) => id === actorId);
          if (!sourceActor) throw new Error(`Campaign 1 line bullet has no source actor: ${actorId}`);
          Object.assign(sourceActor, { dynRecoil: bullet.dynRecoil, dynRecoilMod: bullet.dynRecoilMod });
          const trace = traceTutorialLineBullet({
            gunId: bullet.gunId,
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
        },
      });
      playerJumpRequested = false;
      const sourcePlayer = session.actors.find(({ id }) => id === 'unit0');
      const playerRespawned = Boolean(playerWasDead && !sourcePlayer?.dead);
      if (playerRespawned) {
        synchronizePlayerSourceRespawn();
      }
      syncPlayerRestrictionsFromSourceSession();
      syncSceneActorStates();
      for (const result of sourceTick.actorResults) {
        if (result.id === 'unit0') {
          if (result.shot.fired) actorState = beginTutorialActorGunAction(actorState, result.shot.action);
          if (result.tail?.movement) actorState = requestTutorialActorMotion(actorState, result.tail.movement.nextAnim);
          continue;
        }
        let sceneActorState = sceneActorStates.get(result.id);
        if (!sceneActorState) continue;
        if (result.shot.fired) sceneActorState = beginTutorialActorGunAction(sceneActorState, result.shot.action);
        if (result.tail?.movement) sceneActorState = requestTutorialActorMotion(sceneActorState, result.tail.movement.nextAnim);
        sceneActorStates.set(result.id, sceneActorState);
      }
      syncSceneActorAimStates();
      for (const sourceActor of session.actors) {
        if (sourceActor.id === 'unit0' || !sourceActor.spawned || !sourceActor.visible || sourceActor.dead) continue;
        const sceneActorState = sceneActorStates.get(sourceActor.id);
        if (sceneActorState) sceneActorStates.set(sourceActor.id, advanceTutorialActorPlayback(sceneActorState, source));
      }
      if (!sourcePlayer?.dead) {
        arenaPosition = advanceTutorialArenaPosition(arenaPosition, player.position, wall, STAGE);
        // Player.spawn() returns immediately after UnitMC.goto('idle'), so a
        // fresh source actor must retain that frame for this tick.
        if (!playerRespawned) actorState = advanceTutorialActorPlayback(actorState, source, { advanceArm: !sourceTick.actorResults[0]?.shot?.fired });
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
    if (event.button !== 0) return;
    event.preventDefault();
    stageMouse = canvasPointToTutorialStage(event, canvas.getBoundingClientRect());
    enqueueCampaignOneSourceInput(tutorialWorld.tickRuntime, { type: 'mouseDown' });
  });
  canvas.addEventListener('mouseup', (event) => {
    if (event.button !== 0) return;
    enqueueCampaignOneSourceInput(tutorialWorld.tickRuntime, { type: 'mouseUp' });
  });
  window.addEventListener('keydown', (event) => {
    if (!event.repeat && (event.code === 'KeyQ' || event.code === 'ShiftLeft' || event.code === 'ShiftRight')) {
      event.preventDefault();
      enqueueCampaignOneSourceInput(tutorialWorld.tickRuntime, { type: 'swapGuns' });
      return;
    }
    const bit = KEY_BITS[event.code];
    if (!bit) return;
    event.preventDefault();
    if (bit === TUTORIAL_MOVEMENT_KEYS.UP && !event.repeat) {
      playerJumpRequested = true;
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
