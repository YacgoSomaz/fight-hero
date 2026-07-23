import assert from 'node:assert/strict';
import test from 'node:test';

import { ARENA_SOURCE_LAYOUTS } from '../src/arena-source-layouts.mjs';
import { TUTORIAL_AI_KEYS, advanceTutorialAi, compileTutorialAiArena, createTutorialAiState, findTutorialAiPath, setTutorialAiDifficulty } from '../src/tutorial-ai-runtime.mjs';

function actor(overrides = {}) {
  return {
    id: 'unit1', team: 2, position: { x: 274.6, y: 1468.35, node: 'a' }, scaleX: 1,
    soldier: 'tank', difficulty: 1, unitInfo: { id: 'tank', skill: { id: 'none' } },
    gun: { curGun: { id: 'Beretta', range: 66, shootDelay: 0.25, extra: {} } },
    status: { sSpawn: 0, sInvis: 0 }, movement: { xVelocity: 0, yVelocity: 0, jumping: false, crouching: false }, crouching: false, dead: null,
    ...overrides,
  };
}

const transparentWall = { isSolid: () => false };

test('AI compiles original tut waypoint connectors and NodeAiAction display rectangles', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  assert.deepEqual(arena.waypoints.e, {
    id: 'e', x: 599.5, y: 1321.45, connects: ['a', 'b', 'i'], actionBoxes: [
      { action: 'j', connects: 'e', x: 320.75, y: 1396.95, width: 85.52774047851562, height: 79.31272888183594 },
      { action: 'j', connects: 'e', x: 756.7, y: 1397.95, width: 85.52774047851562, height: 79.31272888183594 },
    ],
  });
  assert.deepEqual(arena.waypoints.d.actionBoxes, [
    { action: 'j', connects: 'd', x: 958.7, y: 1395.95, width: 85.52774047851562, height: 79.31272888183594 },
    { action: 'j', connects: 'd', x: 1385.7, y: 1395.95, width: 85.52774047851562, height: 79.31272888183594 },
  ]);
});

test('AI.setDiffStats retains original class, Shield, shadow and clamp rules', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const medic = createTutorialAiState({ actor: actor({ soldier: 'medic', unitInfo: { id: 'medic', skill: { id: 'none' } }, difficulty: 10 }), arena, random: () => 0 });
  const shield = createTutorialAiState({ actor: actor({ gun: { primary: { id: 'Shield', typeName: 'Shield' }, curGun: { id: 'Beretta', range: 66, shootDelay: .25, extra: {} } }, difficulty: 10 }), arena, random: () => 0 });
  const shadow = createTutorialAiState({ actor: actor({ soldier: 'sniper', unitInfo: { id: 'sniper', skill: { id: 'shadow' } }, difficulty: 99, definition: { extra: { aimReverse: true } } }), arena, random: () => 0 });
  assert.deepEqual({ event: medic.getTargetEvent, waitNormal: medic.waitNormal, waitTarget: medic.waitTarget, crouchTarget: medic.crouchTarget, shotChance: medic.shotChance, aimSpeed: medic.aimSpeed }, { event: 1, waitNormal: .03, waitTarget: .045, crouchTarget: .03, shotChance: 1000, aimSpeed: .33 });
  assert.equal(shield.crouchTarget, .09);
  assert.deepEqual({ diff: shadow.diff, aimX: shadow.aimX, waitTarget: shadow.waitTarget, crouchTarget: shadow.crouchTarget, crouchNormal: shadow.crouchNormal }, { diff: 15, aimX: 1368.35, waitTarget: 0, crouchTarget: 0, crouchNormal: .03 });
  assert.equal(setTutorialAiDifficulty(medic, { actor: actor(), difficulty: -1 }).diff, 0);
});

test('AI target scan uses original cadence, target filters, LOS samples, aim smoothing and fire chance', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const self = actor();
  const visible = actor({ id: 'unit0', team: 1, position: { x: 274.6, y: 1388.35 } });
  const shielded = actor({ id: 'unit2', team: 1, position: { x: 300.6, y: 1468.35 }, status: { sSpawn: 3, sInvis: 0 } });
  const invisible = actor({ id: 'unit3', team: 1, position: { x: 320.6, y: 1468.35 }, status: { sSpawn: 0, sInvis: 1 } });
  const blocked = actor({ id: 'unit4', team: 1, position: { x: 324.6, y: 1468.35 } });
  const state = { ...createTutorialAiState({ actor: self, arena, random: () => 0 }), getTargetEvent: 1, aimX: 0, aimY: 0 };
  const result = advanceTutorialAi({ state, actor: self, units: [self, visible, shielded, invisible, blocked], arena, wall: { isSolid: (x) => x >= 300 && x <= 320 }, gameStarted: true, random: () => .999 });
  assert.deepEqual({ targetId: result.state.targetId, timer: result.state.getTargetTimer, focusX: result.state.focusX, focusY: result.state.focusY, aimX: result.state.aimX, aimY: result.state.aimY, shouldShoot: result.shouldShoot }, { targetId: 'unit0', timer: 1, focusX: 274.6, focusY: 1348.35, aimX: 16.476, aimY: 80.901, shouldShoot: false });
  const burrow = actor({ difficulty: 10, gun: { curGun: { id: 'Burrow', range: 66, shootDelay: .25, extra: { burrow: true } } } });
  const burrowState = { ...createTutorialAiState({ actor: burrow, arena, random: () => 0 }), getTargetEvent: 1, wait: 1, crouch: 1 };
  const burrowResult = advanceTutorialAi({ state: burrowState, actor: burrow, units: [burrow, actor({ id: 'enemy', team: 1, position: { x: 350, y: 1468.35 } })], arena, wall: { isSolid: () => true }, random: () => 0 });
  assert.deepEqual({ targetId: burrowResult.state.targetId, shouldShoot: burrowResult.shouldShoot }, { targetId: 'enemy', shouldShoot: true });
});

