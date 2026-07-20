const MAP_SCALE = 2591 / 1280;

function makePlatform(x, y, width, height = 20) {
  return {
    x: x * MAP_SCALE,
    y: y * MAP_SCALE,
    width: width * MAP_SCALE,
    height: height * MAP_SCALE,
  };
}

const CONFIG = {
  width: 2591,
  height: 1457,
  floorY: 714 * MAP_SCALE,
  gravity: 1500,
  moveSpeed: 300,
  jumpSpeed: 620,
  bulletSpeed: 780,
  fireCooldown: 0.18,
  muzzleFlashDuration: 0.075,
  climbDuration: 0.28,
  playerHitbox: { halfWidth: 13, height: 62 },
  // Solid, continuous collision volumes traced against the laboratory art.
  platforms: [
    makePlatform(0, 714, 1280, 22),
    makePlatform(268, 551, 283),
    makePlatform(0, 579, 189),
    makePlatform(628, 579, 146),
    makePlatform(488, 644, 150),
    makePlatform(168, 646, 167),
    makePlatform(805, 525, 402),
    makePlatform(345, 382, 705),
    makePlatform(29, 341, 1220),
  ],
};

function makePlayer() {
  return {
    id: 'p1',
    spawnX: 430 * MAP_SCALE,
    spawnY: 551 * MAP_SCALE,
    x: 430 * MAP_SCALE,
    y: 551 * MAP_SCALE,
    vx: 0,
    vy: 0,
    facing: 1,
    aimX: 530 * MAP_SCALE,
    aimY: 504 * MAP_SCALE,
    aimAngle: 0,
    animation: 'idle',
    animationTime: 0,
    climb: null,
    crosshairRestSpread: 7,
    crosshairSpread: 7,
    recoil: 0,
    grounded: true,
    alive: true,
    maxHp: 5,
    hp: 5,
    fireTimer: 0,
    color: '#48b7ff',
    hitbox: { ...CONFIG.playerHitbox },
  };
}

export function createWorld() {
  return {
    config: { ...CONFIG, playerHitbox: { ...CONFIG.playerHitbox } },
    players: [makePlayer()],
    bots: [],
    bullets: [],
    muzzleFlashes: [],
    score: { p1: 0 },
    elapsed: 0,
  };
}

function spawnBullet(world, player) {
  const muzzleDistance = 35;
  const muzzleX = player.x + Math.cos(player.aimAngle) * muzzleDistance;
  const muzzleY = player.y - 47 + Math.sin(player.aimAngle) * muzzleDistance;
  world.bullets.push({
    owner: player.id,
    x: muzzleX,
    y: muzzleY,
    vx: Math.cos(player.aimAngle) * world.config.bulletSpeed,
    vy: Math.sin(player.aimAngle) * world.config.bulletSpeed,
    ttl: 0.16,
  });
  world.muzzleFlashes.push({
    owner: player.id,
    x: muzzleX,
    y: muzzleY,
    facing: player.facing,
    angle: player.aimAngle,
    ttl: world.config.muzzleFlashDuration,
  });
  player.fireTimer = world.config.fireCooldown;
  player.crosshairSpread = Math.min(28, player.crosshairSpread + 9);
  player.recoil = 1;
}

function overlapsPlatformVertically(actor, platform) {
  return actor.y > platform.y && actor.y - actor.hitbox.height < platform.y + platform.height;
}

function overlapsPlatformHorizontally(actor, platform) {
  return actor.x + actor.hitbox.halfWidth > platform.x && actor.x - actor.hitbox.halfWidth < platform.x + platform.width;
}

function resolveHorizontalCollision(world, actor, previousX) {
  let blockedPlatform = null;
  for (const platform of world.config.platforms) {
    if (!overlapsPlatformVertically(actor, platform)) continue;
    const previousRight = previousX + actor.hitbox.halfWidth;
    const previousLeft = previousX - actor.hitbox.halfWidth;
    if (actor.vx > 0 && previousRight <= platform.x && actor.x + actor.hitbox.halfWidth > platform.x) {
      actor.x = platform.x - actor.hitbox.halfWidth;
      blockedPlatform = platform;
    }
    if (actor.vx < 0 && previousLeft >= platform.x + platform.width && actor.x - actor.hitbox.halfWidth < platform.x + platform.width) {
      actor.x = platform.x + platform.width + actor.hitbox.halfWidth;
      blockedPlatform = platform;
    }
  }
  return blockedPlatform;
}

function setAnimation(player, animation) {
  if (player.animation !== animation) player.animationTime = 0;
  player.animation = animation;
}

function beginLedgeClimb(world, player, platform, direction) {
  const ledgeHeight = player.y - platform.y;
  if (player.grounded || player.vy < 0 || ledgeHeight < 20 || ledgeHeight > 56) return false;
  const isBig = ledgeHeight >= 38;
  const targetX = direction > 0
    ? platform.x + player.hitbox.halfWidth + 8
    : platform.x + platform.width - player.hitbox.halfWidth - 8;
  player.climb = {
    elapsed: 0,
    startX: player.x,
    startY: player.y,
    targetX,
    targetY: platform.y,
    animation: isBig ? 'climbbig' : 'climbsmall',
  };
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  setAnimation(player, player.climb.animation);
  return true;
}

