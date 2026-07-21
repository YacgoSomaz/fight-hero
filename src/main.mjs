import { RIFLE_ARM_BASE_ANGLE, UNITMC_FRAMES, createWorld, step } from './engine.mjs';
import { getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera, worldToScreen } from './camera.mjs';
import { AudioBank } from './audio.mjs';
import { selectM4Action } from './m4-action-selector.mjs';
import { drawVectorRuntimeFrame } from './vector-runtime-renderer.mjs';
import { drawRuntimeShape } from './vector-shape-canvas.mjs';
import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS, ORIGINAL_MAPS, ORIGINAL_MODES, createMatchSelection, getQuickMatchStatus, updateMatchSelection } from './menu-state.mjs';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const reset = document.querySelector('#reset');
const start = document.querySelector('#start');
const difficulty = document.querySelector('#difficulty');
const difficultyValue = document.querySelector('#difficultyValue');
const music = document.querySelector('#music');
const saveStatus = document.querySelector('#saveStatus');
const frontMenu = document.querySelector('#frontMenu');
const gameStage = document.querySelector('#gameStage');
const leaveMatch = document.querySelector('#leaveMatch');
const mapSelect = document.querySelector('#mapSelect');
const modeSelect = document.querySelector('#modeSelect');
const scoreSelect = document.querySelector('#scoreSelect');
const quickStatus = document.querySelector('#quickStatus');
const skills = document.querySelector('#skills');
const streaks = document.querySelector('#streaks');
const SAVE_KEY = 'fight-hero/private-foundry-v2';
const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
const audio = new AudioBank({ muted: Boolean(saved.muted) });
const map = new Image();
map.src = './public/assets/maps/foundry.png';
// Original Foundry foreground art: platforms, forge and lava. The editor-only
// physics/spawn/pickup nodes are deliberately excluded from this normal view.
const foundryForeground = new Image();
foundryForeground.src = './public/assets/maps/foundry-foreground.png';
function image(source) { const result = new Image(); result.src = source; return result; }
// Fallback while the decoded UnitMC matrix data is loading.
const unitSkin = image('./public/assets/unit-parts/unit-idle.png');
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
let world = createWorld({ foundry: true });
let camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
let last = performance.now();
const held = new Set();
const controls = { left: 'KeyA', right: 'KeyD', jump: 'KeyW', down: 'KeyS', reload: 'KeyR', fire: 'KeyF' };
const pointer = { x: canvas.width * 0.75, y: canvas.height * 0.52 };
let mouseFire = false;
let mouseFirePressed = false;
let running = false;
let selection = createMatchSelection({ difficulty: Number(saved.difficulty ?? 1) });

function saveSettings() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ muted: audio.muted, difficulty: Number(difficulty.value), score: world.score }));
  saveStatus.textContent = `已保存：P1 ${world.score.p1 ?? 0} 击倒 · AI ${world.score.bot1 ?? 0} 击倒`;
}
difficulty.value = selection.difficulty;
difficultyValue.value = difficulty.value;
music.checked = !audio.muted;
saveStatus.textContent = saved.score ? `读取存档：P1 ${saved.score.p1 ?? 0} 击倒` : '本地存档尚未创建';
difficulty.addEventListener('input', () => { difficultyValue.value = difficulty.value; selection = updateMatchSelection(selection, { difficulty: Number(difficulty.value) }); if (world.bots[0]) world.bots[0].ai.difficulty = Number(difficulty.value); });
music.addEventListener('change', () => { audio.setMuted(!music.checked); if (music.checked && !running) audio.startMenu(); saveSettings(); });
function option(value, label) { const item = document.createElement('option'); item.value = value; item.textContent = label; return item; }
function renderMissionList(element, missions) {
  for (const mission of missions) {
    const map = ORIGINAL_MAPS.find((item) => item.id === mission.map)?.name ?? mission.map;
    const mode = ORIGINAL_MODES.find((item) => item.id === mission.mode)?.name ?? mission.mode;
    const li = document.createElement('li');
    li.innerHTML = `<strong>${mission.title}</strong><span>${map} · ${mode}</span><span>目标 ${mission.score} · 难度 ${mission.difficulty}</span><em>规则待迁入</em>`;
    element.append(li);
  }
}
function renderQuickMatch() {
  mapSelect.replaceChildren(...ORIGINAL_MAPS.map((map) => option(map.id, map.name)));
  modeSelect.replaceChildren(...ORIGINAL_MODES.map((mode) => option(mode.id, mode.name)));
  mapSelect.value = selection.map; modeSelect.value = selection.mode;
  const mode = ORIGINAL_MODES.find((entry) => entry.id === selection.mode);
  scoreSelect.replaceChildren(...mode.scores.map((score) => option(String(score), `${mode.scoreType}：${score}`)));
  scoreSelect.value = String(selection.score);
  skills.checked = selection.skills; streaks.checked = selection.streaks;
  const status = getQuickMatchStatus(selection);
  quickStatus.textContent = status.message;
  start.disabled = !status.canLaunch;
}
function setView(view) {
  document.querySelectorAll('[data-view-panel]').forEach((panel) => { const active = panel.dataset.viewPanel === view; panel.hidden = !active; panel.classList.toggle('active', active); });
  document.querySelectorAll('.rail-item').forEach((button) => button.classList.toggle('active', button.dataset.view === view));
  if (view === 'quick') renderQuickMatch();
}
document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
document.querySelectorAll('[data-view-link]').forEach((link) => link.addEventListener('click', () => setView(link.dataset.viewLink)));
mapSelect.addEventListener('change', () => { selection = updateMatchSelection(selection, { map: mapSelect.value }); renderQuickMatch(); });
modeSelect.addEventListener('change', () => { selection = updateMatchSelection(selection, { mode: modeSelect.value }); renderQuickMatch(); });
scoreSelect.addEventListener('change', () => { selection = updateMatchSelection(selection, { score: Number(scoreSelect.value) }); });
skills.addEventListener('change', () => { selection = updateMatchSelection(selection, { skills: skills.checked }); });
streaks.addEventListener('change', () => { selection = updateMatchSelection(selection, { streaks: streaks.checked }); });
renderMissionList(document.querySelector('#campaignList'), CAMPAIGN_MISSIONS);
renderMissionList(document.querySelector('#challengeList'), CHALLENGE_MISSIONS);
renderQuickMatch();
start.addEventListener('click', () => {
  if (!getQuickMatchStatus(selection).canLaunch) return;
  world = createWorld({ foundry: true });
  world.bots[0].ai.difficulty = selection.difficulty;
  camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  running = true; document.body.dataset.screen = 'game'; frontMenu.hidden = true; gameStage.hidden = false;
  audio.stopMenu(); audio.play('click'); saveSettings();
});
leaveMatch.addEventListener('click', () => { running = false; document.body.dataset.screen = 'menu'; gameStage.hidden = true; frontMenu.hidden = false; start.textContent = '开始战斗'; if (!audio.muted) audio.startMenu(); });
audio.startMenu();

