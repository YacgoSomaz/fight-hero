import { FOUNDRY_LAYOUT } from './foundry-layout.mjs';
import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';

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

// Exact Stats_Maps.as `map` field: variants change Bg/BgSky, not Arena's
// terrain timeline.  Keeping the requested id separately lets the renderer
// choose the correct original day/night art without duplicating physics.
const TERRAIN_MAP_BY_ID = Object.freeze({
  foundry2: 'foundry', plane2: 'plane', swamp2: 'swamp', cave2: 'cave', missile2: 'missile',
});

// Stats_Misc.as defines these three as the team rule sets.  Keep this small
// table close to world creation so an Arena node can be used without guessing
// which side a player or bot belongs to.
const TEAM_MODES = new Set(['tdm', 'ctf', 'dom']);
const MODE_SCORE_DEFAULTS = Object.freeze({ dm: 10, tdm: 25, ctf: 3, dom: 50, jug: 10 });

function sourcePoint(item) {
  const [id, connections = ''] = item.name.split('_');
  const point = { name: item.name, id, connections, x: item.x, y: item.y };
  if (item.type === 'action') { point.width = 85 * item.scaleX; point.height = 85 * item.scaleY; }
  return point;
}
function sourceCollision(item) {
  return { x: item.x, y: item.y, width: 85 * item.scaleX, height: 85 * item.scaleY };
}
function sourceMapConfig(layout) {
  const boxes = layout.nodes.filter((item) => item.type === 'collisionBox').map(sourceCollision);
  const right = Math.max(...boxes.map((box) => box.x + box.width / 2));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height / 2));
  // Arena's outer NodePhysBox rectangles deliberately extend a little beyond
  // its visible edges.  Keep that authored buffer but do not fabricate a
  // generic floor or platform list for source maps.
  return { ...FOUNDRY_CONFIG, width: Math.ceil(right + 40), height: Math.ceil(bottom + 40), floorY: Math.floor(bottom - 42) };
}
function decodedMap(mapId) {
  if (mapId === 'foundry') {
    return {
      config: FOUNDRY_CONFIG,
      collisionBoxes: FOUNDRY_COLLISION_BOXES,
      navigation: FOUNDRY_LAYOUT.navigation,
      actions: FOUNDRY_LAYOUT.actions,
      pickups: FOUNDRY_LAYOUT.pickups,
      sourceNodes: ARENA_SOURCE_LAYOUTS.foundry.nodes,
      spawns: FOUNDRY_LAYOUT.spawns,
      nodeOffset: { x: FOUNDRY_COLLISION_X_OFFSET, y: FOUNDRY_COLLISION_Y_OFFSET },
    };
  }
  const source = ARENA_SOURCE_LAYOUTS[mapId];
  if (!source) return null;
  const nodes = source.nodes;
  return {
    config: sourceMapConfig(source),
    collisionBoxes: nodes.filter((item) => item.type === 'collisionBox').map(sourceCollision),
    navigation: nodes.filter((item) => item.type === 'waypoint').map(sourcePoint),
    actions: nodes.filter((item) => item.type === 'action').map(sourcePoint),
    pickups: nodes.filter((item) => item.type === 'pickup').map(sourcePoint),
    sourceNodes: nodes,
    spawns: nodes.filter((item) => item.type === 'spawn').map(sourcePoint),
    nodeOffset: { x: 0, y: 0 },
  };
}

function decodedObjectives(map, mode, random) {
  const nodes = map?.sourceNodes ?? [];
  if (mode === 'ctf') {
    // Arena.Init() flips the two teams with a 50% chance, then preserves the
    // authored flag ids/locations.  This keeps the exact original `a__1`
    // convention while allowing either side to spawn as team 1.
    const [teamForSourceOne, teamForSourceTwo] = random() < .5 ? [2, 1] : [1, 2];
    return {
      flags: nodes.filter((item) => item.type === 'ctfFlag').map((item) => {
        const [id, sourceTeam] = item.name.split('__');
        return { id, x: item.x, y: item.y, team: Number(sourceTeam) === 1 ? teamForSourceOne : teamForSourceTwo, sourceTeam: Number(sourceTeam), carrierId: null };
      }),
      holdpoints: [],
    };
  }
  if (mode === 'dom') {
    return {
      flags: [],
      holdpoints: nodes.filter((item) => item.type === 'holdpoint').sort((a, b) => a.x - b.x).map((item, index) => ({
        letter: 'ABCDE'[index] ?? 'X', x: item.x, y: item.y, team: 0, progress: -65, capturedBy: null,
      })),
    };
  }
  return { flags: [], holdpoints: [] };
}

