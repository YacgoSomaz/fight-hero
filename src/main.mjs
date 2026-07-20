import { createWorld, step } from './engine.mjs';
import { getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera, worldToScreen } from './camera.mjs';
import { getUnitRigPose } from './unit-rig.mjs';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const reset = document.querySelector('#reset');
const map = new Image();
map.src = './assets/lab-map.jpg';
const unitSprite = new Image();
unitSprite.src = './assets/unitmc-idle-original.png';
const gunArmSprite = new Image();
gunArmSprite.src = './source-assets/DefineSprite_501_MBFZ_fla.arm_gun_316/1.png';
const frontArmSprite = new Image();
frontArmSprite.src = './source-assets/DefineSprite_668_MBFZ_fla.arm_front_328/1.png';
const muzzleFlashSprite = new Image();
muzzleFlashSprite.src = './assets/muzzle-flash-original.png';
const aimerCircleSprite = new Image();
aimerCircleSprite.src = './assets/aimer-circle-original.png';
const aimerCenterSprite = new Image();
aimerCenterSprite.src = './assets/aimer-original.png';
const hudRifleSprite = new Image();
hudRifleSprite.src = './assets/hud-rifle-original.png';
let world = createWorld();
let camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
let last = performance.now();
const held = new Set();
const controls = { left: 'KeyA', right: 'KeyD', jump: 'KeyW', fire: 'KeyF' };
const pointer = { x: canvas.width * 0.75, y: canvas.height * 0.52 };
let mouseFire = false;
let mouseFirePressed = false;

for (const type of ['keydown', 'keyup']) {
  window.addEventListener(type, (event) => {
    if (Object.values(controls).includes(event.code)) event.preventDefault();
    if (type === 'keydown') held.add(event.code);
    else held.delete(event.code);
  });
}
window.addEventListener('blur', () => { held.clear(); mouseFire = false; mouseFirePressed = false; });
reset.addEventListener('click', () => {
  world = createWorld();
  camera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
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
  ctx.fillText(`P1  HP ${player.hp}/${player.maxHp}`, 28, 53);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8edf8';
  ctx.font = '600 16px system-ui';
  ctx.fillText('单人网页复刻 · 鼠标瞄准 / 实体平台验证', canvas.width / 2, 30);
  ctx.textAlign = 'left';
}

function drawBottomHud() {
  const hudY = canvas.height - 24;
  const ammoX = canvas.width - 335;
  const ammo = 78;

  // These boxes follow the original Hud.setAmmoImage "arifle" layout: 2px gap,
  // 2px width and 10px height, enlarged for the 1280px canvas.
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, .72)';
  ctx.fillStyle = 'rgba(255, 255, 255, .22)';
  for (let index = 0; index < 30; index += 1) {
    const x = ammoX + index * 7;
    ctx.fillRect(x, hudY - 48, 5, 25);
    ctx.strokeRect(x + 0.5, hudY - 47.5, 4, 24);
  }
  ctx.fillStyle = '#f4f2ea';
  ctx.font = '700 17px system-ui';
  ctx.fillText(String(ammo), ammoX + 226, hudY - 27);
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
}

function drawPlayer(player) {
  const screen = worldToScreen(player, camera, canvas.width, canvas.height);
  const localAimAngle = player.facing < 0
    ? Math.atan2(Math.sin(Math.PI - player.aimAngle), Math.cos(Math.PI - player.aimAngle))
    : player.aimAngle;
  const pose = getUnitRigPose({
    animation: player.animation,
    animationTime: player.animationTime,
    aimAngle: localAimAngle,
    facing: player.facing,
    recoil: player.recoil,
  });
  const scale = 0.94;
  const height = 76;

  function drawIdleCrop(sourceX, sourceY, sourceWidth, sourceHeight, part, width, height) {
    if (!unitSprite.complete || !unitSprite.naturalWidth) return;
    ctx.save();
    ctx.translate(part.x * scale, part.y * scale);
    ctx.rotate(part.rotation * Math.PI / 180);
    ctx.drawImage(unitSprite, sourceX, sourceY, sourceWidth, sourceHeight, -width / 2, -height, width, height);
    ctx.restore();
  }

  function drawExtractedArm(sprite, source, part, width, height) {
    if (!sprite.complete || !sprite.naturalWidth) return;
    ctx.save();
    ctx.translate(part.x * scale, part.y * scale);
    ctx.rotate(part.rotation * Math.PI / 180);
    ctx.drawImage(sprite, source.x, source.y, source.width, source.height, 0, -height / 2, width, height);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.scale(pose.facing, 1);
  if (unitSprite.complete && unitSprite.naturalWidth) {
    // UnitMC hierarchy: legup/leglow/foot → body → head → arm2 (back) → arm1 (front+gun).
    // Source crops retain the extracted original pixel art; each crop is now transformed by its own pivot.
    drawIdleCrop(60, 164, 34, 40, pose.backLeg, 31, 42);
    drawExtractedArm(gunArmSprite, { x: 87, y: 92, width: 32, height: 17 }, pose.backArm, 34, 18);
    drawIdleCrop(66, 127, 27, 45, pose.torso, 28, 47);
    drawIdleCrop(60, 164, 34, 40, pose.frontLeg, 31, 42);
    drawIdleCrop(74, 127, 19, 20, pose.head, 20, 21);
    drawExtractedArm(frontArmSprite, { x: 66, y: 40, width: 24, height: 29 }, pose.frontArm, 25, 30);
  } else {
    ctx.fillStyle = '#838b59';
    ctx.fillRect(-12, -56, 24, 56);
  }
  ctx.restore();
  ctx.fillStyle = '#eaf0d5';
  ctx.font = '700 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('P1', screen.x, screen.y - height - 8);
  ctx.textAlign = 'left';
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
  if (!muzzleFlashSprite.complete || !muzzleFlashSprite.naturalWidth) return;
  const screen = worldToScreen(flash, camera, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(flash.angle);
  ctx.drawImage(muzzleFlashSprite, 0, 0, muzzleFlashSprite.naturalWidth, muzzleFlashSprite.naturalHeight, 0, -12, 30, 24);
  ctx.restore();
}

function render() {
  if (map.complete && map.naturalWidth) {
    const source = getMapSourceRect(camera, canvas.width, canvas.height);
    ctx.drawImage(map, source.x, source.y, source.width, source.height, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#19202a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = 'rgba(3, 7, 13, .12)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const bullet of world.bullets) drawTracer(bullet);
  drawPlayer(world.players[0]);
  for (const flash of world.muzzleFlashes) drawMuzzleFlash(flash);
  drawHud();
  drawBottomHud();
  drawAimer(world.players[0]);
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  step(world, { p1: inputForPlayer() }, dt);
  const targetCamera = getFollowCamera(world.players[0], world.config, canvas.width, canvas.height);
  camera = smoothCamera(camera, targetCamera, dt);
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
