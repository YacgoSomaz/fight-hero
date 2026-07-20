import { FOUNDRY_LAYOUT } from './foundry-layout.mjs';

const MAP_SCALE = 2591 / 1280;

function makePlatform(x, y, width, height = 20) {
  return { x: x * MAP_SCALE, y: y * MAP_SCALE, width: width * MAP_SCALE, height: height * MAP_SCALE };
}

const CONFIG = {
  width: 2591,
  height: 1457,
  floorY: 714 * MAP_SCALE,
  gravity: 1500,
  moveSpeed: 300,
  crouchSpeed: 165,
  jumpSpeed: 620,
  bulletSpeed: 780,
  fireCooldown: 0.18,
  reloadDuration: 0.8,
  respawnDuration: 2,
  muzzleFlashDuration: 0.075,
  climbDuration: 0.28,
  playerHitbox: { halfWidth: 13, height: 62, crouchHeight: 38 },
  // Compatibility fallback used before the Foundry alpha mask is decoded in the browser.
  platforms: [
    makePlatform(0, 714, 1280, 22), makePlatform(268, 551, 283), makePlatform(0, 579, 189),
    makePlatform(628, 579, 146), makePlatform(488, 644, 150), makePlatform(168, 646, 167),
    makePlatform(805, 525, 402), makePlatform(345, 382, 705), makePlatform(29, 341, 1220),
  ],
};

// `wallMC` is 2874×863 in Arena's Foundry frame.  This configuration must
// remain 1:1 with its alpha bitmap: Arena.as reads the same bitmap with
// getPixel32 for movement and bullets.
const FOUNDRY_CONFIG = Object.freeze({
  width: FOUNDRY_LAYOUT.width,
  height: FOUNDRY_LAYOUT.height,
  floorY: 704,
  gravity: 1500,
  moveSpeed: 300,
  crouchSpeed: 165,
  jumpSpeed: 620,
  bulletSpeed: 780,
  fireCooldown: 0.18,
  reloadDuration: 0.8,
  respawnDuration: 2,
  muzzleFlashDuration: 0.075,
  climbDuration: 0.28,
  playerHitbox: { halfWidth: 13, height: 62, crouchHeight: 38 },
  // The alpha wall replaces this after it loads.  These are only safe
  // footholds for the small interval before the image is decoded.
  platforms: [
    { x: 0, y: 704, width: 1194, height: 20 }, { x: 1413, y: 704, width: 1461, height: 20 },
  ],
});

function makeActor(id, spawnX, spawnY, color, isBot = false, config = CONFIG) {
  return {
    id, spawnX, spawnY, x: spawnX, y: spawnY, vx: 0, vy: 0, facing: 1,
    aimX: spawnX + 100, aimY: spawnY - 47, aimAngle: 0,
    animation: 'idle', animationTime: 0, animationFrame: 1, climb: null,
    crouching: false, crosshairRestSpread: 7, crosshairSpread: 7, recoil: 0,
    grounded: true, alive: true, maxHp: 5, hp: 5, hitTimer: 0, deathTimer: 0,
    fireTimer: 0, weapon: { clip: 30, clipMax: 30, spare: 90, reloadRemaining: 0, reloadDuration: config.reloadDuration },
    color, isBot, ai: isBot ? { scanFrame: id === 'bot1' ? 4 : 8, targetId: null, aimSpeed: 0.21, difficulty: 6, crouchTimer: 0, navIndex: null } : null,
    hitbox: { ...config.playerHitbox },
  };
}

export const UNITMC_FRAMES = Object.freeze({
  idle: [1, 19], run: [20, 37], runback: [57, 74], jump: [208, 220], fall: [221, 263],
  duck: [290, 300], duckloop: [301, 304], getup: [305, 320], duckrun: [321, 353],
  duckrunback: [354, 386], climbsmall: [387, 390], climbbig: [391, 395], landhard: [408, 448],
});