function makeActor(id, spawnX, spawnY, color, isBot = false, config = CONFIG, team = 0) {
  return {
    id, spawnX, spawnY, x: spawnX, y: spawnY, vx: 0, vy: 0, facing: 1,
    aimX: spawnX + 100, aimY: spawnY - 47, aimAngle: 0,
    animation: 'idle', animationTime: 0, animationFrame: 1, animationBlend: 0, climb: null,
    crouching: false, crosshairRestSpread: 7, crosshairSpread: 7, recoil: 0,
    classAim: SOURCE_MEDIC_LEVEL_ONE_AIM, dynRecoil: SOURCE_M4_RECOIL, dynRecoilMod: SOURCE_M4_RECOIL * (2 - SOURCE_MEDIC_LEVEL_ONE_AIM),
    grounded: true, alive: true, maxHp: 5, hp: 5, hitTimer: 0, deathTimer: 0,
    fireTimer: 0, weapon: { clip: 30, clipMax: 30, spare: 90, reloadRemaining: 0, reloadDuration: config.reloadDuration, range: 60, recoil: SOURCE_M4_RECOIL, shootDelay: 0.15 },
    color, team, carriedFlagId: null, isJug: false, isBot, ai: isBot ? {
      scanFrame: id === 'bot1' ? 4 : 8, targetId: null, aimSpeed: 0.21, difficulty: 6,
      navIndex: null, currentWaypointId: null, nextWaypointId: null, waypointFrames: 0, blockedFrames: 0,
      huntTargetId: null, huntGoalWaypointId: null, huntFrames: 0, routeIds: [],
      stuckFrames: 0, lastX: null, lastY: null,
      waitFrames: 0, noWaitFrames: 0, crouchFrames: 0, aimX: null, aimY: null,
    } : null,
    hitbox: { ...config.playerHitbox },
  };
}

export const UNITMC_FRAMES = Object.freeze({
  idle: [1, 20], run: [21, 38], runback: [58, 75], jump: [191, 208], fall: [209, 229], fallloop: [230, 264],
  duck: [302, 305], duckloop: [306, 321], getup: [388, 391], duckrun: [322, 354],
  duckrunback: [355, 387], climbsmall: [392, 396], climbbig: [397, 408], landhard: [409, 449],
});

// Unit.as aims from MC.arm1, not from the unit's foot/centre.  The arm canvas
// is reconstructed from the original rifle idle label (501/668 frame 77),
// its M4 gun child (375 frame 20), and the fixed Medic skin subparts.
const ARM1_PIVOT = Object.freeze({ x: 0.3, y: -42 });
// Stats_Guns.addGun(1,"M4",..., range 60, recoil 4, ...) and
// Stats_Classes.getClass(1, 1): Medic aimMin 70, normalised by Unit.as.
const SOURCE_M4_RECOIL = 4;
const SOURCE_MEDIC_LEVEL_ONE_AIM = 0.7;
// The M4 child is positioned relative to the Medic hand and its duplicate
// rife_clip layer is excluded; keep the ballistic origin on the final tip.
const RIFLE_BARREL_TIP = Object.freeze({ x: 71, y: -8 });
export const RIFLE_ARM_BASE_ANGLE = Math.atan2(RIFLE_BARREL_TIP.y, RIFLE_BARREL_TIP.x);
const RIFLE_MUZZLE_DISTANCE = Math.hypot(RIFLE_BARREL_TIP.x, RIFLE_BARREL_TIP.y);

export function getAimPivot(actor, facing = actor.facing) {
  return { x: actor.x + ARM1_PIVOT.x * facing, y: actor.y + ARM1_PIVOT.y };
}

