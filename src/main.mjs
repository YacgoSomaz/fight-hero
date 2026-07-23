import { RIFLE_ARM_BASE_ANGLE, UNITMC_FRAMES, createWorld, getAimPivot, step } from './engine.mjs';
import { getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera, worldToScreen } from './camera.mjs';
import { AudioBank } from './audio.mjs';
import { applyRoomState, joinPrivateRoom, sendRoomInput } from './online.mjs';
import { selectM4Action } from './m4-action-selector.mjs';
import { drawVectorRuntimeFrame } from './vector-runtime-renderer.mjs';
import { drawRuntimeShape } from './vector-shape-canvas.mjs';
import { MENU_SCREEN_ASSETS } from './menu-assets.mjs';
import { DEFAULT_MENU_SCREEN, MENU_CHINESE_COPY, MENU_PRESENTATION_MODE, MENU_QUICK_SUMMARY_TOP, MENU_TRANSLATION_TOP, getMenuHitAreas, getMissionEntries } from './menu-ui.mjs';
import { createMatchSelection, cycleQuickMatchSelection, formatQuickMatchSummary, getQuickMatchStatus, isPlayableSelection, updateMatchSelection } from './menu-state.mjs';
import { getSourceMissionLaunch } from './source-mission-launch.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { loadMapLayers } from './map-loader.mjs';
import { loadSourceWallMask } from './source-wall-loader.mjs';
import { prepareSourceMapWorld } from './source-map-world.mjs';
import { commitStartedGameFrame } from './game-start-render.mjs';
import { getDomMapLayerLayout } from './dom-map-layer.mjs';
import { getObjectiveVisual } from './objective-visuals.mjs';
import { SHOW_COLLISION_OVERLAYS, SHOW_PLAYER_PROBES } from './scene-presentation.mjs';
import { getUnitOverheadHud } from './unit-status.mjs';
import { getUnitRenderPlan } from './unit-render-plan.mjs';
import { getUnitDomRigFrame } from './unit-dom-rig.mjs';
import { ORIGINAL_AIMER } from './aimer-source.mjs';
import { getOriginalAimerRig } from './aimer-rig.mjs';
import { getHudAmmoBoxes } from './hud-ammo.mjs';
import { getHudTextFields } from './hud-text-source.mjs';
import { getHudExperienceRenderPlan } from './hud-experience-render-plan.mjs';
import { getFoundryForegroundRuntimePlan } from './foundry-foreground-runtime.mjs';
import { createFoundryForegroundDomLayer, renderFoundryForegroundDomLayer } from './foundry-foreground-dom.mjs';
import { advanceFoundryWorldTimeline, createFoundryWorldTimeline } from './foundry-world-timeline.mjs';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const reset = document.querySelector('#reset');
const start = document.querySelector('#start');
const difficulty = document.querySelector('#difficulty');
const difficultyValue = document.querySelector('#difficultyValue');
const roomInput = document.querySelector('#room');
const music = document.querySelector('#music');
const saveStatus = document.querySelector('#saveStatus');
const sourceMenu = document.querySelector('#sourceMenu');
const menuSurface = document.querySelector('#menuSurface');
const menuImage = document.querySelector('#menuImage');
const menuButtons = document.querySelector('#menuButtons');
const menuOverlay = document.querySelector('#menuOverlay');
const menuTranslation = document.querySelector('#menuTranslation');
const sourceStatus = document.querySelector('#sourceStatus');
const gameStage = document.querySelector('#gameStage');
const mapBackdrop = document.querySelector('#mapBackdrop');
const actorOverlay = document.querySelector('#actorOverlay');
const leaveGame = document.querySelector('#leaveGame');
const SAVE_KEY = 'fight-hero/private-foundry-v2';
const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
const audio = new AudioBank({ muted: Boolean(saved.muted) });
let sky = new Image();
let map = new Image();
let terrain = new Image();
let foundryForeground = null;
let foundryWorldTimeline = null;
let foundryTimelineAccumulator = 0;
const actorSprites = new Map();
function isFoundryMap(mapId) { return mapId === 'foundry' || mapId === 'foundry2'; }
function commitMapLayers(next, mapId) {
  sky = next.sky;
  map = next.map;
  terrain = next.terrain;
  for (const [role, layer] of [['sky', sky], ['background', map], ['terrain', terrain]]) {
    layer.className = 'map-layer';
    layer.dataset.mapLayer = role;
  }
  foundryForeground = isFoundryMap(mapId) ? createFoundryForegroundDomLayer(document) : null;
  mapBackdrop.replaceChildren(sky, map, foundryForeground ?? terrain);
}
async function loadMapWorld(options = {}) {
  const prepared = await prepareSourceMapWorld({
    options,
    createWorld,
    getMapVisual,
    getMapLayerCrop,
    loadMapLayers,
    loadSourceWallMask,
  });
  commitMapLayers(prepared.layers, prepared.mapId);
  foundryWorldTimeline = isFoundryMap(prepared.mapId) ? createFoundryWorldTimeline(prepared.mapId) : null;
  foundryTimelineAccumulator = 0;
  saveStatus.textContent = `原始墙体已加载：symbol ${prepared.wall.source.characterId} / frame ${prepared.wall.frame} · ${prepared.wall.mask.width}×${prepared.wall.mask.height}`;
  return prepared.world;
}
function image(source) { const result = new Image(); result.src = source; return result; }
// Fallback while the decoded UnitMC matrix data is loading.
const unitSkin = image('./public/assets/unit-parts/unit-idle.png');
// Raw DefineSprite 670 export: Unit uses it for both bar_hp and bar_hurt.
const unitHealthBarSprite = image('./public/assets/original-swf/unit-bar-670.png');
const unitParts = {
  // Complete UnitMC rifle-idle arm assemblies: rifle label frame 77, M4 gun
  // child frame 20, and the selected Medic skin subparts.
  rifleArm: image('./public/assets/unit-parts/full/rifle_arm_rifle_idle.png'),
  frontArm: image('./public/assets/unit-parts/full/front_arm_rifle_idle.png'),
  body: image('./public/assets/unit-parts/tight/body.png'),
  head: image('./public/assets/unit-parts/tight/head.png'),
  foot: image('./public/assets/unit-parts/tight/foot.png'),
  legLower: image('./public/assets/unit-parts/tight/leg_lower.png'),
  legUpper: image('./public/assets/unit-parts/tight/leg_upper.png'),
};
let unitTimeline = null;
let m4VectorRuntime = null;
fetch('./public/assets/unitmc-timeline.json').then((response) => {
  if (!response.ok) throw new Error(`UnitMC timeline ${response.status}`);
  return response.json();
}).then((data) => { unitTimeline = data; }).catch(() => { unitTimeline = null; });
fetch('./public/assets/m4-vector-runtime.local.json').then((response) => {
  if (!response.ok) throw new Error(`Local M4 vector runtime ${response.status}`);
  return response.json();
}).then((data) => { m4VectorRuntime = data; saveStatus.textContent = '原 M4 矢量动作已加载（仅本机）'; }).catch(() => { m4VectorRuntime = null; });
const muzzleFlashSprite = { complete: false, naturalWidth: 0 };
// Direct crop of the original Aimer (symbol 1431, frame 1).  It deliberately
// replaces the old Canvas circle/plus fallback rather than approximating it.
const originalAimerSprite = image(ORIGINAL_AIMER.source);
const originalAimerPartSprites = new Map([
  ['./public/assets/original-swf/aimer-line-1424.png', image('./public/assets/original-swf/aimer-line-1424.png')],
  ['./public/assets/original-swf/aimer-circle-1428-frame1.png', image('./public/assets/original-swf/aimer-circle-1428-frame1.png')],
]);
// Hud 1540.curgun is GunsMenu 724; M4 resolves to that timeline's label
// frame 20. This is the source HUD icon, not the world-gun render.
const hudM4MenuSprite = image('./public/assets/original-swf/hud-gunsmenu-724-m4-frame20.png');
// Direct FFDec exports of Hud 1540 children. Their positions below are the
// original 800x600 Hud Display List anchors, not a responsive redesign.
const hudScorebarSprite = image('./public/assets/original-swf/hud-scorebar-1462.png');
const hudExpBaseSprite = image('./public/assets/original-swf/hud-exp-base-1474.svg');
const hudExpGreenSprite = image('./public/assets/original-swf/hud-exp-green-1475.svg');
const hudExpFillSprite = image('./public/assets/original-swf/hud-exp-fill-699-source.svg');
// DefineFont3 979/981 were directly exported from the SWF. Do not substitute
// system-ui for QTypeSquare-Bold_12pt_st or QTypeSquare-Bold_10pt_st.
if (typeof FontFace === 'function' && document.fonts) {
  void Promise.all([
    new FontFace('QTypeSquare-Bold_12pt_st', 'url(./public/assets/original-swf/hud-font-979.ttf)').load(),
    new FontFace('QTypeSquare-Bold_10pt_st', 'url(./public/assets/original-swf/hud-exp-font-981.ttf)').load(),
  ]).then((fonts) => fonts.forEach((font) => document.fonts.add(font))).catch(() => {});
}
const objectiveSprites = new Map();
function getObjectiveSprite(mode, team) {
  const visual = getObjectiveVisual(mode, team);
  if (!visual) return null;
  if (!objectiveSprites.has(visual.source)) objectiveSprites.set(visual.source, image(visual.source));
  return { visual, sprite: objectiveSprites.get(visual.source) };
}
let world = createWorld({ foundry: true });
let camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
let last = performance.now();
const held = new Set();
const controls = { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS', reload: 'KeyR', fire: 'KeyF' };
const pointer = { x: canvas.width * 0.75, y: canvas.height * 0.52 };
let mouseFire = false;
let mouseFirePressed = false;
let running = false;
let online = null;
let onlineAccumulator = 0;
let matchSelection = createMatchSelection();
let quickSelectionChanged = false;
let quickStatus = '';
const selectedMissionIndex = { campaign: 0, challenges: 0 };
void loadMapWorld({ foundry: true }).then((nextWorld) => {
  world = nextWorld;
  camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
}).catch((error) => { saveStatus.textContent = `原始墙体加载失败：${error.message}`; });

function addQuickValue(name, text, left, top, width, selected = false) {
  const value = document.createElement('span');
  value.className = 'menu-value';
  value.dataset.value = name;
  value.style.setProperty('--value-left', `${left}%`);
  value.style.setProperty('--value-top', `${top}%`);
  value.style.setProperty('--value-width', `${width}%`);
  if (selected) value.dataset.selected = 'true';
  value.textContent = text;
  menuOverlay.append(value);
}

function renderMissionOverlay(screen) {
  menuOverlay.replaceChildren();
  const selected = selectedMissionIndex[screen] ?? 0;
  const missions = getMissionEntries(screen);
  missions.forEach((mission, index) => {
    addQuickValue(
      `${screen}-mission-${mission.stage}`,
      `第 ${mission.stage} 关 · ${mission.title}`,
      25.6,
      33.5 + index * 2.42,
      19.3,
      index === selected,
    );
  });
  const selectedMission = missions[selected];
  if (selectedMission) {
    const status = getQuickMatchStatus(updateMatchSelection(matchSelection, selectedMission));
    // This margin lies below the unmodified source-art navigation strip. It
    // makes a rejected source mission actionable rather than a dead button.
    addQuickValue('mission-availability', status.message, 25.0, MENU_QUICK_SUMMARY_TOP, 50.0);
  }
}

function renderQuickmatchOverlay() {
  menuOverlay.replaceChildren();
  if (!quickSelectionChanged) return;
  const summary = `${formatQuickMatchSummary(matchSelection)}${quickStatus ? ` · ${quickStatus}` : ''}`;
  addQuickValue('summary', summary, 25.0, MENU_QUICK_SUMMARY_TOP, 50.0);
}

function showSourceMenu(screen = 'home') {
  const asset = MENU_SCREEN_ASSETS[screen];
  const copy = MENU_CHINESE_COPY[screen] ?? MENU_CHINESE_COPY.home;
  menuSurface.dataset.screen = screen;
  menuSurface.dataset.presentation = MENU_PRESENTATION_MODE;
  menuImage.src = `./public/assets/${asset.file}`;
  menuImage.alt = `原始 SWF ${screen} 菜单画面`;
  menuSurface.style.setProperty('--menu-translation-top', `${MENU_TRANSLATION_TOP}%`);
  menuTranslation.textContent = `${copy.title} · ${copy.availability}`;
  menuButtons.replaceChildren(...getMenuHitAreas(screen).map((area) => {
    const button = document.createElement('button');
    button.id = area.id;
    button.className = 'menu-hit';
    button.type = 'button';
    button.setAttribute('aria-label', area.label);
    button.dataset.menuAction = area.action;
    button.style.setProperty('--menu-left', `${area.left}%`);
    button.style.setProperty('--menu-top', `${area.top}%`);
    button.style.setProperty('--menu-width', `${area.width}%`);
    button.style.setProperty('--menu-height', `${area.height}%`);
    return button;
  }));
  sourceStatus.textContent = `原始 SWF 菜单帧：${asset.symbol} / 第 ${asset.frame} 帧 · 仅在可见原图控件上创建点击入口。`;
  if (screen === 'quickmatch') renderQuickmatchOverlay();
  else if (screen === 'campaign' || screen === 'challenges') renderMissionOverlay(screen);
  else menuOverlay.replaceChildren();
  running = false;
  gameStage.hidden = true;
  sourceMenu.hidden = false;
  if (!audio.muted) audio.startMenu();
}

function saveSettings() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ muted: audio.muted, difficulty: Number(difficulty.value), score: world.score }));
  saveStatus.textContent = `已保存：P1 ${world.score.p1 ?? 0} 击倒 · AI ${world.score.bot1 ?? 0} 击倒`;
}
difficulty.value = saved.difficulty ?? 6;
difficultyValue.value = difficulty.value;
matchSelection = createMatchSelection({ difficulty: Number(difficulty.value) });
music.checked = !audio.muted;
saveStatus.textContent = saved.score ? `读取存档：P1 ${saved.score.p1 ?? 0} 击倒` : '本地存档尚未创建';
difficulty.addEventListener('input', () => { difficultyValue.value = difficulty.value; if (world.bots[0]) world.bots[0].ai.difficulty = Number(difficulty.value); saveSettings(); });
music.addEventListener('change', () => { audio.setMuted(!music.checked); if (music.checked && !running) audio.startMenu(); saveSettings(); });
async function launchSelectedMatch() {
  const sourceMissionLaunch = getSourceMissionLaunch(matchSelection);
  if (sourceMissionLaunch) {
    window.location.assign(sourceMissionLaunch.href);
    return;
  }
  if (!isPlayableSelection(matchSelection)) {
    quickSelectionChanged = true;
    quickStatus = getQuickMatchStatus(matchSelection).message;
    if (menuSurface.dataset.screen === 'quickmatch') renderQuickmatchOverlay();
    else renderMissionOverlay(menuSurface.dataset.screen);
    return;
  }
  try {
    const room = roomInput.value.trim();
    if (room) {
      online = await joinPrivateRoom(room);
      world = await loadMapWorld({ multiplayer: true, foundry: true });
      applyRoomState(world, online.state);
      start.textContent = `房间 ${room} · ${online.slot.toUpperCase()}`;
    } else {
      online = null;
      world = await loadMapWorld({ mapId: matchSelection.map, mode: matchSelection.mode, score: matchSelection.score });
      world.matchSettings = { ...matchSelection };
      world.bots.forEach((bot) => { bot.ai.difficulty = matchSelection.difficulty; });
      start.textContent = '战斗中';
    }
    camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
    running = true; sourceMenu.hidden = true; gameStage.hidden = false; audio.stopMenu(); audio.play('click');
    commitStartedGameFrame(render);
    saveSettings();
  } catch (error) { saveStatus.textContent = `启动失败：${error.message}`; }
}
start.addEventListener('click', () => { void launchSelectedMatch(); });

