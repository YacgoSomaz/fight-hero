// Direct decision-state port of AI.as. Physics/Guns consume its outputs in
// their own source ports; no generic NPC controller is substituted here.
export const TUTORIAL_AI_KEYS = Object.freeze({ UP: 1, DOWN: 2, LEFT: 4, RIGHT: 8 });
const ACTION_SIZE = 69; // NodeAiAction (symbol 1268) local display rectangle.

const irand = (random, min, max) => Math.trunc(random() * (max - min + 1)) + min;
const positionOf = (actor) => {
  if (!Number.isFinite(actor?.position?.x) || !Number.isFinite(actor?.position?.y)) throw new TypeError('original AI requires a finite source actor position');
  return actor.position;
};
const activeGun = (actor) => {
  const gun = actor?.gun?.curGun;
  if (!gun || !Number.isFinite(gun.range) || !Number.isFinite(gun.shootDelay)) throw new TypeError('original AI requires the active source gun stats');
  return gun;
};
const primaryGun = (actor) => actor?.gun?.primary ?? activeGun(actor);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const inBox = (point, box) => point.x > Math.min(box.x, box.x + box.width) && point.x < Math.max(box.x, box.x + box.width) && point.y > Math.min(box.y, box.y + box.height) && point.y < Math.max(box.y, box.y + box.height);

function rotation(a, b) {
  const x = a.x - b.x; const y = a.y - b.y; const d = Math.hypot(x, y);
  const radians = y < 0 ? Math.PI * 2 - Math.acos(x / d) : Math.acos(x / d);
  let result = radians * 180 / Math.PI - 90;
  if (result > 180) result -= 360;
  if (result < -180) result += 360;
  return result;
}
function xMove(rot, amount) { return rot === 0 || rot === 180 || rot === -180 ? 0 : Math.sin(rot * Math.PI / 180) * amount; }
function yMove(rot, amount) { return rot === 90 || rot === -90 ? 0 : Math.cos(rot * Math.PI / 180) * -amount; }

function sourceStats(state, actor, value) {
  let diff = value; if (diff < 0) diff = 0; if (diff > 15) diff = 15;
  const diffRev = 15 - diff; let waitNormal = .01 * diffRev * .3; let waitTarget = .03 * diffRev * .3;
  let crouchNormal = .01 * diffRev * .3; let crouchTarget = .02 * diffRev * .3;
  let shotChance = diff * .29 + .1; if (diff === 10) shotChance = 1000;
  const soldier = actor.unitInfo?.id ?? actor.soldier;
  if (soldier === 'medic') waitNormal *= 2;
  if (soldier === 'sniper') { waitTarget *= 2; crouchTarget *= 2; }
  if (soldier === 'tank') waitTarget *= .5;
  if (soldier === 'soldier') crouchTarget *= .5;
  if (primaryGun(actor).typeName === 'Shield') crouchTarget = .09;
  if ((actor.unitInfo?.skill?.id ?? 'none') === 'shadow') { crouchNormal *= 3; crouchNormal = .03; }
  return { ...state, diff, diffRev, waitNormal, waitTarget, crouchNormal, crouchTarget, waitFlag: .005 * diffRev * .3, shotChance, aimSpeed: .3 * (diff * .1 + .1) };
}

export function compileTutorialAiArena(layout) {
  if (!Array.isArray(layout?.nodes)) throw new TypeError('original Arena node display list is required');
  const waypoints = {}; const actions = [];
  for (const node of layout.nodes) if (node.type === 'waypoint') {
    const [id, connections = ''] = node.name.split('_'); waypoints[id] = { id, x: node.x, y: node.y, connects: [...connections], actionBoxes: [] };
  }
  for (const node of layout.nodes) if (node.type === 'action') {
    const [action, connects = ''] = node.name.split('_'); const box = { action, connects, x: node.x, y: node.y, width: ACTION_SIZE * node.scaleX, height: ACTION_SIZE * node.scaleY }; actions.push(box);
    for (const id of connects) { if (!waypoints[id]) throw new Error(`original Arena action ${node.name} references unavailable waypoint ${id}`); waypoints[id].actionBoxes.push(box); }
  }
  for (const waypoint of Object.values(waypoints)) for (const id of waypoint.connects) if (!waypoints[id]) throw new Error(`original Arena waypoint ${waypoint.id} references unavailable waypoint ${id}`);
  return { waypoints, actions };
}

