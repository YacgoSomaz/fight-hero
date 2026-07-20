import { UNITMC_FRAMES, createWorld, step } from './engine.mjs';
import { getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera, worldToScreen } from './camera.mjs';
import { AudioBank } from './audio.mjs';
import { applyRoomState, joinPrivateRoom, sendRoomInput } from './online.mjs';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const reset = document.querySelector('#reset');
const start = document.querySelector('#start');
const difficulty = document.querySelector('#difficulty');
const difficultyValue = document.querySelector('#difficultyValue');
const roomInput = document.querySelector('#room');
const music = document.querySelector('#music');
const saveStatus = document.querySelector('#saveStatus');
const SAVE_KEY = 'fight-hero/private-foundry-v2';
const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
const audio = new AudioBank({ muted: Boolean(saved.muted) });
const map = new Image();
map.src = './public/assets/maps/foundry.png';
// Original Foundry foreground art: platforms, forge and lava. The editor-only
// physics/spawn/pickup nodes are deliberately excluded from this normal view.
const foundryForeground = new Image();
foundryForeground.src = './public/assets/maps/foundry-foreground.png';
// Movement.as does not walk on NodePhysBox.  It probes the fully opaque pixels
// in Arena.wall (drawn from wallMC), which carries the authored ramps and
// irregular terrain.  Keep that source mask separate from visual foreground
// artwork, then install it on each local Foundry world once it has loaded.
const foundryWall = new Image();
foundryWall.src = './public/assets/maps/foundry-wall.png';
let foundryWallMask = null;
let foundryWallOutline = null;
function createFoundryWallMask() {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = foundryWall.naturalWidth;
  maskCanvas.height = foundryWall.naturalHeight;
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true });
  maskContext.drawImage(foundryWall, 0, 0);
  const pixels = maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
  const width = maskCanvas.width;
  const height = maskCanvas.height;
  const opaqueAt = (x, y) => x >= 0 && x < width && y >= 0 && y < height && pixels[(y * width + x) * 4 + 3] === 255;
  foundryWallMask = Object.freeze({
    isSolid(x, y) { return opaqueAt(Math.floor(x), Math.floor(y)); },
  });

  // Draw only the source wall boundary in cyan.  This is the exact terrain
  // that Movement.as hitTest sees, including the large forge ramp.
  const outlinePixels = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!opaqueAt(x, y)) continue;
      if (opaqueAt(x - 1, y) && opaqueAt(x + 1, y) && opaqueAt(x, y - 1) && opaqueAt(x, y + 1)) continue;
      const index = (y * width + x) * 4;
      outlinePixels[index] = 32;
      outlinePixels[index + 1] = 208;
      outlinePixels[index + 2] = 255;
      outlinePixels[index + 3] = 210;
    }
  }
  foundryWallOutline = document.createElement('canvas');
  foundryWallOutline.width = width;
  foundryWallOutline.height = height;
  foundryWallOutline.getContext('2d').putImageData(new ImageData(outlinePixels, width, height), 0, 0);
}
function installFoundryWall(target) {
  if (foundryWallMask) target.wall = foundryWallMask;
  return target;
}
function createFoundryWorld(options = {}) {
  return installFoundryWall(createWorld({ ...options, foundry: true }));
}
foundryWall.addEventListener('load', () => {
  createFoundryWallMask();
  installFoundryWall(world);
});
function image(source) { const result = new Image(); result.src = source; return result; }
// Fallback while the decoded UnitMC matrix data is loading.
const unitSkin = image('./public/assets/unit-parts/unit-idle.png');
const unitParts = {
  rifleArm: image('./public/assets/unit-parts/tight/rifle_arm.png'),
  frontArm: image('./public/assets/unit-parts/tight/front_arm.png'),
  body: image('./public/assets/unit-parts/tight/body.png'),
  head: image('./public/assets/unit-parts/tight/head.png'),
  foot: image('./public/assets/unit-parts/tight/foot.png'),
  legLower: image('./public/assets/unit-parts/tight/leg_lower.png'),
  legUpper: image('./public/assets/unit-parts/tight/leg_upper.png'),
};
let unitTimeline = null;
fetch('./public/assets/unitmc-timeline.json').then((response) => {
  if (!response.ok) throw new Error(`UnitMC timeline ${response.status}`);
  return response.json();
}).then((data) => { unitTimeline = data; }).catch(() => { unitTimeline = null; });
const muzzleFlashSprite = { complete: false, naturalWidth: 0 };
const aimerCircleSprite = { complete: false, naturalWidth: 0 };
const aimerCenterSprite = { complete: false, naturalWidth: 0 };
const hudRifleSprite = { complete: false, naturalWidth: 0 };
let world = createFoundryWorld();
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