test('AI follows original path characters and emits the j/c/f action decisions', () => {
  const arena = compileTutorialAiArena({ nodes: [
    { type: 'waypoint', name: 'a_b', x: 0, y: 0 }, { type: 'waypoint', name: 'b_a', x: 100, y: 0 }, { type: 'waypoint', name: 'c_a', x: 200, y: 0 },
    { type: 'action', name: 'c_a', x: -10, y: -10, scaleX: 1, scaleY: 1 }, { type: 'action', name: 'fc_a', x: -10, y: -10, scaleX: 1, scaleY: 1 },
  ] });
  const routeActor = actor({ position: { x: 0, y: 0, node: 'a' } });
  const routed = advanceTutorialAi({ state: { ...createTutorialAiState({ actor: routeActor, arena, random: () => 0 }), path: 'b', getTargetEvent: 12 }, actor: routeActor, units: [routeActor], arena, wall: transparentWall, gameStarted: false, random: () => 0 });
  const actionActor = actor({ position: { x: 50, y: 0, node: 'a' } });
  const acted = advanceTutorialAi({ state: { ...createTutorialAiState({ actor: actionActor, arena, random: () => 0 }), wait: 1, getTargetEvent: 12 }, actor: actionActor, units: [actionActor], arena, wall: transparentWall, gameStarted: false, random: () => 0 });
  assert.deepEqual({ route: routed.state.nextWaypointId, routePath: routed.state.path, action: acted.state.nextWaypointId, keys: acted.keys }, { route: 'b', routePath: '@', action: 'c', keys: 0 });
  const tut = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const jumper = actor({ position: { x: 330, y: 1400, node: 'a' } });
  const jumped = advanceTutorialAi({ state: { ...createTutorialAiState({ actor: jumper, arena: tut, random: () => 0 }), nextWaypointId: 'e', getTargetEvent: 12 }, actor: jumper, units: [jumper], arena: tut, wall: transparentWall, gameStarted: false, random: () => 0 });
  assert.deepEqual({ jump: jumped.jumpRequested, wait: jumped.state.wait, nowait: jumped.state.nowait }, { jump: true, wait: 0, nowait: 30 });
});

test('AI.pathFind enumerates source waypoint paths, sorts by NodeWaypointPath distance and samples its source choice range', () => {
  const arena = compileTutorialAiArena({ nodes: [
    { type: 'waypoint', name: 'a_bc', x: 0, y: 0 },
    { type: 'waypoint', name: 'b_ad', x: 10, y: 0 },
    { type: 'waypoint', name: 'c_ae', x: 1, y: 0 },
    { type: 'waypoint', name: 'd_bf', x: 20, y: 0 },
    { type: 'waypoint', name: 'e_cf', x: 2, y: 0 },
    { type: 'waypoint', name: 'f_de', x: 3, y: 0 },
  ] });

  assert.equal(findTutorialAiPath({ arena, currentWaypointId: 'a', targetWaypointId: 'f', choice: 0, random: () => 0 }), 'cef');
  assert.equal(findTutorialAiPath({ arena, currentWaypointId: 'a', targetWaypointId: 'f', choice: 1, random: () => .999 }), 'bdf');
  assert.throws(() => findTutorialAiPath({ arena, currentWaypointId: 'a', targetWaypointId: 'z', random: () => 0 }), /unreachable source waypoint/i);
});

test('AI cancels crouch before movement when the original ±19,-20 probe reaches a wall', () => {
  const arena = compileTutorialAiArena({ nodes: [
    { type: 'waypoint', name: 'a_b', x: 0, y: 0 },
    { type: 'waypoint', name: 'b_a', x: 100, y: 0 },
  ] });
  const self = actor({ position: { x: 100, y: 50, node: 'a' } });
  const state = {
    ...createTutorialAiState({ actor: self, arena, random: () => .99 }),
    nextWaypointId: 'a',
    crouch: 5,
    getTargetEvent: 12,
  };
  const result = advanceTutorialAi({
    state,
    actor: self,
    units: [self],
    arena,
    wall: { isSolid: (x, y) => x === 81 && y === 30 },
    gameStarted: false,
    random: () => .99,
  });
  assert.deepEqual({ crouch: result.state.crouch, keys: result.keys }, { crouch: 0, keys: TUTORIAL_AI_KEYS.LEFT });
});