function selectMission(kind, index) {
  const mission = getMissionEntries(kind)[index];
  if (!mission) return;
  selectedMissionIndex[kind] = index;
  matchSelection = updateMatchSelection(matchSelection, mission);
  quickSelectionChanged = true;
  quickStatus = isPlayableSelection(matchSelection) ? '' : getQuickMatchStatus(matchSelection).message;
  renderMissionOverlay(kind);
}

menuButtons.addEventListener('click', (event) => {
  const action = event.target.closest('[data-menu-action]')?.dataset.menuAction;
  if (action?.startsWith('show:')) showSourceMenu(action.split(':')[1]);
  else if (action?.startsWith('mission:')) {
    const [, kind, sourceIndex] = action.split(':');
    selectMission(kind, Number(sourceIndex));
  }
  else if (action?.startsWith('quick:mode:')) {
    matchSelection = updateMatchSelection(matchSelection, { mode: action.split(':')[2] });
    quickSelectionChanged = true; quickStatus = isPlayableSelection(matchSelection) ? '' : 'NOT MIGRATED'; renderQuickmatchOverlay();
  } else if (action?.startsWith('quick:')) {
    const [, control, sourceDirection] = action.split(':');
    matchSelection = cycleQuickMatchSelection(matchSelection, control, Number(sourceDirection));
    quickSelectionChanged = true; quickStatus = isPlayableSelection(matchSelection) ? '' : 'NOT MIGRATED'; renderQuickmatchOverlay();
  } else if (action === 'start:selected-match') {
    void launchSelectedMatch();
  } else if (action?.startsWith('start:mission:')) {
    const kind = action.split(':')[2];
    selectMission(kind, selectedMissionIndex[kind] ?? 0);
    void launchSelectedMatch();
  }
});
leaveGame.addEventListener('click', () => showSourceMenu('home'));
showSourceMenu(DEFAULT_MENU_SCREEN);