export function createWorld(options = {}) {
  const foundry = Boolean(options.foundry);
  const baseConfig = foundry ? FOUNDRY_CONFIG : CONFIG;
  const p1Spawn = foundry ? FOUNDRY_LAYOUT.spawns.p1 : { x: 430 * MAP_SCALE, y: 551 * MAP_SCALE };
  const p2Spawn = foundry ? FOUNDRY_LAYOUT.spawns.p2 : { x: 1040 * MAP_SCALE, y: 525 * MAP_SCALE };
  const p1 = makeActor('p1', p1Spawn.x, p1Spawn.y, '#48b7ff', false, baseConfig);
  const humans = options.multiplayer ? [makeActor('p2', p2Spawn.x, p2Spawn.y, '#f4a35f', false, baseConfig)] : [];
  const bots = options.bots === false || options.multiplayer ? [] : [makeActor('bot1', p2Spawn.x, p2Spawn.y, '#ef806d', true, baseConfig)];
  return {
    config: { ...baseConfig, playerHitbox: { ...baseConfig.playerHitbox }, platforms: baseConfig.platforms.map((platform) => ({ ...platform })) },
    navigation: foundry ? FOUNDRY_LAYOUT.navigation.map((point) => ({ ...point })) : [],
    // `wall.isSolid(x, y)` is the direct equivalent of Arena.wall.getPixel32(...).
    // It is installed by the browser after it decodes the extracted Foundry wall PNG.
    wall: options.wall ?? null,
    players: [p1, ...humans, ...bots], bots, bullets: [], muzzleFlashes: [], hitEffects: [], events: [], score: { p1: 0, p2: 0, bot1: 0 }, elapsed: 0, frame: 0,
  };
}

function actorHeight(actor) { return actor.crouching ? actor.hitbox.crouchHeight : actor.hitbox.height; }
function setAnimation(actor, animation) {
  if (actor.animation !== animation) actor.animationTime = 0;
  actor.animation = animation;
  const range = UNITMC_FRAMES[animation] ?? UNITMC_FRAMES.idle;
  actor.animationFrame = range[0] + Math.floor(actor.animationTime * 30) % (range[1] - range[0] + 1);
}

function platformSolid(world, x, y) {
  return world.config.platforms.some((p) => x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height);
}

export function isSolid(world, x, y) {
  if (x < 0 || x >= world.config.width || y < 0 || y >= world.config.height) return true;
  if (world.wall?.isSolid) return Boolean(world.wall.isSolid(x, y));
  return platformSolid(world, x, y);
}

export function hasLineOfSight(world, from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  for (let travelled = 10; travelled < distance; travelled += 20) {
    if (isSolid(world, from.x + dx / distance * travelled, from.y + dy / distance * travelled)) return false;
  }
  return true;
}

function overlapsPlatformVertically(world, actor, platform) {
  return actor.y > platform.y && actor.y - actorHeight(actor) < platform.y + platform.height;
}
function overlapsPlatformHorizontally(actor, platform) {
  return actor.x + actor.hitbox.halfWidth > platform.x && actor.x - actor.hitbox.halfWidth < platform.x + platform.width;
}
function resolveHorizontalCollision(world, actor, previousX) {
  if (world.wall?.isSolid) {
    const direction = Math.sign(actor.x - previousX);
    if (direction) {
      const edge = actor.x + direction * actor.hitbox.halfWidth;
      for (const yOffset of [-4, -actorHeight(actor) / 2, -actorHeight(actor) + 5]) {
        if (isSolid(world, edge, actor.y + yOffset)) { actor.x = previousX; actor.vx = 0; return { x: actor.x, y: actor.y }; }
      }
    }
    return null;
  }
  let blocked = null;
  for (const platform of world.config.platforms) {
    if (!overlapsPlatformVertically(world, actor, platform)) continue;
    const previousRight = previousX + actor.hitbox.halfWidth;
    const previousLeft = previousX - actor.hitbox.halfWidth;
    if (actor.vx > 0 && previousRight <= platform.x && actor.x + actor.hitbox.halfWidth > platform.x) { actor.x = platform.x - actor.hitbox.halfWidth; blocked = platform; }
    if (actor.vx < 0 && previousLeft >= platform.x + platform.width && actor.x - actor.hitbox.halfWidth < platform.x + platform.width) { actor.x = platform.x + platform.width + actor.hitbox.halfWidth; blocked = platform; }
  }
  return blocked;
}