export function getMuzzleOrigin(actor) {
  const pivot = getAimPivot(actor);
  // The renderer compensates this reconstructed canvas's small barrel tilt by
  // RIFLE_ARM_BASE_ANGLE.  Its visible tip therefore lies exactly on the
  // actor aim ray for either mirrored facing direction.
  const cosine = Math.cos(actor.aimAngle) * RIFLE_MUZZLE_DISTANCE;
  const sine = Math.sin(actor.aimAngle) * RIFLE_MUZZLE_DISTANCE;
  return {
    x: pivot.x + cosine,
    y: pivot.y + sine,
  };
}

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
  const mapId = options.mapId ?? (options.foundry ? 'foundry' : 'prototype');
  const terrainMapId = TERRAIN_MAP_BY_ID[mapId] ?? mapId;
  const map = decodedMap(terrainMapId);
  const mode = options.mode ?? 'dm';
  const random = typeof options.random === 'function' ? options.random : Math.random;
  const usesTeams = TEAM_MODES.has(mode);
  const baseConfig = map?.config ?? CONFIG;
  const soloP1Spawn = map?.spawns.find((spawn) => spawn.name === 'b_0') ?? map?.spawns.find((spawn) => spawn.name.endsWith('_0')) ?? { x: 430 * MAP_SCALE, y: 551 * MAP_SCALE };
  const soloP2Spawn = map?.spawns.find((spawn) => spawn.name === 'g_0') ?? map?.spawns.find((spawn) => spawn.name.endsWith('_2')) ?? { x: 1040 * MAP_SCALE, y: 525 * MAP_SCALE };
  const p1Spawn = usesTeams ? map?.spawns.find((spawn) => spawn.name.endsWith('_1')) ?? soloP1Spawn : soloP1Spawn;
  const p2Spawn = usesTeams ? map?.spawns.find((spawn) => spawn.name.endsWith('_2')) ?? soloP2Spawn : soloP2Spawn;
  const p1 = makeActor('p1', p1Spawn.x, p1Spawn.y, '#48b7ff', false, baseConfig, usesTeams ? 1 : 0);
  const humans = options.multiplayer ? [makeActor('p2', p2Spawn.x, p2Spawn.y, '#f4a35f', false, baseConfig, usesTeams ? 2 : 0)] : [];
  const bots = options.bots === false || options.multiplayer ? [] : [makeActor('bot1', p2Spawn.x, p2Spawn.y, '#ef806d', true, baseConfig, usesTeams ? 2 : 0)];
  const world = {
    mapId,
    terrainMapId,
    mode,
    config: { ...baseConfig, playerHitbox: { ...baseConfig.playerHitbox }, platforms: baseConfig.platforms.map((platform) => ({ ...platform })) },
    navigation: map ? map.navigation.map((point) => ({ ...point })) : [],
    actions: map ? map.actions.map((point) => ({ ...point })) : [],
    pickups: map ? map.pickups.map((point) => ({ ...point })) : [],
    objectives: decodedObjectives(map, mode, random),
    // Full source rectangles are retained separately from an optional pixel
    // wall, so player collision can resolve their top/side faces precisely.
    collisionBoxes: map ? map.collisionBoxes.map((box) => ({ ...box })) : [],
    wall: options.wall ?? null, random,
    // Keep original Arena node coordinates while the retained physical boxes
    // stay aligned to the existing Foundry art/collision baseline.
    nodeOffset: map?.nodeOffset ?? { x: 0, y: 0 },
    players: [p1, ...humans, ...bots], bots, bullets: [], muzzleFlashes: [], hitEffects: [], events: [], score: { p1: 0, p2: 0, bot1: 0 },
    match: { scoreLimit: Number(options.score) || (MODE_SCORE_DEFAULTS[mode] ?? 10), teamScores: { 1: 0, 2: 0 }, winnerTeam: null, winnerId: null, ended: false, objectiveElapsed: 0 },
    elapsed: 0, frame: 0,
  };
  if (mode === 'jug' && world.players.length) setJuggernaut(world, world.players[Math.floor(random() * world.players.length)]);
  return world;
}