for (const type of ['keydown', 'keyup']) {
  window.addEventListener(type, (event) => {
    if (Object.values(controls).includes(event.code)) event.preventDefault();
    if (type === 'keydown' && event.code === 'KeyM') { audio.setMuted(!audio.muted); music.checked = !audio.muted; saveSettings(); }
    if (type === 'keydown') held.add(event.code);
    else held.delete(event.code);
  });
}
window.addEventListener('blur', () => { held.clear(); mouseFire = false; mouseFirePressed = false; });
reset.addEventListener('click', async () => {
  online = null;
  world = await loadMapWorld({ mapId: matchSelection.map, mode: matchSelection.mode, score: matchSelection.score });
  world.bots[0].ai.difficulty = Number(difficulty.value);
  camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  running = true;
  commitStartedGameFrame(render);
  saveSettings();
});

function updatePointer(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = Math.max(0, Math.min(canvas.width, (event.clientX - bounds.left) * canvas.width / bounds.width));
  pointer.y = Math.max(0, Math.min(canvas.height, (event.clientY - bounds.top) * canvas.height / bounds.height));
}

canvas.addEventListener('pointermove', updatePointer);
canvas.addEventListener('pointerdown', (event) => {
  updatePointer(event);
  mouseFire = event.button === 0;
  if (mouseFire) {
    mouseFirePressed = true;
    event.preventDefault();
  }
});
window.addEventListener('pointerup', () => { mouseFire = false; });
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