function beginLedgeClimb(world, actor, platform, direction) {
  const ledgeHeight = actor.y - platform.y;
  if (actor.grounded || actor.vy < 0 || ledgeHeight < 20 || ledgeHeight > 56) return false;
  const big = ledgeHeight >= 38;
  actor.climb = { elapsed: 0, startX: actor.x, startY: actor.y, targetX: direction > 0 ? platform.x + actor.hitbox.halfWidth + 8 : platform.x + platform.width - actor.hitbox.halfWidth - 8, targetY: platform.y, animation: big ? 'climbbig' : 'climbsmall' };
  actor.vx = 0; actor.vy = 0; actor.grounded = false; setAnimation(actor, actor.climb.animation); return true;
}
function updateClimb(world, actor, dt) {
  if (!actor.climb) return false;
  const climb = actor.climb; climb.elapsed += dt;
  const progress = Math.min(1, climb.elapsed / world.config.climbDuration); const eased = 1 - (1 - progress) ** 2;
  actor.x = climb.startX + (climb.targetX - climb.startX) * eased; actor.y = climb.startY + (climb.targetY - climb.startY) * eased; actor.animationTime += dt;
  if (progress === 1) { actor.x = climb.targetX; actor.y = climb.targetY; actor.grounded = true; actor.climb = null; setAnimation(actor, 'idle'); }
  return true;
}
function applyPlatformPhysics(world, actor, dt) {
  const previousY = actor.y; actor.vy += world.config.gravity * dt; actor.y += actor.vy * dt; actor.grounded = false;
  if (world.wall?.isSolid) {
    const height = actorHeight(actor);
    const footSamples = [actor.x - actor.hitbox.halfWidth + 2, actor.x, actor.x + actor.hitbox.halfWidth - 2];
    if (actor.vy >= 0 && footSamples.some((x) => isSolid(world, x, actor.y))) { actor.y = previousY; actor.vy = 0; actor.grounded = true; }
    else if (actor.vy < 0 && footSamples.some((x) => isSolid(world, x, actor.y - height))) { actor.y = previousY; actor.vy = 0; }
    return;
  }
  if (actor.vy >= 0) {
    const landing = world.config.platforms.filter((p) => overlapsPlatformHorizontally(actor, p) && previousY <= p.y && actor.y >= p.y).sort((a, b) => a.y - b.y)[0];
    if (landing) { actor.y = landing.y; actor.vy = 0; actor.grounded = true; }
  } else {
    const ceiling = world.config.platforms.filter((p) => overlapsPlatformHorizontally(actor, p) && previousY - actorHeight(actor) >= p.y + p.height && actor.y - actorHeight(actor) < p.y + p.height).sort((a, b) => b.y - a.y)[0];
    if (ceiling) { actor.y = ceiling.y + ceiling.height + actorHeight(actor); actor.vy = 0; }
  }
}