test('AI uses the mirrored right-side crouch recovery probe from AI.EnterFrame', () => {
  const arena = compileTutorialAiArena({ nodes: [
    { type: 'waypoint', name: 'a_b', x: 0, y: 0 },
    { type: 'waypoint', name: 'b_a', x: 100, y: 0 },
  ] });
  const self = actor({ position: { x: 0, y: 50, node: 'a' } });
  const state = {
    ...createTutorialAiState({ actor: self, arena, random: () => .99 }),
    nextWaypointId: 'b',
    crouch: 5,
    getTargetEvent: 12,
  };
  const result = advanceTutorialAi({
    state,
    actor: self,
    units: [self],
    arena,
    wall: { isSolid: (x, y) => x === 19 && y === 30 },
    gameStarted: false,
    random: () => .99,
  });
  assert.deepEqual({ crouch: result.state.crouch, keys: result.keys }, { crouch: 0, keys: TUTORIAL_AI_KEYS.RIGHT });
});

test('AI uses the source PhysActor body while a previously acquired target is dead', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const self = actor();
  const corpse = actor({
    id: 'unit0',
    team: 1,
    dead: {
      id: 'corpse-unit0',
      parts: [{ kind: 'body', position: { x: 333, y: 444 }, impulses: [] }],
    },
  });
  const state = { ...createTutorialAiState({ actor: self, arena, random: () => 0 }), targetId: 'unit0', getTargetEvent: 12 };
  const aimedAtCorpse = advanceTutorialAi({ state, actor: self, units: [self, corpse], arena, wall: transparentWall });
  assert.deepEqual({ focusX: aimedAtCorpse.state.focusX, focusY: aimedAtCorpse.state.focusY }, { focusX: 333, focusY: 454 });
});

test('AI has no generic fallback for noSpawn/bad source records', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const noSpawn = actor({ definition: { extra: { noSpawn: true } } }); const noSpawnState = createTutorialAiState({ actor: noSpawn, arena, random: () => 0 });
  assert.deepEqual(advanceTutorialAi({ state: noSpawnState, actor: noSpawn, units: [noSpawn], arena, wall: transparentWall }), { state: noSpawnState, keys: 0, jumpRequested: false, shouldShoot: false });
  assert.throws(() => compileTutorialAiArena({ nodes: [{ type: 'waypoint', name: 'a_b', x: 0, y: 0 }] }), /unavailable waypoint b/);
  assert.throws(() => createTutorialAiState({ actor: actor({ position: null }), arena }), /finite source actor position/);
  assert.throws(() => createTutorialAiState({ actor: actor({ gun: { curGun: null } }), arena }), /active source gun stats/);
});

test('AI preserves original 120-frame closest-waypoint fallback and dead-unit return', () => {
  const arena = compileTutorialAiArena({ nodes: [
    { type: 'waypoint', name: 'a_b', x: 0, y: 0 }, { type: 'waypoint', name: 'b_a', x: 100, y: 0 },
  ] });
  const self = actor({ position: { x: 500, y: 1000, node: 'a' } });
  const state = { ...createTutorialAiState({ actor: self, arena, random: () => 0 }), curWaypointId: 'a', nextWaypointId: 'b', wpTimer: 120, getTargetEvent: 12 };
  const fallback = advanceTutorialAi({ state, actor: self, units: [self], arena, wall: transparentWall, gameStarted: false, random: () => .99 });
  assert.equal(fallback.state.nextWaypointId, 'b');
  const dead = actor({ dead: { id: 'corpse' } }); const deadState = createTutorialAiState({ actor: dead, arena: compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut), random: () => 0 });
  assert.deepEqual(advanceTutorialAi({ state: deadState, actor: dead, units: [dead], arena: compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut), wall: transparentWall }), { state: { ...deadState, wpTimer: 1 }, keys: 0, jumpRequested: false, shouldShoot: false });
});

test('AI keeps a waypoint while source movement is jumping across a vertical gap', () => {
  const arena = compileTutorialAiArena(ARENA_SOURCE_LAYOUTS.tut);
  const self = actor({ position: { x: 330, y: 1400, node: 'a' }, movement: { xVelocity: 0, yVelocity: 0, jumping: true, crouching: false } });
  const state = { ...createTutorialAiState({ actor: self, arena, random: () => 0 }), nextWaypointId: 'e', getTargetEvent: 12 };
  const result = advanceTutorialAi({ state, actor: self, units: [self], arena, wall: transparentWall, gameStarted: false, random: () => .99 });
  assert.equal(result.state.nextWaypointId, 'e');
});