function inputForPlayer() {
  const aim = screenToWorld(pointer, camera, canvas.width, canvas.height);
  const firePressed = mouseFirePressed;
  mouseFirePressed = false;
  return {
    ...Object.fromEntries(Object.entries(controls).map(([action, key]) => [action, held.has(key)])),
    fire: held.has(controls.fire) || mouseFire,
    firePressed,
    aimX: aim.x,
    aimY: aim.y,
  };
}

function drawHud() {
  const player = world.players[0];
  ctx.fillStyle = 'rgba(3, 8, 17, .76)';
  ctx.fillRect(0, 0, canvas.width, 66);
  if (hudScorebarSprite.complete && hudScorebarSprite.naturalWidth) {
    ctx.drawImage(hudScorebarSprite, 180, 23);
  }
  ctx.fillStyle = player.color;
  ctx.fillRect(28, 20, 210, 10);
  ctx.fillStyle = '#3b1620';
  ctx.fillRect(28 + player.hp / player.maxHp * 210, 20, 210 - player.hp / player.maxHp * 210, 10);
  ctx.fillStyle = '#f3f7ff';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText(`P1  HP ${player.hp}/${player.maxHp}  ·  ${world.score.p1 ?? 0} 击倒`, 28, 53);
  ctx.textAlign = 'left';
}