function actorHeight(actor) { return actor.crouching ? actor.hitbox.crouchHeight : actor.hitbox.height; }
function syncAnimationFrame(actor) {
  const range = UNITMC_FRAMES[actor.animation] ?? UNITMC_FRAMES.idle;
  const frameTime = actor.animationTime * 30;
  actor.animationFrame = range[0] + Math.floor(frameTime) % (range[1] - range[0] + 1);
  actor.animationBlend = 0;
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
  // Movement.as tests the leading torso at these exact offsets.  The foot is
  // deliberately excluded: it may overlap the next pixel column while the
  // centre-foot probe settles onto a shallow slope.
  const probes = actor.crouching ? [-20, -25, -35] : [-20, -25, -35, -45];
  return probes.some((offset) => isSolid(world, edge, y + offset));
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
    // The original controller lets the centre foot settle onto a small rise
    // before treating the leading torso as blocked.  Keep the authored box
    // unchanged; only lift the actor onto a reachable top face.
    const rise = actor.y - hit.edge.top;
    // The furnace-right ramp is authored as two overlapping NodePhysBox
    // rectangles whose top edges differ by 25.5px (#26 -> #24).  The Flash
    // wall underneath is a continuous slope, so this remains a walkable
    // foot lift rather than becoming a vertical wall in the box fallback.
    if (actor.grounded && actor.vy >= 0 && rise > 0 && rise <= 28) {
      actor.y = hit.edge.top;
      actor.vy = 0;
      return null;
    }
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
  // Foundry's authored blue NodePhysBox rectangles are the active terrain
  // layer.  They must therefore be eligible climb faces just like an alpha
  // wall; excluding them made a box block horizontal movement but prevented
  // its reachable top edge from ever entering climbsmall/climbbig.
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
    // Movement.as clears the centre foot from the wall before returning to
    // normal gravity, rather than gradually sinking/jittering onto the ledge.
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

function canStandAt(world, actor, x) { return !isSolid(world, x - 17, actor.y - 45) && !isSolid(world, x + 17, actor.y - 45); }
function canStand(world, actor) { return canStandAt(world, actor, actor.x); }
function crouchBodyClearAt(world, actor, x) {
  // Movement.as resolves a crouched body out of a wall with the -20/-25/-35
  // torso probes before the next crouch check.  Without that resolution, a
  // single vertical wall can keep the later -45 stand probe permanently hit.
  return [-20, -25, -35].every((offset) => !isSolid(world, x - 17, actor.y + offset) && !isSolid(world, x + 17, actor.y + offset));
}
function resolveSingleWallCrouchLock(world, actor, requested) {
  if (requested || !actor.crouching) return;
  const leftBlocked = isSolid(world, actor.x - 17, actor.y - 45);
  const rightBlocked = isSolid(world, actor.x + 17, actor.y - 45);
  // Two blocked head probes are a genuine low ceiling: retain the original
  // crouch state. A single probe is a side-wall overlap which Flash resolves
  // horizontally while crouched.
  if (leftBlocked === rightBlocked) return;
  const away = leftBlocked ? 1 : -1;
  for (let distance = 1; distance <= actor.hitbox.halfWidth + 1; distance += 1) {
    const x = actor.x + away * distance;
    if (x < actor.hitbox.halfWidth || x > world.config.width - actor.hitbox.halfWidth) break;
    if (crouchBodyClearAt(world, actor, x) && canStandAt(world, actor, x)) { actor.x = x; return; }
  }
}
function updateCrouch(world, actor, requested) {
  resolveSingleWallCrouchLock(world, actor, Boolean(requested));
  actor.crouching = Boolean(requested) || (actor.crouching && !canStand(world, actor));
}
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
  const { x: muzzleX, y: muzzleY } = getMuzzleOrigin(actor);
  gun.clip -= 1;
  world.bullets.push({ owner: actor.id, x: muzzleX, y: muzzleY, px: muzzleX, py: muzzleY, vx: Math.cos(actor.aimAngle) * world.config.bulletSpeed, vy: Math.sin(actor.aimAngle) * world.config.bulletSpeed, ttl: 0.8, damage: 1 });
  world.muzzleFlashes.push({ owner: actor.id, x: muzzleX, y: muzzleY, facing: actor.facing, angle: actor.aimAngle, ttl: world.config.muzzleFlashDuration });
  actor.fireTimer = world.config.fireCooldown; actor.crosshairSpread = Math.min(28, actor.crosshairSpread + 9); actor.recoil = 1;
  // Guns.shoot raises dynRecoil only through the player path which owns Hud.
  // Its source condition is strictly less-than, so the final .3 can overshoot
  // the nominal 1.7× value by one increment.
  if (!actor.isBot && actor.dynRecoil < gun.recoil * 1.7) actor.dynRecoil += 0.3;
  world.events.push({ type: 'fire', actor: actor.id });
  if (!gun.clip) reload(world, actor);
}
function damage(world, target, amount, owner) {
  if (!target.alive) return;
  target.hp = Math.max(0, target.hp - amount); target.hitTimer = 0.16; world.hitEffects.push({ x: target.x, y: target.y - 38, ttl: 0.16 }); world.events.push({ type: 'hit', actor: target.id });
  if (!target.hp) {
    resetCarriedFlag(world, target);
    target.alive = false; target.deathTimer = world.config.respawnDuration; world.events.push({ type: 'death', actor: target.id });
    if (target.isJug) {
      const killer = world.players.find((actor) => actor.id === owner && actor.id !== target.id);
      const replacement = killer ?? world.players.find((actor) => actor.id !== target.id && actor.alive);
      if (replacement) setJuggernaut(world, replacement);
    }
    if (owner) awardKill(world, owner);
  }
}

function awardTeamScore(world, team) {
  if (!team || world.match.ended) return;
  world.match.teamScores[team] = (world.match.teamScores[team] ?? 0) + 1;
  world.events.push({ type: 'teamScore', team, score: world.match.teamScores[team] });
  if (world.match.teamScores[team] >= world.match.scoreLimit) {
    world.match.winnerTeam = team;
    world.match.ended = true;
    world.events.push({ type: 'matchEnd', team });
  }
}

function awardKill(world, ownerId) {
  world.score[ownerId] = (world.score[ownerId] ?? 0) + 1;
  const owner = world.players.find((actor) => actor.id === ownerId);
  if (world.mode === 'tdm') awardTeamScore(world, owner?.team);
  if (world.mode === 'jug' && owner && !world.match.ended && world.score[ownerId] >= world.match.scoreLimit) {
    world.match.winnerId = ownerId;
    world.match.ended = true;
    world.events.push({ type: 'matchEnd', actor: ownerId });
  }
}

function setJuggernaut(world, juggernaut) {
  // Game.as selects a unit at random, then Unit.setJug() clears every unit to
  // team 1/frame 1 before putting the selected unit on team 2, healing it and
  // switching it to its Juggernaut timeline.
  for (const actor of world.players) {
    actor.team = 1;
    actor.isJug = false;
  }
  juggernaut.team = 2;
  juggernaut.isJug = true;
  juggernaut.hp = juggernaut.maxHp;
  world.match.juggernautId = juggernaut.id;
  world.events.push({ type: 'juggernaut', actor: juggernaut.id });
}

function resetCarriedFlag(world, actor) {
  if (!actor.carriedFlagId) return;
  const flag = world.objectives.flags.find((item) => item.id === actor.carriedFlagId);
  if (flag) flag.carrierId = null;
  actor.carriedFlagId = null;
}