function saveSettings() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ muted: audio.muted, difficulty: Number(difficulty.value), score: world.score }));
  saveStatus.textContent = `已保存：P1 ${world.score.p1 ?? 0} 击倒 · AI ${world.score.bot1 ?? 0} 击倒`;
}
difficulty.value = saved.difficulty ?? 6;
difficultyValue.value = difficulty.value;
music.checked = !audio.muted;
saveStatus.textContent = saved.score ? `读取存档：P1 ${saved.score.p1 ?? 0} 击倒` : '本地存档尚未创建';
difficulty.addEventListener('input', () => { difficultyValue.value = difficulty.value; if (world.bots[0]) world.bots[0].ai.difficulty = Number(difficulty.value); saveSettings(); });
music.addEventListener('change', () => { audio.setMuted(!music.checked); if (music.checked && !running) audio.startMenu(); saveSettings(); });
start.addEventListener('click', async () => {
  try {
    const room = roomInput.value.trim();
    if (room) {
      online = await joinPrivateRoom(room);
      world = createFoundryWorld({ multiplayer: true });
      applyRoomState(world, online.state);
      start.textContent = `房间 ${room} · ${online.slot.toUpperCase()}`;
    } else {
      online = null;
      world.bots[0].ai.difficulty = Number(difficulty.value);
      start.textContent = '战斗中';
    }
    running = true; audio.stopMenu(); audio.play('click'); saveSettings();
  } catch (error) { saveStatus.textContent = `联机失败：${error.message}`; }
});
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
  online = null;
  world = createFoundryWorld();
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
    const range = UNITMC_FRAMES[player.animation] ?? UNITMC_FRAMES.idle;
    const nextFrameNumber = player.animationFrame >= range[1] ? range[0] : player.animationFrame + 1;
    const nextFrame = unitTimeline.frames[nextFrameNumber - 1] ?? frame;
    const blend = Math.max(0, Math.min(1, player.animationBlend ?? 0));
    const nextByName = Object.fromEntries(nextFrame.map(([name, x, y, scaleX, scaleY, skewX, skewY]) => [name, { x, y, scaleX, scaleY, skewX, skewY }]));
    const items = Object.fromEntries(frame.map(([name, x, y, scaleX, scaleY, skewX, skewY]) => {
      const next = nextByName[name] ?? { x, y, scaleX, scaleY, skewX, skewY };
      const lerp = (from, to) => from + (to - from) * blend;
      return [name, { x: lerp(x, next.x), y: lerp(y, next.y), scaleX: lerp(scaleX, next.scaleX), scaleY: lerp(scaleY, next.scaleY), skewX: lerp(skewX, next.skewX), skewY: lerp(skewY, next.skewY) }];
    }));
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
      // FFDec's tight leg crops preserve their SWF registration point but
      // omit the original transparent canvas above the feet.  Apply that
      // calibration in world space so rotated run frames stay attached.
      // Re-anchor the decoded leg artwork at the actor's real centre-foot
      // contact.  The prior -26px crop correction left visible boots above
      // the physical foot point and made a grounded player look airborne.
      const legLift = name.startsWith('leg') || name.startsWith('foot') ? -10 : 0;
      ctx.translate(anchor.x, anchor.y + legLift);
      if (aimFactor === null) ctx.transform(item.scaleX, item.skewY, item.skewX, item.scaleY, 0, 0);
      else {
        // Unit.as overwrites only these three rotations every tick; their
        // translation stays on the original head/arm holder of this frame.
        const scaleX = Math.hypot(item.scaleX, item.skewY);
        const scaleY = Math.hypot(item.scaleY, item.skewX);
        ctx.scale(scaleX, scaleY);
        ctx.rotate(localAim * aimFactor);
        if (name === 'arm1') ctx.translate(-player.recoil * 2, 0);
      }
      ctx.drawImage(sprite, offsetX, offsetY);
      ctx.restore();
    };

    // Offsets are calibrated from UnitMC frame 1: they retain the original
    // registration point after FFDec cropped the fixed Medic part images.
    drawPart('arm1', unitParts.rifleArm, 4.7, -19.5, 1);
    drawPart('foot2', unitParts.foot, -0.6, 5.2);
    drawPart('leglow2', unitParts.legLower, -10.75, 0.6);
    drawPart('legup2', unitParts.legUpper, -5.85, -11.8);
    drawPart('foot1', unitParts.foot, 2.95, 6.2);
    drawPart('leglow1', unitParts.legLower, -11.95, -3);
    drawPart('legup1', unitParts.legUpper, -12.15, -12.35);
    drawPart('body', unitParts.body, -13, -24.25);
    drawPart('head', unitParts.head, -14.4, -30.1, .6);
    drawPart('arm2', unitParts.frontArm, 4.7, -25.5, 1);
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

// Cyan now means the actual Movement.as collision boundary, not a convenient
// rectangle approximation.  NodePhysBox is retained in world data for its
// original Box2D purpose, but character movement follows wallMC's alpha mask.
function drawCollisionBoxes() {
  if (!foundryWallOutline) return;
  const source = getMapSourceRect(camera, canvas.width, canvas.height);
  ctx.drawImage(
    foundryWallOutline,
    source.x, source.y, source.width, source.height,
    0, 0, canvas.width, canvas.height,
  );
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