function updateClimb(world, player, dt) {
  const climb = player.climb;
  if (!climb) return false;
  climb.elapsed += dt;
  const progress = Math.min(1, climb.elapsed / world.config.climbDuration);
  const eased = 1 - (1 - progress) ** 2;
  player.x = climb.startX + (climb.targetX - climb.startX) * eased;
  player.y = climb.startY + (climb.targetY - climb.startY) * eased;
  player.animationTime += dt;
  if (progress === 1) {
    player.x = climb.targetX;
    player.y = climb.targetY;
    player.grounded = true;
    player.climb = null;
    setAnimation(player, 'idle');
  }
  return true;
}

function updateAnimation(player, dt) {
  if (player.climb) return;
  if (!player.grounded) setAnimation(player, player.vy < 0 ? 'jump' : 'fall');
  else if (Math.abs(player.vx) > 1) setAnimation(player, 'run');
  else setAnimation(player, 'idle');
  player.animationTime += dt;
}

function applyPlatformPhysics(world, actor, dt) {
  const previousY = actor.y;
  actor.vy += world.config.gravity * dt;
  actor.y += actor.vy * dt;
  actor.grounded = false;
  if (actor.vy >= 0) {
    const landing = world.config.platforms
      .filter((platform) => overlapsPlatformHorizontally(actor, platform) && previousY <= platform.y && actor.y >= platform.y)
      .sort((a, b) => a.y - b.y)[0];
    if (landing) {
      actor.y = landing.y;
      actor.vy = 0;
      actor.grounded = true;
    }
  } else {
    const ceiling = world.config.platforms
      .filter((platform) => overlapsPlatformHorizontally(actor, platform) && previousY - actor.hitbox.height >= platform.y + platform.height && actor.y - actor.hitbox.height < platform.y + platform.height)
      .sort((a, b) => b.y - a.y)[0];
    if (ceiling) {
      actor.y = ceiling.y + ceiling.height + actor.hitbox.height;
      actor.vy = 0;
    }
  }
}

function updatePlayer(world, player, input, dt) {
  if (updateClimb(world, player, dt)) return;
  const left = Boolean(input.left);
  const right = Boolean(input.right);
  player.vx = ((right ? 1 : 0) - (left ? 1 : 0)) * world.config.moveSpeed;
  const gunY = player.y - 47;
  const aimX = Number.isFinite(input.aimX) ? input.aimX : player.aimX;
  const aimY = Number.isFinite(input.aimY) ? input.aimY : player.aimY;
  const aimDeltaX = aimX - player.x;
  const aimDeltaY = aimY - gunY;
  if (aimDeltaX !== 0 || aimDeltaY !== 0) {
    player.aimX = aimX;
    player.aimY = aimY;
    player.aimAngle = Math.atan2(aimDeltaY, aimDeltaX);
    player.facing = aimDeltaX >= 0 ? 1 : -1;
  }
  if (input.jump && player.grounded) {
    player.vy = -world.config.jumpSpeed;
    player.grounded = false;
  }
  const previousX = player.x;
  player.x = Math.max(player.hitbox.halfWidth, Math.min(world.config.width - player.hitbox.halfWidth, player.x + player.vx * dt));
  const blockedPlatform = resolveHorizontalCollision(world, player, previousX);
  const direction = right ? 1 : (left ? -1 : 0);
  if (blockedPlatform && direction && beginLedgeClimb(world, player, blockedPlatform, direction)) {
    updateClimb(world, player, dt);
    return;
  }
  applyPlatformPhysics(world, player, dt);
  player.fireTimer = Math.max(0, player.fireTimer - dt);
  player.crosshairSpread = Math.max(player.crosshairRestSpread, player.crosshairSpread - 26 * dt);
  player.recoil = Math.max(0, player.recoil - 7 * dt);
  if ((input.fire || input.firePressed) && player.fireTimer === 0) spawnBullet(world, player);
  updateAnimation(player, dt);
}

function updateBullets(world, dt) {
  world.bullets = world.bullets.filter((bullet) => {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.ttl -= dt;
    return bullet.ttl > 0 && bullet.x >= 0 && bullet.x <= world.config.width && bullet.y >= 0 && bullet.y <= world.config.height;
  });
}

function updateMuzzleFlashes(world, dt) {
  world.muzzleFlashes = world.muzzleFlashes.filter((flash) => {
    flash.ttl -= dt;
    return flash.ttl > 0;
  });
}

export function step(world, inputs = {}, dt = 1 / 60) {
  const safeDt = Math.min(Math.max(dt, 0), 0.05);
  world.elapsed += safeDt;
  updatePlayer(world, world.players[0], inputs.p1 ?? {}, safeDt);
  updateBullets(world, safeDt);
  updateMuzzleFlashes(world, safeDt);
  return world;
}