function drawBottomHud() {
  const player = world.players[0];
  const hudY = canvas.height - 24;
  const ammoX = canvas.width - 335;
  const clip = player.weapon.clip;

  const ammoBoxes = getHudAmmoBoxes({ clip, clipMax: player.weapon.clipMax, type: player.weapon.ammoType });
  // Hud 1540.bulletCont (character 954) is placed at (664.3,571.3) with
  // both axes inverted. Its local drawBox coordinates therefore grow left/up
  // on the original 800x600 screen.
  ctx.save();
  ctx.translate(664.3, 571.3);
  ctx.scale(-1, -1);
  ctx.lineWidth = 0.5;
  for (const box of ammoBoxes) {
    const alpha = box.filled ? 1 : 0.2;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${box.filled ? 1 : 0.4})`;
    ctx.fillRect(box.x, box.y, box.width, box.height);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  }
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#f4f2ea';
  ctx.font = '700 17px system-ui';
  if (player.weapon.reloadRemaining) ctx.fillText('RELOAD', ammoX + 123, hudY - 63);
  ctx.strokeStyle = 'rgba(255, 255, 255, .82)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ammoX - 22, hudY - 7);
  ctx.lineTo(ammoX + 238, hudY - 7);
  ctx.lineTo(ammoX + 252, hudY - 22);
  ctx.stroke();

  if (hudM4MenuSprite.complete && hudM4MenuSprite.naturalWidth) {
    // Hud 1540 frame 1: curgun character 724 at (674.2,568) with this
    // Flash matrix. Preserve it rather than applying a generic HUD scale.
    ctx.save();
    ctx.transform(1.7536468505859375, -0.5263671875, 0.5263671875, 1.7536468505859375, 674.2, 568);
    ctx.drawImage(hudM4MenuSprite, 0, 0);
    ctx.restore();
  }

  const sourceTextFields = getHudTextFields({ className: player.className, hp: player.hp, level: player.level, weaponName: player.weapon.name, spare: player.weapon.spare });
  // 979=QTypeSquare-Bold_12pt_st and 981=QTypeSquare-Bold_10pt_st.
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  for (const field of sourceTextFields) {
    ctx.globalAlpha = field.alpha;
    ctx.textAlign = field.align;
    ctx.font = `${field.fontPx}px "${field.fontFamily}"`;
    ctx.fillText(field.text, field.x, field.y);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const experience = getHudExperienceRenderPlan({ level: player.level, exp: player.exp });
  ctx.save();
  ctx.translate(experience.holder.x, experience.holder.y);
  if (hudExpBaseSprite.complete && hudExpBaseSprite.naturalWidth) ctx.drawImage(hudExpBaseSprite, experience.base.x, experience.base.y);
  if (hudExpGreenSprite.complete && hudExpGreenSprite.naturalWidth) ctx.drawImage(hudExpGreenSprite, experience.green.x, experience.green.y);
  if (hudExpFillSprite.complete && hudExpFillSprite.naturalWidth) {
    // Flash changes bar_exp.width.  Scale the entire source x-axis before the
    // nested 918 matrix so the source skew, 699 geometry and width semantics
    // remain coupled instead of clipping a flattened 1477 image.
    ctx.save();
    ctx.scale(experience.bar.scaleX, 1);
    ctx.transform(experience.bar.matrix.a, experience.bar.matrix.b, experience.bar.matrix.c, experience.bar.matrix.d, experience.bar.matrix.x, experience.bar.matrix.y);
    ctx.drawImage(hudExpFillSprite, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.globalAlpha = experience.bar.color.alpha;
    ctx.fillStyle = `rgb(${experience.bar.color.red}, ${experience.bar.color.green}, ${experience.bar.color.blue})`;
    ctx.fillRect(0, 0, experience.bar.sourceBounds.width, experience.bar.sourceBounds.height);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${experience.text.fontPx}px "${experience.text.fontFamily}"`;
  ctx.fillText(experience.text.text, experience.text.x, experience.text.y);
  ctx.restore();
  ctx.restore();
}

function drawAimer(player) {
  const arm = worldToScreen(getAimPivot(player), camera, canvas.width, canvas.height);
  const rig = getOriginalAimerRig({ pointer, arm, dynRecoilMod: player.aimerDynRecoilMod });
  const partSprites = rig.parts.map((part) => originalAimerPartSprites.get(part.source));
  if (partSprites.some((sprite) => !sprite?.complete || !sprite.naturalWidth)) {
    // Loading fallback is also an extracted original Aimer frame, never a
    // Canvas approximation. It disappears as soon as source parts are ready.
    if (originalAimerSprite.complete && originalAimerSprite.naturalWidth) ctx.drawImage(originalAimerSprite, pointer.x - ORIGINAL_AIMER.origin.x, pointer.y - ORIGINAL_AIMER.origin.y, ORIGINAL_AIMER.width, ORIGINAL_AIMER.height);
    return;
  }
  rig.parts.forEach((part, index) => {
    const sprite = partSprites[index];
    ctx.save();
    ctx.translate(part.x, part.y);
    // The decoded SWF child matrix has only its linear a/b/c/d terms;
    // part.x/y is the separate Display List placement already applied above.
    // Canvas requires six arguments, so preserve the source translation with
    // zero local e/f terms instead of passing an invalid four-argument call.
    ctx.transform(...part.matrix, 0, 0);
    ctx.scale(part.width / sprite.naturalWidth, part.height / sprite.naturalHeight);
    ctx.drawImage(sprite, -part.origin.x, -part.origin.y);
    ctx.restore();
  });
}

