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
  // Movement.as uses the centre foot probe and ±17px side probes.
  playerHitbox: { halfWidth: 17, height: 55, crouchHeight: 38 },
  // Compatibility fallback used before the Foundry alpha mask is decoded in the browser.
  platforms: [
    makePlatform(0, 714, 1280, 22), makePlatform(268, 551, 283), makePlatform(0, 579, 189),
    makePlatform(628, 579, 146), makePlatform(488, 644, 150), makePlatform(168, 646, 167),
    makePlatform(805, 525, 402), makePlatform(345, 382, 705), makePlatform(29, 341, 1220),
  ],
};

// The cyan NodePhysBox layer is the Foundry editor's authored collision data.
// Keep its complete rectangles, including crates and side walls: reducing it
// to thin floor strips made the unit walk through visible blue volumes.
// NodePhysBox's physical centre is 24px below the visible crate/platform
// registration in this Arena export.  The value is calibrated on the hanging
// crate at (491.15, 552.55), then applied once here to every decoded box so
// drawing, player physics, bullets and AI all use the same aligned geometry.
// The Foundry art is additionally 18px right of the editor's physics origin;
// retain every decoded width/height and correct only that shared translation.
const FOUNDRY_COLLISION_X_OFFSET = 18;
const FOUNDRY_COLLISION_Y_OFFSET = 24;
const FOUNDRY_COLLISION_BOXES = Object.freeze(
  FOUNDRY_LAYOUT.collisionBoxes.map((box) => Object.freeze({ ...box, x: box.x + FOUNDRY_COLLISION_X_OFFSET, y: box.y + FOUNDRY_COLLISION_Y_OFFSET })),
);

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
  playerHitbox: { halfWidth: 17, height: 55, crouchHeight: 38 },
  platforms: [],
});

function makeActor(id, spawnX, spawnY, color, isBot = false, config = CONFIG) {
  return {
    id, spawnX, spawnY, x: spawnX, y: spawnY, vx: 0, vy: 0, facing: 1,
    aimX: spawnX + 100, aimY: spawnY - 47, aimAngle: 0,
    animation: 'idle', animationTime: 0, animationFrame: 1, animationBlend: 0, climb: null,
    crouching: false, crosshairRestSpread: 7, crosshairSpread: 7, recoil: 0,
    grounded: true, alive: true, maxHp: 5, hp: 5, hitTimer: 0, deathTimer: 0,
    fireTimer: 0, weapon: { clip: 30, clipMax: 30, spare: 90, reloadRemaining: 0, reloadDuration: config.reloadDuration },
    color, isBot, ai: isBot ? { scanFrame: id === 'bot1' ? 4 : 8, targetId: null, aimSpeed: 0.21, difficulty: 6, crouchTimer: 0, navIndex: null } : null,
    hitbox: { ...config.playerHitbox },
  };
}

export const UNITMC_FRAMES = Object.freeze({
  idle: [1, 20], run: [21, 38], runback: [58, 75], jump: [191, 208], fall: [209, 229], fallloop: [230, 264],
  duck: [302, 305], duckloop: [306, 321], getup: [388, 391], duckrun: [322, 354],
  duckrunback: [355, 387], climbsmall: [392, 396], climbbig: [397, 408], landhard: [409, 449],
});

function boxEdges(box) {
  return { left: box.x - box.width / 2, right: box.x + box.width / 2, top: box.y - box.height / 2, bottom: box.y + box.height / 2 };
}
function boxSolid(boxes, x, y) {
  return boxes.some((box) => {
    const edge = boxEdges(box);
    return x >= edge.left && x <= edge.right && y >= edge.top && y <= edge.bottom;
  });
}