export function createTutorialAiState({ actor, arena, random = Math.random } = {}) {
  const pos = positionOf(actor); if (!arena?.waypoints) throw new TypeError('original compiled Arena waypoints are required');
  const node = pos.node ?? actor.spawn?.node; if (!arena.waypoints[node]) throw new Error(`original AI spawn waypoint is unavailable: ${node}`);
  let state = { curWaypointId: null, nextWaypointId: node, wpTimer: 0, targetId: null, path: '@@', getTargetTimer: 0, getTargetEvent: irand(random, 1, 12), wait: 0, nowait: 0, crouch: 0, nocrouch: 0, aimX: pos.x + 100, aimY: pos.y - 50, focusX: null, focusY: null };
  if (actor.definition?.extra?.aimReverse) state = { ...state, aimX: pos.y - 100 }; // exact original assignment
  return sourceStats(state, actor, actor.difficulty);
}
export function setTutorialAiDifficulty(state, { actor, difficulty } = {}) {
  if (!state || !actor) throw new TypeError('original AI.setDiffStats requires state and actor');
  return sourceStats({ ...state }, actor, difficulty);
}

function closest(state, actor, arena, random) {
  if (!state.diff) return state;
  const pos = positionOf(actor); const choices = Object.values(arena.waypoints).filter((wp) => Math.abs(pos.y - wp.y) < 100).map((wp) => ({ d: Math.abs(pos.x - wp.x), wp })).sort((a, b) => a.d - b.d);
  if (choices.length) return { ...state, wpTimer: 0, path: '@', nextWaypointId: choices[0].wp.id };
  const current = arena.waypoints[state.curWaypointId]; if (!current?.connects.length) throw new Error('original AI closest waypoint fallback has no source connector');
  return { ...state, wpTimer: 0, path: '@', nextWaypointId: current.connects[Math.trunc(random() * current.connects.length)] };
}
function nextWaypoint(state, actor, arena, random, forced = null) {
  const next = arena.waypoints[state.nextWaypointId]; if (!next) throw new Error(`original AI next waypoint is unavailable: ${state.nextWaypointId}`);
  let result = { ...state, wpTimer: 0 }; if (!forced && actor.movement?.jumping && Math.abs(positionOf(actor).y - next.y) > 30) return result;
  if (forced) return { ...result, curWaypointId: state.nextWaypointId, nextWaypointId: forced };
  result.curWaypointId = state.nextWaypointId;
  if (Math.abs(positionOf(actor).y - next.y) > 50) return closest(result, actor, arena, random);
  if (result.path && result.path.charAt(0) !== '@') { const id = result.path.charAt(0); if (!arena.waypoints[id]) throw new Error(`original AI path references unavailable waypoint ${id}`); return { ...result, nextWaypointId: id, path: result.path.substring(1) || '@' }; }
  if (!next.connects.length) throw new Error(`original AI waypoint ${next.id} has no source connector`);
  return { ...result, nextWaypointId: next.connects[Math.trunc(random() * next.connects.length)], path: result.path.charAt(0) === '@' ? result.path.substring(1) : result.path };
}
function scanTarget(actor, units, wall) {
  const pos = positionOf(actor); const gun = activeGun(actor); const candidates = [];
  for (const unit of units) {
    if (unit === actor || unit.id === actor.id || unit.dead || (Boolean(actor.team) && actor.team === unit.team) || unit.status?.sInvis === 1 || unit.status?.sSpawn) continue;
    const other = positionOf(unit); const d = distance(pos, other); if (d < Math.min(gun.range * 10, 450)) candidates.push({ unit, d, rot: rotation(pos, other) });
  }
  if (!gun.extra?.burrow) for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = candidates[index]; let visible = true;
    for (let d = 0; visible && d < candidate.d; d += 20) if (wall.isSolid(pos.x + xMove(candidate.rot, d), pos.y + yMove(candidate.rot, d) - (actor.movement?.crouching ? 20 : 50))) visible = false;
    if (!visible) candidates.splice(index, 1);
  }
  candidates.sort((a, b) => a.d - b.d); return candidates[0]?.unit ?? null;
}
function actionBoxes(state, actor, arena, keys, random) {
  const wp = arena.waypoints[state.nextWaypointId]; if (!wp) throw new Error(`original AI action waypoint is unavailable: ${state.nextWaypointId}`);
  let result = state; let outKeys = keys; let jumpRequested = false;
  for (const box of wp.actionBoxes) {
    if (!inBox(positionOf(actor), box)) continue; if (outKeys & TUTORIAL_AI_KEYS.DOWN) outKeys ^= TUTORIAL_AI_KEYS.DOWN;
    if (box.action === 'j' && !actor.capturing) { result = { ...result, wait: 0, nowait: 30 }; if (!actor.movement?.jumping) jumpRequested = true; }
    else if (box.action === 'c') outKeys |= TUTORIAL_AI_KEYS.DOWN;
    else if (box.action === 'fc' || box.action === 'fp' || box.action === 'fd') result = nextWaypoint(result, actor, arena, random, box.action === 'fc' ? 'c' : box.action === 'fp' ? 'p' : 'd');
  }
  return { state: result, keys: outKeys, jumpRequested };
}