function canStand(world, actor) { return !isSolid(world, actor.x - 17, actor.y - 45) && !isSolid(world, actor.x + 17, actor.y - 45); }
function updateCrouch(world, actor, requested) { actor.crouching = Boolean(requested) || (actor.crouching && !canStand(world, actor)); }
function reload(world, actor) {
  const gun = actor.weapon;
  if (gun.reloadRemaining || gun.clip === gun.clipMax || !gun.spare) return false;
  gun.reloadRemaining = gun.reloadDuration; world.events.push({ type: 'reload', actor: actor.id }); setAnimation(actor, 'reload'); return true;
}
function completeReload(actor) {
  const gun = actor.weapon; const loaded = Math.min(gun.clipMax - gun.clip, gun.spare); gun.clip += loaded; gun.spare -= loaded; gun.reloadRemaining = 0;
}
function spawnBullet(world, actor) {
  const gun = actor.weapon;
  if (!actor.alive || gun.reloadRemaining || actor.fireTimer > 0) return;
  if (!gun.clip) { reload(world, actor); return; }
  const muzzleDistance = 35; const muzzleX = actor.x + Math.cos(actor.aimAngle) * muzzleDistance; const muzzleY = actor.y - (actor.crouching ? 27 : 47) + Math.sin(actor.aimAngle) * muzzleDistance;
  gun.clip -= 1;
  world.bullets.push({ owner: actor.id, x: muzzleX, y: muzzleY, px: muzzleX, py: muzzleY, vx: Math.cos(actor.aimAngle) * world.config.bulletSpeed, vy: Math.sin(actor.aimAngle) * world.config.bulletSpeed, ttl: 0.8, damage: 1 });
  world.muzzleFlashes.push({ owner: actor.id, x: muzzleX, y: muzzleY, facing: actor.facing, angle: actor.aimAngle, ttl: world.config.muzzleFlashDuration });
  actor.fireTimer = world.config.fireCooldown; actor.crosshairSpread = Math.min(28, actor.crosshairSpread + 9); actor.recoil = 1;
  world.events.push({ type: 'fire', actor: actor.id });
  if (!gun.clip) reload(world, actor);
}
function damage(world, target, amount, owner) {
  if (!target.alive) return;
  target.hp = Math.max(0, target.hp - amount); target.hitTimer = 0.16; world.hitEffects.push({ x: target.x, y: target.y - 38, ttl: 0.16 }); world.events.push({ type: 'hit', actor: target.id });
  if (!target.hp) { target.alive = false; target.deathTimer = world.config.respawnDuration; world.events.push({ type: 'death', actor: target.id }); if (owner) world.score[owner] = (world.score[owner] ?? 0) + 1; }
}
function updateActor(world, actor, input, dt) {
  if (!actor.alive) { actor.deathTimer -= dt; if (actor.deathTimer <= 0) { actor.alive = true; actor.hp = actor.maxHp; actor.x = actor.spawnX; actor.y = actor.spawnY; actor.vx = actor.vy = 0; actor.weapon.clip = actor.weapon.clipMax; actor.weapon.spare = 90; } return; }
  if (updateClimb(world, actor, dt)) return;
  updateCrouch(world, actor, input.down);
  const left = Boolean(input.left); const right = Boolean(input.right); actor.vx = ((right ? 1 : 0) - (left ? 1 : 0)) * (actor.crouching ? world.config.crouchSpeed : world.config.moveSpeed);
  const gunY = actor.y - (actor.crouching ? 27 : 47); const aimX = Number.isFinite(input.aimX) ? input.aimX : actor.aimX; const aimY = Number.isFinite(input.aimY) ? input.aimY : actor.aimY;
  const dx = aimX - actor.x; const dy = aimY - gunY;
  if (dx || dy) { actor.aimX = aimX; actor.aimY = aimY; actor.aimAngle = Math.atan2(dy, dx); actor.facing = dx >= 0 ? 1 : -1; }
  if (input.jump && actor.grounded && !actor.crouching) { actor.vy = -world.config.jumpSpeed; actor.grounded = false; }
  const previousX = actor.x; actor.x = Math.max(actor.hitbox.halfWidth, Math.min(world.config.width - actor.hitbox.halfWidth, actor.x + actor.vx * dt));
  const blocked = resolveHorizontalCollision(world, actor, previousX); const direction = right ? 1 : left ? -1 : 0;
  if (blocked && direction && beginLedgeClimb(world, actor, blocked, direction)) { updateClimb(world, actor, dt); return; }
  applyPlatformPhysics(world, actor, dt);
  actor.fireTimer = Math.max(0, actor.fireTimer - dt); actor.hitTimer = Math.max(0, actor.hitTimer - dt); actor.crosshairSpread = Math.max(actor.crosshairRestSpread, actor.crosshairSpread - 26 * dt); actor.recoil = Math.max(0, actor.recoil - 7 * dt);
  if (actor.weapon.reloadRemaining) { actor.weapon.reloadRemaining -= dt; if (actor.weapon.reloadRemaining <= 0) completeReload(actor); }
  if (input.reload) reload(world, actor); if ((input.fire || input.firePressed) && !actor.weapon.reloadRemaining) spawnBullet(world, actor);
  if (!actor.grounded) setAnimation(actor, actor.vy < 0 ? 'jump' : 'fall'); else if (actor.weapon.reloadRemaining) setAnimation(actor, 'reload'); else if (actor.crouching) setAnimation(actor, Math.abs(actor.vx) > 1 ? 'duckrun' : 'duck'); else if (Math.abs(actor.vx) > 1) setAnimation(actor, 'run'); else setAnimation(actor, 'idle');
  actor.animationTime += dt;
}