export function createWorld(options = {}) {
  const foundry = Boolean(options.foundry);
  const baseConfig = foundry ? FOUNDRY_CONFIG : CONFIG;
  const p1Spawn = foundry ? FOUNDRY_LAYOUT.spawns.find((spawn) => spawn.name === 'b_0') : { x: 430 * MAP_SCALE, y: 551 * MAP_SCALE };
  const p2Spawn = foundry ? FOUNDRY_LAYOUT.spawns.find((spawn) => spawn.name === 'g_0') : { x: 1040 * MAP_SCALE, y: 525 * MAP_SCALE };
  const p1 = makeActor('p1', p1Spawn.x, p1Spawn.y, '#48b7ff', false, baseConfig);
  const humans = options.multiplayer ? [makeActor('p2', p2Spawn.x, p2Spawn.y, '#f4a35f', false, baseConfig)] : [];
  const bots = options.bots === false || options.multiplayer ? [] : [makeActor('bot1', p2Spawn.x, p2Spawn.y, '#ef806d', true, baseConfig)];
  return {
    config: { ...baseConfig, playerHitbox: { ...baseConfig.playerHitbox }, platforms: baseConfig.platforms.map((platform) => ({ ...platform })) },
    navigation: foundry ? FOUNDRY_LAYOUT.navigation.map((point) => ({ ...point })) : [],
    actions: foundry ? FOUNDRY_LAYOUT.actions.map((point) => ({ ...point })) : [],
    pickups: foundry ? FOUNDRY_LAYOUT.pickups.map((point) => ({ ...point })) : [],
    // Full source rectangles are retained separately from an optional pixel
    // wall, so player collision can resolve their top/side faces precisely.
    collisionBoxes: foundry ? FOUNDRY_COLLISION_BOXES.map((box) => ({ ...box })) : [],
    wall: options.wall ?? null,
    players: [p1, ...humans, ...bots], bots, bullets: [], muzzleFlashes: [], hitEffects: [], events: [], score: { p1: 0, p2: 0, bot1: 0 }, elapsed: 0, frame: 0,
  };
}

function actorHeight(actor) { return actor.crouching ? actor.hitbox.crouchHeight : actor.hitbox.height; }
function syncAnimationFrame(actor) {
  const range = UNITMC_FRAMES[actor.animation] ?? UNITMC_FRAMES.idle;
  const frameTime = actor.animationTime * 30;
  actor.animationFrame = range[0] + Math.floor(frameTime) % (range[1] - range[0] + 1);
  actor.animationBlend = frameTime - Math.floor(frameTime);
}
function setAnimation(actor, animation) {
  if (actor.animation !== animation) actor.animationTime = 0;
  actor.animation = animation;
  syncAnimationFrame(actor);
}

function platformSolid(world, x, y) {
  return world.config.platforms.some((p) => x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height);
}