function inCtfFlagTrigger(actor, flag) {
  // Unit.as invokes the CTF trigger against x ±40 and y -70..+25.
  return actor.x >= flag.x - 40 && actor.x <= flag.x + 40
    && actor.y >= flag.y - 70 && actor.y <= flag.y + 25;
}

function updateCtf(world) {
  for (const actor of world.players) {
    if (!actor.alive) continue;
    for (const flag of world.objectives.flags) {
      if (!inCtfFlagTrigger(actor, flag)) continue;
      if (flag.team !== actor.team && !flag.carrierId && !actor.carriedFlagId) {
        flag.carrierId = actor.id;
        actor.carriedFlagId = flag.id;
        world.events.push({ type: 'flagTake', actor: actor.id, flag: flag.id });
      } else if (flag.team === actor.team && actor.carriedFlagId) {
        const carried = world.objectives.flags.find((item) => item.id === actor.carriedFlagId);
        if (carried) carried.carrierId = null;
        actor.carriedFlagId = null;
        world.events.push({ type: 'flagCapture', actor: actor.id, flag: carried?.id });
        awardTeamScore(world, actor.team);
      }
    }
  }
}

function inHoldpointTrigger(actor, point) {
  // Unit.as supplies NodeHoldpoint with x ±120 and y ±100.
  return actor.x >= point.x - 120 && actor.x <= point.x + 120
    && actor.y >= point.y - 100 && actor.y <= point.y + 100;
}

function updateDomination(world, dt) {
  for (const point of world.objectives.holdpoints) {
    const claimant = world.players.find((actor) => actor.alive && actor.team > 0 && actor.team !== point.team && inHoldpointTrigger(actor, point));
    if (claimant) {
      point.progress += dt * 30;
      if (point.progress >= -10) {
        point.team = claimant.team;
        point.capturedBy = claimant.id;
        point.progress = -15;
        world.events.push({ type: 'holdpointCapture', point: point.letter, team: point.team });
      }
      continue;
    }
    const defender = world.players.find((actor) => actor.alive && actor.team === point.team && inHoldpointTrigger(actor, point));
    if (defender) point.progress = Math.max(-65, point.progress - dt * 30);
  }
  world.match.objectiveElapsed += dt;
  while (world.match.objectiveElapsed >= 3) {
    world.match.objectiveElapsed -= 3;
    for (const point of world.objectives.holdpoints) awardTeamScore(world, point.team);
  }
}

function updateObjectives(world, dt) {
  if (world.match.ended) return;
  if (world.mode === 'ctf') updateCtf(world);
  if (world.mode === 'dom') updateDomination(world, dt);
}
function updateSourceDynamicRecoil(actor, dt) {
  const gun = actor.weapon;
  // Guns.EnterFrame: .05 per native 30fps frame while above base recoil.
  if (actor.dynRecoil > gun.recoil) actor.dynRecoil = Math.max(gun.recoil, actor.dynRecoil - 0.05 * dt * 30);
  // Branch order is Guns.EnterFrame. Reflection is not an implemented M4
  // state yet, so do not invent it; idle, crouch, jump and movement are exact.
  const stance = actor.crouching ? 0.6 : !actor.grounded ? 1.2 : actor.vx ? 1.1 : 1;
  actor.dynRecoilMod = actor.dynRecoil * stance * (2 - actor.classAim);
}
function updateActor(world, actor, input, dt) {
  if (!actor.alive) { actor.deathTimer -= dt; if (actor.deathTimer <= 0) { actor.alive = true; actor.hp = actor.maxHp; actor.x = actor.spawnX; actor.y = actor.spawnY; actor.vx = actor.vy = 0; actor.weapon.clip = actor.weapon.clipMax; actor.weapon.spare = 90; actor.dynRecoil = actor.weapon.recoil; actor.dynRecoilMod = actor.dynRecoil * (2 - actor.classAim); } return; }
  if (updateClimb(world, actor, dt)) return;
  updateCrouch(world, actor, input.down);
  const left = Boolean(input.left); const right = Boolean(input.right); actor.vx = ((right ? 1 : 0) - (left ? 1 : 0)) * (actor.crouching ? world.config.crouchSpeed : world.config.moveSpeed);
  const aimX = Number.isFinite(input.aimX) ? input.aimX : actor.aimX; const aimY = Number.isFinite(input.aimY) ? input.aimY : actor.aimY;
  const aimFacing = aimX >= actor.x ? 1 : -1;
  const aimPivot = getAimPivot(actor, aimFacing);
  const dx = aimX - aimPivot.x; const dy = aimY - aimPivot.y;
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
  updateSourceDynamicRecoil(actor, dt);
  const movingBackward = actor.vx * actor.facing < -1;
  const fallingAnimation = actor.animation === 'fall' && actor.animationTime >= (UNITMC_FRAMES.fall[1] - UNITMC_FRAMES.fall[0] + 1) / 30 ? 'fallloop' : 'fall';
  const crouchAnimation = actor.animation === 'duck' && actor.animationTime >= (UNITMC_FRAMES.duck[1] - UNITMC_FRAMES.duck[0] + 1) / 30 ? 'duckloop' : actor.animation === 'duckloop' ? 'duckloop' : 'duck';
  if (!actor.grounded) setAnimation(actor, actor.vy < 0 ? 'jump' : fallingAnimation); else if (actor.weapon.reloadRemaining) setAnimation(actor, 'reload'); else if (actor.crouching) setAnimation(actor, Math.abs(actor.vx) > 1 ? movingBackward ? 'duckrunback' : 'duckrun' : crouchAnimation); else if (Math.abs(actor.vx) > 1) setAnimation(actor, movingBackward ? 'runback' : 'run'); else setAnimation(actor, 'idle');
  actor.animationTime += dt;
  // UnitMC itself advances on Flash's native 30fps timeline.  Its limb
  // matrices are authored as complete poses, so retain the discrete frame.
  syncAnimationFrame(actor);
}