function drawPlayer(player) {
  if (!player.alive) return;
  const screen = worldToScreen(player, camera, canvas.width, canvas.height);
  const height = 76;

  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.scale(player.facing, 1);
  const frame = unitTimeline?.frames?.[player.animationFrame - 1];
  const renderPlan = getUnitRenderPlan({
    alive: player.alive,
    hasTimeline: Boolean(frame),
    hasParts: Object.values(unitParts).every((sprite) => sprite.complete && sprite.naturalWidth),
  });
  // This complete source frame remains behind the optional rig. It prevents a
  // partially decoded/vector arm frame from erasing the only visible unit.
  if (unitSkin.complete && unitSkin.naturalWidth) {
    ctx.drawImage(unitSkin, -37, -84, 75, 90);
  } else {
    ctx.fillStyle = '#838b59';
    ctx.fillRect(-12, -56, 24, 56);
  }
  if (renderPlan.includes('timeline-rig')) {
    // This is the UnitMC root display list, not a synthetic walk cycle.  Each
    // row comes from the original SWF frame after Place/Remove tags have been
    // resolved.  The fixed Medic art is selected once (frame 51), while the
    // original root matrices continue to drive every body part per frame.
    // UnitMC uses Flash's 30fps discrete timeline.  Interpolating its
    // separately authored limb matrices produces poses that never existed in
    // the SWF, so retain the decoded display-list frame verbatim.
    const items = Object.fromEntries(frame.map(([name, x, y, scaleX, scaleY, skewX, skewY]) => [name, { x, y, scaleX, scaleY, skewX, skewY }]));
    const headHold = items.headhold;
    const armHold = items.arm1hold;
    let localAim = player.aimAngle;
    if (player.facing < 0) localAim = Math.atan2(Math.sin(Math.PI - localAim), Math.cos(Math.PI - localAim));
    const drawPart = (name, sprite, offsetX, offsetY, aimFactor = null) => {
      const item = items[name];
      if (!item) return;
      const anchor = name === 'head' ? headHold : (name === 'arm1' || name === 'arm2' ? armHold : item);
      if (!anchor) return;
      ctx.save();
      ctx.translate(anchor.x, anchor.y);
      if (aimFactor === null) {
        // A SWF MATRIX maps to Canvas as [scaleX, rotateSkew0,
        // rotateSkew1, scaleY].  The earlier b/c swap reversed the leg
        // rotation and moved its registration point away from the hip.
        ctx.transform(item.scaleX, item.skewX, item.skewY, item.scaleY, 0, 0);
      }
      else {
        // Unit.as overwrites only these three rotations every tick; their
        // translation stays on the original head/arm holder of this frame.
        const scaleX = Math.hypot(item.scaleX, item.skewX);
        const scaleY = Math.hypot(item.skewY, item.scaleY);
        ctx.scale(scaleX, scaleY);
        // The reconstructed rifle canvas has a +6.01° barrel tilt in its
        // zero pose.  Cancel it for the two arm assemblies so the rendered
        // barrel points along the same ray used by engine.mjs for bullets.
        const armCorrection = name === 'arm1' || name === 'arm2' ? -RIFLE_ARM_BASE_ANGLE : 0;
        ctx.rotate(localAim * aimFactor + armCorrection);
        if (name === 'arm1') ctx.translate(-player.recoil * 2, 0);
      }
      if (m4VectorRuntime && (name === 'arm1' || name === 'arm2')) {
        const action = selectM4Action(player, world.muzzleFlashes.some(({ owner }) => owner === player.id));
        const side = name === 'arm1' ? 'rear' : 'front';
        const frames = m4VectorRuntime.actions[action.label][side];
        const actionFrame = frames[Math.min(action.frame - 1, frames.length - 1)];
        drawVectorRuntimeFrame(ctx, m4VectorRuntime, actionFrame.items, drawRuntimeShape, { childFrames: m4VectorRuntime.childFrames });
        ctx.restore();
        return;
      }
      ctx.drawImage(sprite, offsetX, offsetY);
      ctx.restore();
    };

    // These are the exact local Shape bounds read from the child UnitMC
    // sprites (506/539/569/599/632).  The same child symbol is used for both
    // legs, so each pair deliberately shares an origin; per-leg hand tuning
    // was the source of the visible broken skeleton.
    // Composite source-label assemblies retain the original hand/gun
    // placement, rather than freezing arm1/arm2 on an unrelated reload frame.
    drawPart('arm1', unitParts.rifleArm, -8, -15, 1);
    drawPart('foot2', unitParts.foot, 1.5, 0);
    drawPart('leglow2', unitParts.legLower, -9.45, -3.3);
    drawPart('legup2', unitParts.legUpper, -5.5, -2.95);
    drawPart('foot1', unitParts.foot, 1.5, 0);
    drawPart('leglow1', unitParts.legLower, -9.45, -3.3);
    drawPart('legup1', unitParts.legUpper, -5.5, -2.95);
    drawPart('body', unitParts.body, -11.95, -15);
    drawPart('head', unitParts.head, -5.6, -18, .6);
    drawPart('arm2', unitParts.frontArm, -2, -5, 1);
  }
  ctx.restore();
  if (player.hitTimer) {
    ctx.save();
    ctx.globalAlpha = player.hitTimer / .16;
    ctx.fillStyle = '#ff6d63';
    ctx.beginPath(); ctx.arc(screen.x, screen.y - 42, 29, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  const status = getUnitOverheadHud(player, screen, height);
  ctx.save();
  ctx.font = '700 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillStyle = player.isBot ? '#ffb7a8' : '#eaf0d5';
  ctx.fillText(status.label, status.labelX, status.labelY);
  ctx.restore();
  if (unitHealthBarSprite.complete && unitHealthBarSprite.naturalWidth) {
    // Retain the alpha/anti-aliased silhouette from the SWF export and apply
    // Unit.setBarColour's runtime transform rather than drawing a substitute.
    ctx.save();
    ctx.drawImage(unitHealthBarSprite, 0, 0, status.bar.sourceWidth, status.bar.sourceHeight, status.bar.x, status.bar.y, status.bar.width, status.bar.sourceHeight);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = status.bar.colour;
    ctx.fillRect(status.bar.x, status.bar.y, status.bar.width, status.bar.sourceHeight);
    ctx.restore();
  }
  ctx.textAlign = 'left';
}

function renderActorOverlay() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  const active = new Set();
  for (const player of world.players) {
    active.add(player.id);
    let actor = actorSprites.get(player.id);
    if (!actor) {
      const root = document.createElement('div');
      root.className = 'actor-unit';
      const sprite = image('./public/assets/unit-parts/unit-idle.png');
      sprite.className = 'actor-sprite';
      const rig = document.createElement('div');
      rig.className = 'actor-rig';
      root.append(sprite, rig);
      actor = { root, sprite, rig, parts: new Map() };
      actorSprites.set(player.id, actor);
      actorOverlay.append(root);
    }
    const screen = worldToScreen(player, camera, canvas.width, canvas.height);
    const scale = width / canvas.width;
    actor.root.hidden = !player.alive;
    actor.root.style.left = `${screen.x * scale}px`;
    actor.root.style.top = `${screen.y * scale}px`;
    actor.root.style.transform = `scale(${scale * player.facing}, ${scale})`;
    const rig = getUnitDomRigFrame({
      frames: unitTimeline?.frames,
      frameNumber: player.animationFrame,
      aimAngle: player.aimAngle,
      facing: player.facing,
      recoil: player.recoil,
    });
    // Keep the complete original source sprite only until the decoded
    // UnitMC frame is available.  Once it is, every visible limb comes from
    // the original body-part export and original frame matrix below.
    actor.sprite.hidden = !player.alive || rig.length >= 1;
    actor.rig.hidden = !player.alive || rig.length === 0;
    const activeParts = new Set();
    for (const part of rig) {
      activeParts.add(part.id);
      let node = actor.parts.get(part.id);
      if (!node) {
        const imageNode = image(part.source);
        const wrapper = document.createElement('span');
        wrapper.className = 'actor-rig-part';
        wrapper.append(imageNode);
        actor.parts.set(part.id, { wrapper, image: imageNode });
        actor.rig.append(wrapper);
        node = actor.parts.get(part.id);
      }
      const [a, b, c, d] = part.matrix;
      node.wrapper.hidden = false;
      node.wrapper.style.left = `${part.position.x}px`;
      node.wrapper.style.top = `${part.position.y}px`;
      node.wrapper.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, 0, 0)`;
      node.image.style.left = `${part.offset.x}px`;
      node.image.style.top = `${part.offset.y}px`;
    }
    for (const [id, node] of actor.parts) node.wrapper.hidden = !activeParts.has(id);
  }
  for (const [id, actor] of actorSprites) {
    if (!active.has(id)) { actor.root.remove(); actorSprites.delete(id); }
  }
}

function drawPlayerCollider(player) {
  if (!player.alive) return;
  const screen = worldToScreen(player, camera, canvas.width, canvas.height);
  const height = player.crouching ? player.hitbox.crouchHeight : player.hitbox.height;
  const radius = player.hitbox.halfWidth;
  const top = screen.y - height;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 205, 66, .16)';
  ctx.strokeStyle = 'rgba(255, 224, 99, .95)';
  ctx.lineWidth = 1.25;
  // The runtime collision is a 34×55 AABB, not a capsule.  Display the same
  // rectangle that horizontal/vertical resolution uses so the debug view is
  // trustworthy.
  ctx.fillRect(screen.x - radius, top, radius * 2, height);
  ctx.strokeRect(screen.x - radius + .5, top + .5, radius * 2 - 1, height - 1);
  // Movement.as uses these bottom probes: centre for ground, ±17 for sides.
  ctx.fillStyle = '#fff4a9';
  for (const x of [screen.x - radius, screen.x, screen.x + radius]) {
    ctx.beginPath(); ctx.arc(x, screen.y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawTracer(bullet) {
  const end = worldToScreen(bullet, camera, canvas.width, canvas.height);
  const start = worldToScreen({ x: bullet.x - bullet.vx * 0.055, y: bullet.y - bullet.vy * 0.055 }, camera, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255, 255, 196, .3)'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 196, .6)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
}

function drawMuzzleFlash(flash) {
  const screen = worldToScreen(flash, camera, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(flash.angle);
  if (muzzleFlashSprite.complete && muzzleFlashSprite.naturalWidth) {
    ctx.drawImage(muzzleFlashSprite, 0, 0, muzzleFlashSprite.naturalWidth, muzzleFlashSprite.naturalHeight, 0, -12, 30, 24);
  } else {
    ctx.fillStyle = 'rgba(255, 231, 122, .95)';
    ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(4, -10); ctx.lineTo(9, 0); ctx.lineTo(4, 10); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawObjectives() {
  if (world.mode === 'ctf') {
    for (const flag of world.objectives.flags) {
      if (flag.carrierId) continue;
      const asset = getObjectiveSprite('ctf', flag.team);
      if (!asset?.sprite.complete || !asset.sprite.naturalWidth) continue;
      const screen = worldToScreen(flag, camera, canvas.width, canvas.height);
      ctx.drawImage(asset.sprite, screen.x - asset.visual.width / 2, screen.y - asset.visual.height, asset.visual.width, asset.visual.height);
    }
  }
  if (world.mode === 'dom') {
    for (const point of world.objectives.holdpoints) {
      const asset = getObjectiveSprite('dom', point.team);
      if (!asset?.sprite.complete || !asset.sprite.naturalWidth) continue;
      const screen = worldToScreen(point, camera, canvas.width, canvas.height);
      ctx.drawImage(asset.sprite, screen.x - asset.visual.width / 2, screen.y - asset.visual.height, asset.visual.width, asset.visual.height);
    }
  }
}

// The translucent cyan boxes are the exact NodePhysBox placements decoded
// from the Foundry SWF.  They deliberately use the same world rectangles as
// engine.mjs, so visual inspection and live collision cannot drift apart.
function drawCollisionBoxes() {
  if (!world.collisionBoxes?.length) return;
  ctx.save();
  ctx.lineWidth = 1.25;
  for (const box of world.collisionBoxes) {
    const topLeft = worldToScreen({ x: box.x - box.width / 2, y: box.y - box.height / 2 }, camera, canvas.width, canvas.height);
    const bottomRight = worldToScreen({ x: box.x + box.width / 2, y: box.y + box.height / 2 }, camera, canvas.width, canvas.height);
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    ctx.fillStyle = 'rgba(42, 193, 255, .18)';
    ctx.strokeStyle = 'rgba(42, 211, 255, .9)';
    ctx.fillRect(topLeft.x, topLeft.y, width, height);
    ctx.strokeRect(topLeft.x + .5, topLeft.y + .5, width - 1, height - 1);
  }
  ctx.restore();
}

function renderOriginalMapBackdrop(source) {
  const viewport = { width: canvas.clientWidth, height: canvas.clientHeight };
  if (!viewport.width || !viewport.height) return;
  for (const [layer, followsCamera] of [[sky, false], [map, false]]) {
    const crop = layer.sourceCrop;
    if (!layer.naturalWidth || !crop?.width || !crop?.height) continue;
    const layout = getDomMapLayerLayout({
      naturalWidth: layer.naturalWidth, naturalHeight: layer.naturalHeight, crop, source,
      world: world.config, viewport, followsCamera,
    });
    Object.assign(layer.style, {
      width: `${layout.width}px`, height: `${layout.height}px`,
      left: `${layout.left}px`, top: `${layout.top}px`,
    });
  }
  if (foundryForeground && foundryWorldTimeline) {
    const plan = getFoundryForegroundRuntimePlan({
      mapId: foundryWorldTimeline.mapId,
      timelineFrame: foundryWorldTimeline.timelineFrame,
      source,
      viewport,
    });
    renderFoundryForegroundDomLayer(foundryForeground, plan.layers);
    return;
  }
  const crop = terrain.sourceCrop;
  if (!terrain.naturalWidth || !crop?.width || !crop?.height) return;
  const layout = getDomMapLayerLayout({
    naturalWidth: terrain.naturalWidth, naturalHeight: terrain.naturalHeight, crop, source,
    world: world.config, viewport, followsCamera: true,
  });
  Object.assign(terrain.style, {
    width: `${layout.width}px`, height: `${layout.height}px`,
    left: `${layout.left}px`, top: `${layout.top}px`,
  });
}

function advanceFoundrySourceTimeline(dt) {
  if (!foundryWorldTimeline) return;
  foundryTimelineAccumulator += dt;
  const ticks = Math.floor(foundryTimelineAccumulator * 30);
  if (!ticks) return;
  foundryTimelineAccumulator -= ticks / 30;
  const next = advanceFoundryWorldTimeline(foundryWorldTimeline, world.wallFrames, ticks);
  foundryWorldTimeline = next.state;
  world.wall = next.wall;
  world.wallSource = Object.freeze({ characterId: world.wallSource.characterId, frame: foundryWorldTimeline.wallFrame });
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const source = getMapSourceRect(camera, canvas.width, canvas.height);
  renderOriginalMapBackdrop(source);
  renderActorOverlay();
  drawObjectives();
  if (SHOW_COLLISION_OVERLAYS) drawCollisionBoxes();
  for (const bullet of world.bullets) drawTracer(bullet);
  for (const player of world.players) drawPlayer(player);
  if (SHOW_PLAYER_PROBES) for (const player of world.players) drawPlayerCollider(player);
  for (const flash of world.muzzleFlashes) drawMuzzleFlash(flash);
  for (const hit of world.hitEffects) {
    const point = worldToScreen(hit, camera, canvas.width, canvas.height);
    ctx.fillStyle = `rgba(255, 196, 128, ${hit.ttl / .16})`;
    ctx.beginPath(); ctx.arc(point.x, point.y, 7, 0, Math.PI * 2); ctx.fill();
  }
  drawHud();
  drawBottomHud();
  drawAimer(world.players[0]);
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (running) {
    const input = inputForPlayer();
    if (online) {
      onlineAccumulator += dt;
      if (onlineAccumulator >= 1 / 20) {
        const networkDt = onlineAccumulator;
        onlineAccumulator = 0;
        sendRoomInput(online, input, networkDt).then((state) => { if (state) applyRoomState(world, state); }).catch((error) => { saveStatus.textContent = `联机断开：${error.message}`; });
      }
    } else {
      advanceFoundrySourceTimeline(dt);
      step(world, { p1: input }, dt);
      for (const event of world.events.splice(0)) audio.play(event.type);
    }
    if (Math.floor(world.elapsed) !== Math.floor(world.elapsed - dt)) saveSettings();
  }
  const targetCamera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  camera = smoothCamera(camera, targetCamera, dt);
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