function botInput(world, bot) {
  const ai = bot.ai; const candidates = world.players.filter((actor) => actor.id !== bot.id && actor.alive);
  if (world.frame % 12 === ai.scanFrame) {
    ai.targetId = candidates.filter((target) => Math.hypot(target.x - bot.x, target.y - bot.y) < 450 && hasLineOfSight(world, { x: bot.x, y: bot.y - (bot.crouching ? 20 : 50) }, { x: target.x, y: target.y - (target.crouching ? 20 : 40) })).sort((a, b) => Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y))[0]?.id ?? null;
  }
  const target = world.players.find((actor) => actor.id === ai.targetId);
  if (!target) {
    // Arena's hidden NodeWaypoint/NodeJump clips are the original patrol
    // anchors.  Their decoded coordinates replace the former sine-wave walk.
    const nodes = world.navigation;
    if (nodes.length) {
      if (ai.navIndex === null) ai.navIndex = nodes.reduce((closest, point, index) => (
        Math.hypot(point.x - bot.x, point.y - bot.y) < Math.hypot(nodes[closest].x - bot.x, nodes[closest].y - bot.y) ? index : closest
      ), 0);
      let node = nodes[ai.navIndex];
      if (Math.hypot(node.x - bot.x, node.y - bot.y) < 28) {
        ai.navIndex = (ai.navIndex + 1) % nodes.length;
        node = nodes[ai.navIndex];
      }
      const dx = node.x - bot.x;
      return { left: dx < -12, right: dx > 12, jump: node.type === 'jump' && Math.abs(dx) < 32 && bot.grounded, aimX: node.x, aimY: node.y - 40 };
    }
    return { left: Math.sin(world.elapsed * .7 + ai.scanFrame) < 0, right: Math.sin(world.elapsed * .7 + ai.scanFrame) >= 0, aimX: bot.x + bot.facing * 80, aimY: bot.y - 45 };
  }
  const distanceX = target.x - bot.x; const crouch = Math.abs(distanceX) < 160 && Math.floor(world.elapsed * 2) % 5 === 0;
  return { left: distanceX < -120, right: distanceX > 120, down: crouch, aimX: target.x, aimY: target.y - (target.crouching ? 20 : 40), fire: true, reload: bot.weapon.clip < 4 };
}

function segmentHitsActor(bullet, actor) {
  const radius = actor.hitbox.halfWidth + 5; const top = actor.y - actorHeight(actor); const bottom = actor.y;
  const closestX = Math.max(actor.x - radius, Math.min(bullet.x, actor.x + radius)); const closestY = Math.max(top, Math.min(bullet.y, bottom));
  return Math.hypot(bullet.x - closestX, bullet.y - closestY) < 8;
}
function updateBullets(world, dt) {
  world.bullets = world.bullets.filter((bullet) => {
    bullet.px = bullet.x; bullet.py = bullet.y; bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.ttl -= dt;
    const distance = Math.hypot(bullet.x - bullet.px, bullet.y - bullet.py); const steps = Math.ceil(distance / 8);
    for (let i = 1; i <= steps; i += 1) if (isSolid(world, bullet.px + (bullet.x - bullet.px) * i / steps, bullet.py + (bullet.y - bullet.py) * i / steps)) return false;
    const target = world.players.find((actor) => actor.id !== bullet.owner && actor.alive && segmentHitsActor(bullet, actor));
    if (target) { damage(world, target, bullet.damage, bullet.owner); return false; }
    return bullet.ttl > 0 && bullet.x >= 0 && bullet.x <= world.config.width && bullet.y >= 0 && bullet.y <= world.config.height;
  });
}
function decayEffects(items, dt) { return items.filter((item) => { item.ttl -= dt; return item.ttl > 0; }); }

export function step(world, inputs = {}, dt = 1 / 60) {
  const safeDt = Math.min(Math.max(dt, 0), 0.05); world.elapsed += safeDt; world.frame += 1;
  for (const player of world.players) updateActor(world, player, player.isBot ? botInput(world, player) : inputs[player.id] ?? {}, safeDt);
  updateBullets(world, safeDt); world.muzzleFlashes = decayEffects(world.muzzleFlashes, safeDt); world.hitEffects = decayEffects(world.hitEffects, safeDt); return world;
}