for (const type of ['keydown', 'keyup']) {
  window.addEventListener(type, (event) => {
    if (Object.values(controls).includes(event.code)) event.preventDefault();
    if (type === 'keydown' && event.code === 'KeyM') { audio.setMuted(!audio.muted); music.checked = !audio.muted; saveSettings(); }
    if (type === 'keydown') held.add(event.code);
    else held.delete(event.code);
  });
}
window.addEventListener('blur', () => { held.clear(); mouseFire = false; mouseFirePressed = false; });
reset.addEventListener('click', () => {
  world = createWorld({ foundry: true });
  world.bots[0].ai.difficulty = selection.difficulty;
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
  ctx.fillText(`Foundry · AI ${difficulty.value} · ${running ? '战斗进行中' : '菜单'}`, canvas.width / 2, 30);
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
  ctx.fillStyle = player.isBot ? '#ffb7a8' : '#eaf0d5';
  ctx.font = '700 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(player.isBot ? 'AI' : 'P1', screen.x, screen.y - height - 8);
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
  if (map.complete && map.naturalWidth) {
    const source = getMapSourceRect(camera, canvas.width, canvas.height);
    // Camera coordinates live in the logical collision world; the exported
    // Foundry artwork has its own native dimensions, so transform the source
    // rectangle instead of assuming the old missing lab image's dimensions.
    const sourceX = source.x / world.config.width * map.naturalWidth;
    const sourceY = source.y / world.config.height * map.naturalHeight;
    const sourceWidth = source.width / world.config.width * map.naturalWidth;
    const sourceHeight = source.height / world.config.height * map.naturalHeight;
    ctx.drawImage(map, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    if (foundryForeground.complete && foundryForeground.naturalWidth) {
      const foregroundX = source.x / world.config.width * foundryForeground.naturalWidth;
      const foregroundY = source.y / world.config.height * foundryForeground.naturalHeight;
      const foregroundWidth = source.width / world.config.width * foundryForeground.naturalWidth;
      const foregroundHeight = source.height / world.config.height * foundryForeground.naturalHeight;
      ctx.drawImage(foundryForeground, foregroundX, foregroundY, foregroundWidth, foregroundHeight, 0, 0, canvas.width, canvas.height);
    }
  } else {
    ctx.fillStyle = '#19202a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = 'rgba(3, 7, 13, .12)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCollisionBoxes();
  for (const bullet of world.bullets) drawTracer(bullet);
  for (const player of world.players) drawPlayer(player);
  for (const player of world.players) drawPlayerCollider(player);
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
    step(world, { p1: input }, dt);
    for (const event of world.events.splice(0)) audio.play(event.type);
    if (Math.floor(world.elapsed) !== Math.floor(world.elapsed - dt)) saveSettings();
  }
  const targetCamera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  camera = smoothCamera(camera, targetCamera, dt);
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