export function advanceTutorialAi({ state: sourceState, actor, units, arena, wall, gameStarted = true, random = Math.random } = {}) {
  if (!sourceState || !arena?.waypoints || !Array.isArray(units) || typeof wall?.isSolid !== 'function') throw new TypeError('original AI EnterFrame requires state, Arena, units and decoded Wall surface');
  const pos = positionOf(actor); if (actor.definition?.extra?.noSpawn) return { state: { ...sourceState }, keys: 0, jumpRequested: false, shouldShoot: false };
  let state = { ...sourceState }; if (!actor.movement?.jumping && !state.wait && !state.crouch) state.wpTimer += 1; if (state.wpTimer >= 120) state = closest(state, actor, arena, random); if (actor.dead) return { state, keys: 0, jumpRequested: false, shouldShoot: false };
  const wp = arena.waypoints[state.nextWaypointId]; if (!wp) throw new Error(`original AI next waypoint is unavailable: ${state.nextWaypointId}`); let keys = 0;
  if (state.diff) { if (wp.x > pos.x - 30 && wp.x < pos.x + 30) state = nextWaypoint(state, actor, arena, random); else if (!state.wait && wp.x > pos.x) keys |= TUTORIAL_AI_KEYS.RIGHT; else if (!state.wait && wp.x < pos.x) keys |= TUTORIAL_AI_KEYS.LEFT; }
  const oldTarget = state.targetId ? units.find((unit) => unit.id === state.targetId) ?? null : null;
  if (!state.wait && !state.nowait && !actor.movement?.jumping && random() < (oldTarget ? state.waitTarget : state.waitNormal) && !actor.status?.sSpawn) { state.wait = irand(random, 2, 6) * (state.diffRev * .1) * 30; state.nowait = state.wait + irand(random, 2, 6) * (state.diff * .1) * 30; }
  if (!state.crouch && random() < (oldTarget ? state.crouchTarget : 0) && !actor.status?.sSpawn) { state.crouch = irand(random, 2, 4) * (state.diffRev * .1) * 30; state.nocrouch = state.crouch / 2; }
  if (state.wait) state.wait -= 1;
  if (state.nowait) state.nowait -= 1;
  // AI.EnterFrame checks these source Movement.hitTest probes before it
  // writes DOWN. The check lets an AI leave a crouched wall edge and regain
  // its jump branch instead of continuously driving into the obstruction.
  if (state.crouch && (keys & TUTORIAL_AI_KEYS.LEFT) && wall.isSolid(pos.x - 19, pos.y - 20)) state.crouch = 0;
  if (state.crouch && (keys & TUTORIAL_AI_KEYS.RIGHT) && wall.isSolid(pos.x + 19, pos.y - 20)) state.crouch = 0;
  if (state.crouch && state.diff) { keys |= TUTORIAL_AI_KEYS.DOWN; state.crouch -= 1; }
  state.getTargetTimer += 1; if (state.getTargetTimer > 12) state.getTargetTimer = 0; if (state.getTargetTimer === state.getTargetEvent) state.targetId = scanTarget(actor, units, wall)?.id ?? null;
  const target = state.targetId ? units.find((unit) => unit.id === state.targetId) ?? null : null;
  if (!target) { state.focusX = pos.x + actor.scaleX * 50 + (actor.movement?.xVelocity ?? 0) * 10; state.focusY = pos.y - 40 + (actor.movement?.yVelocity ?? 0) * 8; state.aimX += (state.focusX - state.aimX) * .4; state.aimY += (state.focusY - state.aimY) * .3; }
  else if (!target.dead) { const other = positionOf(target); state.focusX = other.x; state.focusY = other.y - (target.movement?.crouching ? 20 : 40); state.aimX += (state.focusX - state.aimX) * state.aimSpeed; state.aimY += (state.focusY - state.aimY) * state.aimSpeed; }
  else {
    // AI.EnterFrame reads target.dead.rdBody.GetDefinition().userData and
    // aims at its x/y+10. The source corpse adapter carries that same body
    // as the PhysActor `body` part until Box2D is migrated.
    const body = target.dead.parts?.find((part) => part.kind === 'body');
    if (!Number.isFinite(body?.position?.x) || !Number.isFinite(body?.position?.y)) throw new TypeError('original AI corpse targeting requires a source PhysActor body position');
    state.focusX = body.position.x;
    state.focusY = body.position.y + 10;
    state.aimX += (state.focusX - state.aimX) * state.aimSpeed;
    state.aimY += (state.focusY - state.aimY) * state.aimSpeed;
  }
  let shouldShoot = false; if (gameStarted && target && state.diff && !actor.status?.sSpawn) { const gun = activeGun(actor); shouldShoot = random() < (.05 + (1 - (gun.shootDelay <= .9 ? gun.shootDelay : .9)) * .2) * state.shotChance; }
  const actions = actionBoxes(state, actor, arena, keys, random); return { state: actions.state, keys: actions.keys, jumpRequested: actions.jumpRequested, shouldShoot };
}
