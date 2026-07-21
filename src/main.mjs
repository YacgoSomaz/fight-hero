import { RIFLE_ARM_BASE_ANGLE, UNITMC_FRAMES, createWorld, step } from './engine.mjs';
import { getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera, worldToScreen } from './camera.mjs';
import { AudioBank } from './audio.mjs';
import { applyRoomState, joinPrivateRoom, sendRoomInput } from './online.mjs';
import { selectM4Action } from './m4-action-selector.mjs';
import { drawVectorRuntimeFrame } from './vector-runtime-renderer.mjs';
import { drawRuntimeShape } from './vector-shape-canvas.mjs';
import { MENU_SCREEN_ASSETS } from './menu-assets.mjs';
import { DEFAULT_MENU_SCREEN, MENU_CHINESE_COPY, MENU_PRESENTATION_MODE, MENU_QUICK_SUMMARY_TOP, MENU_TRANSLATION_TOP, getMenuHitAreas, getMissionEntries } from './menu-ui.mjs';
import { createMatchSelection, cycleQuickMatchSelection, formatQuickMatchSummary, isPlayableSelection, updateMatchSelection } from './menu-state.mjs';
import { getMapLayerCrop, getMapVisual } from './map-visuals.mjs';
import { getObjectiveVisual } from './objective-visuals.mjs';
import { SHOW_COLLISION_OVERLAYS, SHOW_PLAYER_PROBES } from './scene-presentation.mjs';
import { getUnitOverheadHud } from './unit-status.mjs';

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
const leaveGame = document.querySelector('#leaveGame');
const SAVE_KEY = 'fight-hero/private-foundry-v2';
const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
const audio = new AudioBank({ muted: Boolean(saved.muted) });
const sky = new Image();
const map = new Image();
const terrain = new Image();
function loadImage(target, source) {
  return new Promise((resolve) => {
    target.onload = () => resolve(); target.onerror = () => resolve(); target.src = source;
    if (target.complete) resolve();
  });
}
async function loadMapVisual(mapId) {
  const visual = getMapVisual(mapId);
  sky.sourceCrop = getMapLayerCrop(visual.sky);
  map.sourceCrop = getMapLayerCrop(visual.background);
  terrain.sourceCrop = getMapLayerCrop(visual.terrain);
  await Promise.all([loadImage(sky, visual.sky), loadImage(map, visual.background), loadImage(terrain, visual.terrain)]);
}
void loadMapVisual('foundry');
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
const aimerCircleSprite = { complete: false, naturalWidth: 0 };
const aimerCenterSprite = { complete: false, naturalWidth: 0 };
const hudRifleSprite = { complete: false, naturalWidth: 0 };
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
  getMissionEntries(screen).forEach((mission, index) => {
    addQuickValue(
      `${screen}-mission-${mission.stage}`,
      `第 ${mission.stage} 关 · ${mission.title}`,
      25.6,
      33.5 + index * 2.42,
      19.3,
      index === selected,
    );
  });
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
  if (!isPlayableSelection(matchSelection)) {
    quickSelectionChanged = true;
    quickStatus = '该原始关卡的地图碰撞尚未迁移，不能伪装为可玩。';
    if (menuSurface.dataset.screen === 'quickmatch') renderQuickmatchOverlay();
    else renderMissionOverlay(menuSurface.dataset.screen);
    return;
  }
  try {
    const room = roomInput.value.trim();
    if (room) {
      online = await joinPrivateRoom(room);
      world = createWorld({ multiplayer: true, foundry: true });
      await loadMapVisual('foundry');
      applyRoomState(world, online.state);
      start.textContent = `房间 ${room} · ${online.slot.toUpperCase()}`;
    } else {
      online = null;
      await loadMapVisual(matchSelection.map);
      world = createWorld({ mapId: matchSelection.map, mode: matchSelection.mode, score: matchSelection.score });
      world.matchSettings = { ...matchSelection };
      world.bots.forEach((bot) => { bot.ai.difficulty = matchSelection.difficulty; });
      start.textContent = '战斗中';
    }
    camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
    running = true; sourceMenu.hidden = true; gameStage.hidden = false; audio.stopMenu(); audio.play('click'); saveSettings();
  } catch (error) { saveStatus.textContent = `启动失败：${error.message}`; }
}
start.addEventListener('click', () => { void launchSelectedMatch(); });