export function isSolid(world, x, y) {
  if (x < 0 || x >= world.config.width || y < 0 || y >= world.config.height) return true;
  if (world.wall?.isSolid) return Boolean(world.wall.isSolid(x, y));
  if (world.collisionBoxes?.length) return boxSolid(world.collisionBoxes, x, y);
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
function wallBodyBlocked(world, actor, x, y, direction) {
  const edge = x + direction * actor.hitbox.halfWidth;
  // The original Movement.as uses side torso probes only.  The foot is left
  // free to enter the next pixel column of a shallow authored ramp.
  const offsets = actor.crouching ? [-20, -25, -35] : [-20, -25, -35, -45];
  if (offsets.some((offset) => isSolid(world, edge, y + offset))) return true;
  // Preserve a hard stop for a low sheer wall, while accepting a gradual
  // change between the centre and leading-foot surfaces.
  const surfaceRise = (sampleX) => {
    for (let rise = 60; rise >= 0; rise -= 1) if (isSolid(world, sampleX, y - rise + 1)) return rise;
    return null;
  };
  const centreRise = surfaceRise(x);
  const edgeRise = surfaceRise(edge);
  return edgeRise !== null && (centreRise === null || edgeRise - centreRise > 10);
}
function wallHasFloor(world, actor, x, y) {
  // Movement.as resolves standing/stepping from the centre-foot probe.  Side
  // probes belong to body collision only: treating either side as a floor
  // raises a unit while it is merely pressed against a tall crate.
  return isSolid(world, x, y + 1);
}
function findWallStep(world, actor, direction) {
  // Movement.as settles the feet against the alpha mask; this lets shallow
  // ramps rise smoothly instead of behaving like an abrupt vertical wall.
  for (let rise = 1; rise <= 18; rise += 1) {
    const y = actor.y - rise;
    if (wallHasFloor(world, actor, actor.x, y) && !wallBodyBlocked(world, actor, actor.x, y, direction)) return y;
  }
  return null;
}
function findWallLedge(world, actor, direction) {
  // Movement.as checks the leading edge at ±17, detecting a small ledge at
  // -20 or a big ledge at -40 only if the -55 head-clearance point is empty.
  const probeX = actor.x + direction * 17;
  const clearAbove = !isSolid(world, probeX, actor.y - 55);
  const requestedRise = isSolid(world, probeX, actor.y - 40) && clearAbove ? 40
    : isSolid(world, probeX, actor.y - 20) && clearAbove ? 20 : 0;
  const targetX = actor.x + direction * 17;
  if (requestedRise) {
    const targetY = actor.y - requestedRise;
    if (wallHasFloor(world, actor, targetX, targetY) && !wallBodyBlocked(world, actor, targetX, targetY, direction)) {
      return { wall: true, x: targetX, y: targetY };
    }
  }
  // Keep a short scan for sloped authored geometry that lies between the
  // original 20/40 probes.
  for (let rise = 20; rise <= 56; rise += 1) {
    const targetY = actor.y - rise;
    if (wallHasFloor(world, actor, targetX, targetY) && !wallBodyBlocked(world, actor, targetX, targetY, direction)) return { wall: true, x: targetX, y: targetY };
  }
  return null;
}
function resolveHorizontalCollision(world, actor, previousX) {
  if (!world.wall?.isSolid && world.collisionBoxes?.length) {
    const direction = Math.sign(actor.x - previousX);
    if (!direction) return null;
    const height = actorHeight(actor);
    const previousLeft = previousX - actor.hitbox.halfWidth;
    const previousRight = previousX + actor.hitbox.halfWidth;
    const currentLeft = actor.x - actor.hitbox.halfWidth;
    const currentRight = actor.x + actor.hitbox.halfWidth;
    const hit = world.collisionBoxes.map((box) => ({ box, edge: boxEdges(box) })).filter(({ edge }) => (
      actor.y > edge.top && actor.y - height < edge.bottom
      && (direction > 0 ? previousRight <= edge.left && currentRight > edge.left : previousLeft >= edge.right && currentLeft < edge.right)
    )).sort((a, b) => direction > 0 ? a.edge.left - b.edge.left : b.edge.right - a.edge.right)[0];
    if (!hit) return null;
    actor.x = direction > 0 ? hit.edge.left - actor.hitbox.halfWidth : hit.edge.right + actor.hitbox.halfWidth;
    actor.vx = 0;
    return { ...hit.edge, x: hit.edge.left, y: hit.edge.top, width: hit.box.width, height: hit.box.height, box: true };
  }
  if (world.wall?.isSolid) {
    const direction = Math.sign(actor.x - previousX);
    if (direction && wallBodyBlocked(world, actor, actor.x, actor.y, direction)) {
      const stepY = findWallStep(world, actor, direction);
      if (stepY !== null) { actor.y = stepY; actor.grounded = true; actor.vy = 0; return null; }
      actor.x = previousX; actor.vx = 0;
      return findWallLedge(world, actor, direction) ?? { wall: true, x: actor.x, y: actor.y };
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
  if (platform.box) return false;
  const ledgeHeight = actor.y - platform.y;
  if (actor.grounded || actor.vy < 0 || ledgeHeight < 20 || ledgeHeight > 56) return false;
  const big = ledgeHeight >= 38;
  const targetX = platform.wall ? platform.x : direction > 0 ? platform.x + actor.hitbox.halfWidth + 8 : platform.x + platform.width - actor.hitbox.halfWidth - 8;
  actor.climb = { elapsed: 0, startX: actor.x, startY: actor.y, targetX, targetY: platform.y, animation: big ? 'climbbig' : 'climbsmall' };
  actor.vx = 0; actor.vy = 0; actor.grounded = false; setAnimation(actor, actor.climb.animation); return true;
}
function updateClimb(world, actor, dt) {
  if (!actor.climb) return false;
  const climb = actor.climb; climb.elapsed += dt;
  const progress = Math.min(1, climb.elapsed / world.config.climbDuration); const eased = 1 - (1 - progress) ** 2;
  actor.x = climb.startX + (climb.targetX - climb.startX) * eased; actor.y = climb.startY + (climb.targetY - climb.startY) * eased; actor.animationTime += dt; syncAnimationFrame(actor);
  if (progress === 1) {
    actor.x = climb.targetX; actor.y = climb.targetY;
    // Original Movement.as removes centre-foot overlap immediately when a
    // climb ends instead of letting repeated gravity ticks shake it upward.
    if (world.wall?.isSolid) for (let lift = 0; lift < 160 && isSolid(world, actor.x, actor.y); lift += 1) actor.y -= .5;
    actor.grounded = true; actor.climb = null; setAnimation(actor, 'idle');
  }
  return true;
}
function applyPlatformPhysics(world, actor, dt) {
  const previousY = actor.y; actor.vy += world.config.gravity * dt; actor.y += actor.vy * dt; actor.grounded = false;
  if (!world.wall?.isSolid && world.collisionBoxes?.length) {
    const height = actorHeight(actor);
    if (actor.vy >= 0) {
      const landing = world.collisionBoxes.map((box) => ({ box, edge: boxEdges(box) })).filter(({ edge }) => (
        actor.x + actor.hitbox.halfWidth > edge.left && actor.x - actor.hitbox.halfWidth < edge.right
        && previousY <= edge.top && actor.y >= edge.top
      )).sort((a, b) => a.edge.top - b.edge.top)[0];
      if (landing) { actor.y = landing.edge.top; actor.vy = 0; actor.grounded = true; }
    } else {
      const ceiling = world.collisionBoxes.map((box) => ({ box, edge: boxEdges(box) })).filter(({ edge }) => (
        actor.x + actor.hitbox.halfWidth > edge.left && actor.x - actor.hitbox.halfWidth < edge.right
        && previousY - height >= edge.bottom && actor.y - height < edge.bottom
      )).sort((a, b) => b.edge.bottom - a.edge.bottom)[0];
      if (ceiling) { actor.y = ceiling.edge.bottom + height; actor.vy = 0; }
    }
    return;
  }
  if (world.wall?.isSolid) {
    const height = actorHeight(actor);
    const footSamples = [actor.x];
    if (actor.vy >= 0) {
      let contactY = null;
      for (let y = Math.floor(previousY); y <= Math.ceil(actor.y); y += 1) {
        if (footSamples.some((x) => isSolid(world, x, y))) { contactY = y; break; }
      }
      if (contactY !== null) { actor.y = contactY - 1; actor.vy = 0; actor.grounded = true; }
    }
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
  if (!actor.grounded && actor.vy >= 0 && direction && (world.wall?.isSolid || !world.collisionBoxes?.length)) {
    const ledge = findWallLedge(world, actor, direction);
    if (ledge && beginLedgeClimb(world, actor, ledge, direction)) { updateClimb(world, actor, dt); return; }
  }
  actor.fireTimer = Math.max(0, actor.fireTimer - dt); actor.hitTimer = Math.max(0, actor.hitTimer - dt); actor.crosshairSpread = Math.max(actor.crosshairRestSpread, actor.crosshairSpread - 26 * dt); actor.recoil = Math.max(0, actor.recoil - 7 * dt);
  if (actor.weapon.reloadRemaining) { actor.weapon.reloadRemaining -= dt; if (actor.weapon.reloadRemaining <= 0) completeReload(actor); }
  if (input.reload) reload(world, actor); if ((input.fire || input.firePressed) && !actor.weapon.reloadRemaining) spawnBullet(world, actor);
  const movingBackward = actor.vx * actor.facing < -1;
  const fallingAnimation = actor.animation === 'fall' && actor.animationTime >= (UNITMC_FRAMES.fall[1] - UNITMC_FRAMES.fall[0] + 1) / 30 ? 'fallloop' : 'fall';
  const crouchAnimation = actor.animation === 'duck' && actor.animationTime >= (UNITMC_FRAMES.duck[1] - UNITMC_FRAMES.duck[0] + 1) / 30 ? 'duckloop' : actor.animation === 'duckloop' ? 'duckloop' : 'duck';
  if (!actor.grounded) setAnimation(actor, actor.vy < 0 ? 'jump' : fallingAnimation); else if (actor.weapon.reloadRemaining) setAnimation(actor, 'reload'); else if (actor.crouching) setAnimation(actor, Math.abs(actor.vx) > 1 ? movingBackward ? 'duckrunback' : 'duckrun' : crouchAnimation); else if (Math.abs(actor.vx) > 1) setAnimation(actor, movingBackward ? 'runback' : 'run'); else setAnimation(actor, 'idle');
  actor.animationTime += dt;
  // The SWF runs at 30 fps while this browser loop is normally 60 fps.
  // Keep the original frame range, but expose the fractional frame so its
  // per-part matrices can blend smoothly instead of snapping every 33 ms.
  syncAnimationFrame(actor);
}

function botInput(world, bot) {
  const ai = bot.ai; const candidates = world.players.filter((actor) => actor.id !== bot.id && actor.alive);
  if (world.frame % 12 === ai.scanFrame) {
    ai.targetId = candidates.filter((target) => Math.hypot(target.x - bot.x, target.y - bot.y) < 450 && hasLineOfSight(world, { x: bot.x, y: bot.y - (bot.crouching ? 20 : 50) }, { x: target.x, y: target.y - (target.crouching ? 20 : 40) })).sort((a, b) => Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y))[0]?.id ?? null;
  }
  const target = world.players.find((actor) => actor.id === ai.targetId);
  if (!target) {
    // Arena's NodeWaypoint connectors are the original patrol anchors; its
    // NodeAiAction instances add jump/crouch instructions at those anchors.
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
      const action = world.actions.find((item) => item.name.startsWith('j_') && item.connections.includes(node.id) && Math.abs(item.x - bot.x) < 42 && Math.abs(item.y - bot.y) < 70);
      return { left: dx < -12, right: dx > 12, jump: Boolean(action) && bot.grounded, aimX: node.x, aimY: node.y - 40 };
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