function aiRandom(world) { return Math.min(.999999, Math.max(0, Number(world.random()) || 0)); }
function aiChance(world, chanceAt30Fps, dt) {
  const chance = Math.min(1, Math.max(0, chanceAt30Fps));
  return aiRandom(world) < 1 - (1 - chance) ** (Math.max(0, dt) * 30);
}
function waypointById(world, id) { return world.navigation.find((point) => point.id === id) ?? null; }
function setNextWaypoint(world, ai, id) {
  const point = waypointById(world, id);
  if (!point) return null;
  ai.nextWaypointId = point.id;
  ai.navIndex = world.navigation.indexOf(point);
  ai.waypointFrames = 0;
  return point;
}
function getClosestWaypoint(world, actor) {
  const candidates = world.navigation.filter((point) => Math.abs(point.y - actor.y) < 100);
  const points = candidates.length ? candidates : world.navigation;
  if (!points.length) return null;
  return points.reduce((closest, point) => (
    Math.abs(point.x - actor.x) < Math.abs(closest.x - actor.x) ? point : closest
  ));
}
function chooseConnectedWaypoint(world, point) {
  const connected = [...point.connections].map((id) => waypointById(world, id)).filter(Boolean);
  if (!connected.length) return point;
  return connected[Math.floor(aiRandom(world) * connected.length)];
}
function routeBetweenWaypoints(world, startId, goalId) {
  if (!startId || !goalId) return [];
  const queue = [[startId]];
  const visited = new Set([startId]);
  while (queue.length) {
    const route = queue.shift();
    const currentId = route.at(-1);
    if (currentId === goalId) return route;
    const current = waypointById(world, currentId);
    if (!current) continue;
    for (const nextId of current.connections) {
      if (!visited.has(nextId) && waypointById(world, nextId)) {
        visited.add(nextId);
        queue.push([...route, nextId]);
      }
    }
  }
  return [];
}
function planHuntRoute(world, bot, target) {
  const ai = bot.ai;
  const start = waypointById(world, ai.currentWaypointId) ?? waypointById(world, ai.nextWaypointId) ?? getClosestWaypoint(world, bot);
  const goal = getClosestWaypoint(world, target);
  ai.huntTargetId = target?.id ?? null;
  ai.huntGoalWaypointId = goal?.id ?? null;
  ai.huntFrames = 0;
  ai.routeIds = start && goal ? routeBetweenWaypoints(world, start.id, goal.id).slice(1) : [];
  const nextId = ai.routeIds.shift();
  return nextId ? setNextWaypoint(world, ai, nextId) : null;
}
function advanceWaypoint(world, bot) {
  const ai = bot.ai;
  const current = waypointById(world, ai.nextWaypointId) ?? getClosestWaypoint(world, bot);
  ai.currentWaypointId = current.id;
  const plannedId = ai.routeIds.shift();
  if (plannedId) return setNextWaypoint(world, ai, plannedId);
  return setNextWaypoint(world, ai, chooseConnectedWaypoint(world, current).id);
}
function targetCandidate(world, bot, actor) {
  if (actor.id === bot.id || !actor.alive || actor.invisible || actor.spawnProtected) return false;
  if (TEAM_MODES.has(world.mode) && actor.team === bot.team) return false;
  const range = Math.min((bot.weapon.range ?? 45) * 10, 450);
  if (Math.hypot(actor.x - bot.x, actor.y - bot.y) >= range) return false;
  return hasLineOfSight(world, { x: bot.x, y: bot.y - (bot.crouching ? 20 : 50) }, { x: actor.x, y: actor.y - (actor.crouching ? 20 : 40) });
}
function acquireTarget(world, bot) {
  return world.players.filter((actor) => targetCandidate(world, bot, actor)).sort((a, b) => (
    Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y)
  ))[0] ?? null;
}
function acquireHuntTarget(world, bot) {
  return world.players.filter((actor) => (
    actor.id !== bot.id && actor.alive && !actor.invisible && !actor.spawnProtected
      && !(TEAM_MODES.has(world.mode) && actor.team === bot.team)
  )).sort((a, b) => (
    Math.hypot(a.x - bot.x, a.y - bot.y) - Math.hypot(b.x - bot.x, b.y - bot.y)
  ))[0] ?? null;
}
function originalAiAim(world, bot, target) {
  const ai = bot.ai;
  if (!Number.isFinite(ai.aimX)) ai.aimX = bot.aimX;
  if (!Number.isFinite(ai.aimY)) ai.aimY = bot.aimY;
  const focusX = target ? target.x : bot.x + bot.facing * 50 + bot.vx * 10;
  const focusY = target ? target.y - (target.crouching ? 20 : 40) : bot.y - 40 + bot.vy * 8;
  const speed = target ? .3 * (Math.min(15, Math.max(0, ai.difficulty)) * .1 + .1) : .4;
  ai.aimX += (focusX - ai.aimX) * speed;
  ai.aimY += (focusY - ai.aimY) * (target ? speed : .3);
  return { aimX: ai.aimX, aimY: ai.aimY };
}
function actionInput(world, bot, next) {
  const ai = bot.ai;
  const nodeX = bot.x - world.nodeOffset.x;
  const nodeY = bot.y - world.nodeOffset.y;
  const input = {};
  for (const action of world.actions) {
    if (!action.connections.includes(next.id)) continue;
    // This is UT.inBox from the SWF: x/y are the action Sprite's own origin,
    // and width/height are its transformed bounds. The old radius check lost
    // the bottom of j_h, which is the authored escape trigger for this pit.
    const left = Math.min(action.x, action.x + action.width);
    const right = Math.max(action.x, action.x + action.width);
    const top = Math.min(action.y, action.y + action.height);
    const bottom = Math.max(action.y, action.y + action.height);
    if (!(nodeX > left && nodeX < right && nodeY > top && nodeY < bottom)) continue;
    input.clearDown = true;
    if (action.id === 'j') {
      ai.waitFrames = 0;
      ai.noWaitFrames = 30;
      if (!bot.climb) input.jump = true;
    } else if (action.id === 'c') input.down = true;
    else if (action.id === 'fp' || action.id === 'fc' || action.id === 'fd') {
      const corrected = action.id[1];
      if (waypointById(world, corrected)) setNextWaypoint(world, ai, corrected);
    }
  }
  return input;
}
function aiObstacleAhead(world, bot, direction) {
  if (!direction || !bot.grounded) return false;
  const leadX = bot.x + direction * (bot.hitbox.halfWidth + 3);
  const bodyBlocked = [-20, -35].some((offset) => isSolid(world, leadX, bot.y + offset));
  // Only jump a ledge that is below the original head-clearance probe. A
  // solid tower should send the bot back to its waypoint graph, not make it
  // repeatedly jump into a ceiling.
  return bodyBlocked && !isSolid(world, leadX, bot.y - 55);
}
function rerouteBlockedWaypoint(world, bot) {
  const ai = bot.ai;
  const origin = waypointById(world, ai.currentWaypointId) ?? getClosestWaypoint(world, bot);
  if (!origin) return null;
  const alternatives = [...origin.connections].filter((id) => id !== ai.nextWaypointId).map((id) => waypointById(world, id)).filter(Boolean);
  if (!alternatives.length) return null;
  return setNextWaypoint(world, ai, alternatives[Math.floor(aiRandom(world) * alternatives.length)].id);
}
function botInput(world, bot, dt) {
  const ai = bot.ai;
  const frameUnits = dt * 30;
  ai.waitFrames = Math.max(0, ai.waitFrames - frameUnits);
  ai.noWaitFrames = Math.max(0, ai.noWaitFrames - frameUnits);
  ai.crouchFrames = Math.max(0, ai.crouchFrames - frameUnits);
  ai.waypointFrames += (!ai.waitFrames && !ai.crouchFrames && bot.grounded ? frameUnits : 0);

  if (world.frame % 12 === ai.scanFrame) ai.targetId = acquireTarget(world, bot)?.id ?? null;
  const target = world.players.find((actor) => actor.id === ai.targetId && targetCandidate(world, bot, actor)) ?? null;
  if (!target) ai.targetId = null;

  const huntTarget = target ? null : acquireHuntTarget(world, bot);
  ai.huntFrames += frameUnits;
  if (huntTarget && world.navigation.length) {
    const huntGoal = getClosestWaypoint(world, huntTarget);
    const needsPlan = ai.huntTargetId !== huntTarget.id
      || ai.huntGoalWaypointId !== huntGoal?.id
      || ai.huntFrames >= 90
      || (!ai.nextWaypointId && !ai.routeIds.length);
    if (needsPlan) planHuntRoute(world, bot, huntTarget);
  } else {
    ai.huntTargetId = null;
    ai.huntGoalWaypointId = null;
    ai.routeIds = [];
  }

  if (world.navigation.length && (!ai.nextWaypointId || ai.waypointFrames >= 120)) {
    const closest = getClosestWaypoint(world, bot);
    if (closest) setNextWaypoint(world, ai, closest.id);
  }
  let next = waypointById(world, ai.nextWaypointId);
  if (next && Math.abs(next.x - bot.x) < 30) next = advanceWaypoint(world, bot);

  const difficulty = Math.min(15, Math.max(0, ai.difficulty));
  const diffReverse = 15 - difficulty;
  if (!target && !ai.waitFrames && !ai.noWaitFrames && aiChance(world, .01 * diffReverse * .3, dt)) {
    ai.waitFrames = (2 + Math.floor(aiRandom(world) * 5)) * diffReverse * .1 * 30;
    ai.noWaitFrames = ai.waitFrames + (2 + Math.floor(aiRandom(world) * 5)) * difficulty * .1 * 30;
  }
  if (target && !ai.crouchFrames && aiChance(world, .02 * diffReverse * .3, dt)) ai.crouchFrames = (2 + Math.floor(aiRandom(world) * 3)) * diffReverse * .1 * 30;

  let move = next && !ai.waitFrames ? { left: next.x < bot.x - 30, right: next.x > bot.x + 30 } : {};
  let direction = move.left ? -1 : move.right ? 1 : 0;
  const hadPreviousPosition = Number.isFinite(ai.lastX) && Number.isFinite(ai.lastY);
  const displacement = hadPreviousPosition ? Math.hypot(bot.x - ai.lastX, bot.y - ai.lastY) : Infinity;
  if (direction && hadPreviousPosition && displacement < .25) ai.stuckFrames += frameUnits;
  else if (displacement >= .25 || !direction) ai.stuckFrames = Math.max(0, ai.stuckFrames - frameUnits * 2);
  ai.lastX = bot.x;
  ai.lastY = bot.y;
  let obstacleJump = aiObstacleAhead(world, bot, direction);
  if (obstacleJump) ai.blockedFrames += frameUnits;
  else if (bot.grounded) ai.blockedFrames = Math.max(0, ai.blockedFrames - frameUnits * 2);
  // Collision can block a tall box without satisfying the head-clearance
  // probe, so obstacleJump stays false. Detect the resulting lack of real
  // displacement as well, then give the linked navigation graph a chance to
  // take a different exit instead of holding movement into that box forever.
  if (ai.blockedFrames >= 30 || ai.stuckFrames >= 18) {
    next = rerouteBlockedWaypoint(world, bot) ?? next;
    ai.blockedFrames = 0;
    ai.stuckFrames = 0;
    ai.routeIds = [];
    move = next && !ai.waitFrames ? { left: next.x < bot.x - 30, right: next.x > bot.x + 30 } : {};
    direction = move.left ? -1 : move.right ? 1 : 0;
    obstacleJump = aiObstacleAhead(world, bot, direction);
  }
  const action = next ? actionInput(world, bot, next) : {};
  const aim = originalAiAim(world, bot, target);
  const shootBase = .05 + (1 - Math.min(bot.weapon.shootDelay ?? world.config.fireCooldown, .9)) * .2;
  const shotChance = difficulty === 10 ? 1000 : difficulty * .29 + .1;
  const fire = Boolean(target) && difficulty > 0 && aiChance(world, shootBase * shotChance, dt);
  return { ...move, ...action, jump: Boolean(action.jump || obstacleJump), down: action.clearDown ? Boolean(action.down) : Boolean(action.down || ai.crouchFrames), ...aim, fire, reload: bot.weapon.clip < 4 };
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
    const owner = world.players.find((actor) => actor.id === bullet.owner);
    const target = world.players.find((actor) => actor.id !== bullet.owner && actor.alive
      && (!TEAM_MODES.has(world.mode) || actor.team !== owner?.team) && segmentHitsActor(bullet, actor));
    if (target) { damage(world, target, bullet.damage, bullet.owner); return false; }
    return bullet.ttl > 0 && bullet.x >= 0 && bullet.x <= world.config.width && bullet.y >= 0 && bullet.y <= world.config.height;
  });
}
function decayEffects(items, dt) { return items.filter((item) => { item.ttl -= dt; return item.ttl > 0; }); }

export function step(world, inputs = {}, dt = 1 / 60) {
  const safeDt = Math.min(Math.max(dt, 0), 0.05); world.elapsed += safeDt; world.frame += 1;
  for (const player of world.players) updateActor(world, player, player.isBot ? botInput(world, player, safeDt) : inputs[player.id] ?? {}, safeDt);
  updateBullets(world, safeDt); updateObjectives(world, safeDt); world.muzzleFlashes = decayEffects(world.muzzleFlashes, safeDt); world.hitEffects = decayEffects(world.hitEffects, safeDt); return world;
}