function selectMission(kind, index) {
  const mission = getMissionEntries(kind)[index];
  if (!mission) return;
  selectedMissionIndex[kind] = index;
  matchSelection = updateMatchSelection(matchSelection, mission);
  quickSelectionChanged = true;
  quickStatus = isPlayableSelection(matchSelection) ? '' : '该关原始地图仍待迁移。';
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
  await loadMapVisual(matchSelection.map);
  world = createWorld({ mapId: matchSelection.map, mode: matchSelection.mode, score: matchSelection.score });
  world.bots[0].ai.difficulty = Number(difficulty.value);
  camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  running = true;
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
  ctx.fillStyle = player.color;
  ctx.fillRect(28, 20, 210, 10);
  ctx.fillStyle = '#3b1620';
  ctx.fillRect(28 + player.hp / player.maxHp * 210, 20, 210 - player.hp / player.maxHp * 210, 10);
  ctx.fillStyle = '#f3f7ff';
  ctx.font = 'bold 16px system-ui';
  ctx.fillText(`P1  HP ${player.hp}/${player.maxHp}  ·  ${world.score.p1 ?? 0} 击倒`, 28, 53);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8edf8';
  ctx.font = '600 16px system-ui';
  ctx.fillText(`${world.mapId} · AI ${difficulty.value} · ${running ? '战斗进行中' : '菜单'}`, canvas.width / 2, 30);
  ctx.textAlign = 'left';
}

function drawBottomHud() {
  const hudY = canvas.height - 24;
  const ammoX = canvas.width - 335;
  const ammo = world.players[0].weapon.spare;
  const clip = world.players[0].weapon.clip;

  // These boxes follow the original Hud.setAmmoImage "arifle" layout: 2px gap,
  // 2px width and 10px height, enlarged for the 1280px canvas.
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, .72)';
  ctx.fillStyle = 'rgba(255, 255, 255, .22)';
  for (let index = 0; index < world.players[0].weapon.clipMax; index += 1) {
    const x = ammoX + index * 7;
    if (index < clip) ctx.fillRect(x, hudY - 48, 5, 25);
    ctx.strokeRect(x + 0.5, hudY - 47.5, 4, 24);
  }
  ctx.fillStyle = '#f4f2ea';
  ctx.font = '700 17px system-ui';
  ctx.fillText(String(ammo), ammoX + 226, hudY - 27);
  if (world.players[0].weapon.reloadRemaining) ctx.fillText('RELOAD', ammoX + 123, hudY - 63);
  ctx.strokeStyle = 'rgba(255, 255, 255, .82)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ammoX - 22, hudY - 7);
  ctx.lineTo(ammoX + 238, hudY - 7);
  ctx.lineTo(ammoX + 252, hudY - 22);
  ctx.stroke();

  if (hudRifleSprite.complete && hudRifleSprite.naturalWidth) {
    // Frame 22 of the original Guns timeline, rendered as the white HUD silhouette.
    ctx.filter = 'brightness(0) invert(1) grayscale(1)';
    ctx.drawImage(hudRifleSprite, canvas.width - 210, hudY - 109, 190, 102);
    ctx.filter = 'none';
  }

  ctx.fillStyle = '#f4f2ea';
  ctx.font = '700 12px system-ui';
  ctx.fillText('Medic', 12, hudY - 72);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(30, hudY - 61); ctx.lineTo(30, hudY - 28);
  ctx.moveTo(13, hudY - 45); ctx.lineTo(47, hudY - 45);
  ctx.stroke();
  ctx.font = '700 15px system-ui';
  ctx.fillText('85 Hp', 59, hudY - 42);
  ctx.fillText('lvl: 1', 59, hudY - 20);
  ctx.strokeStyle = 'rgba(232, 241, 101, .8)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 150, hudY - 4);
  ctx.lineTo(canvas.width / 2 + 150, hudY - 4);
  ctx.stroke();
  ctx.fillStyle = '#eff5dd';
  ctx.font = '700 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Exp 1 / 43', canvas.width / 2, hudY - 1);
  ctx.restore();
}

function drawAimer(player) {
  // Player.as changes the Aimer circle's width/height from recoil every frame.
  // The previous fixed 40px export ignored that original behaviour.
  const spread = player.crosshairSpread;
  if (aimerCircleSprite.complete && aimerCircleSprite.naturalWidth) {
    ctx.drawImage(aimerCircleSprite, pointer.x - spread, pointer.y - spread, spread * 2, spread * 2);
  }
  if (aimerCenterSprite.complete && aimerCenterSprite.naturalWidth) {
    // The Aimer sprite exports at the original stage size; its centre is at 640,480.
    ctx.drawImage(aimerCenterSprite, 600, 440, 80, 80, pointer.x - 40, pointer.y - 40, 80, 80);
  }
  if (!aimerCircleSprite.naturalWidth) {
    ctx.save();
    ctx.strokeStyle = 'rgba(243, 248, 205, .9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, spread, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pointer.x - 6, pointer.y); ctx.lineTo(pointer.x + 6, pointer.y);
    ctx.moveTo(pointer.x, pointer.y - 6); ctx.lineTo(pointer.x, pointer.y + 6);
    ctx.stroke();
    ctx.restore();
  }
}

function drawPlayer(player) {
  if (!player.alive) return;
  const screen = worldToScreen(player, camera, canvas.width, canvas.height);
  const height = 76;

  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.scale(player.facing, 1);
  const frame = unitTimeline?.frames?.[player.animationFrame - 1];
  if (frame && Object.values(unitParts).every((sprite) => sprite.complete && sprite.naturalWidth)) {
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
  } else if (unitSkin.complete && unitSkin.naturalWidth) {
    ctx.drawImage(unitSkin, -37, -84, 75, 90);
  } else {
    ctx.fillStyle = '#838b59';
    ctx.fillRect(-12, -56, 24, 56);
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

function render() {
  ctx.fillStyle = '#090c12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const source = getMapSourceRect(camera, canvas.width, canvas.height);
  const drawMapLayer = (layer, asViewportBackground = false) => {
    if (!layer.complete || !layer.naturalWidth) return;
    const crop = layer.sourceCrop;
    if (asViewportBackground && crop?.width && crop?.height) {
      ctx.drawImage(layer, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
      return;
    }
    // Keep every foreground layer in the same authored coordinate space as
    // the decoded collision/spawn nodes.  Some FFDec PNGs retain empty stage
    // padding; their crop is the actual map rect, not a viewport background.
    const layerX = crop?.width ? crop.x : 0;
    const layerY = crop?.height ? crop.y : 0;
    const layerWidth = crop?.width || layer.naturalWidth;
    const layerHeight = crop?.height || layer.naturalHeight;
    const sourceX = layerX + source.x / world.config.width * layerWidth;
    const sourceY = layerY + source.y / world.config.height * layerHeight;
    const sourceWidth = source.width / world.config.width * layerWidth;
    const sourceHeight = source.height / world.config.height * layerHeight;
    ctx.drawImage(layer, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  };
  drawMapLayer(sky, true);
  drawMapLayer(map, true);
  drawMapLayer(terrain);
  ctx.fillStyle = 'rgba(3, 7, 13, .12)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
