import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCampaignOneSessionUnits, applyCampaignOneSessionDeath, applyCampaignOneSessionFrame, applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from '../src/campaign-one-session.mjs';

// User journey: starting Under Siege must create its authored Tutorial map
// session, not a generic quick-match.  The player and all four source units
// keep their original identity, spawn state and tutorial restrictions.
test('Campaign 1 session retains source tutorial arena and setMatch actors', () => {
  const session = createCampaignOneSession();

  assert.deepEqual(
    { mapId: session.map.id, wallCharacter: session.map.wallCharacter, state: session.runtime },
    { mapId: 'tut', wallCharacter: 1378, state: { state: 1, frame: 0 } },
  );
  assert.deepEqual(session.actors.map(({ id, team, name, soldier, skin, spawned, spawn, noAim }) => ({ id, team, name, soldier, skin, spawned, spawn, noAim })), [
    { id: 'unit0', team: 1, name: 'Scientist', soldier: 'medic', skin: 7, spawned: true, spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
    { id: 'unit1', team: 2, name: 'Unknown', soldier: 'tank', skin: 5, spawned: true, spawn: { x: 1530, y: 695, node: 'a' }, noAim: false },
    { id: 'unit2', team: 2, name: 'Unknown', soldier: 'soldier', skin: 5, spawned: true, spawn: { x: 1760, y: 695, node: 'a' }, noAim: false },
    { id: 'unit3', team: 2, name: 'Unknown', soldier: 'medic', skin: 5, spawned: true, spawn: { x: 1790, y: 695, node: 'a' }, noAim: false },
    { id: 'unit4', team: 1, name: 'Soldier', soldier: 'soldier', skin: 1, spawned: false, spawn: null, noAim: false },
  ]);
});

// User journey: when the original state-13 floor trigger is reached, it must
// mutate the Tutorial session's source wall frame and re-spawn the authored
// enemy units at the exact source coordinates—not merely return a log entry.
test('Campaign 1 session consumes source effects into actors and wall state', () => {
  const session = createCampaignOneSession();
  session.runtime.state = 13;

  const effects = applyCampaignOneSessionSurfaceContact(session, { surface: 'ff00ff', human: true });

  assert.equal(effects.at(-1).type, 'changeWallFrame');
  assert.equal(session.map.wallFrame, 14);
  assert.deepEqual(session.actors.slice(1, 4).map(({ id, spawned, spawn, position, difficulty }) => ({ id, spawned, spawn, position, difficulty })), [
    { id: 'unit1', spawned: true, spawn: { x: 1530, y: 695, node: 'a' }, position: { x: 300, y: 1200, node: 'i' }, difficulty: 1 },
    { id: 'unit2', spawned: true, spawn: { x: 1760, y: 695, node: 'a' }, position: { x: 750, y: 1130, node: 'h' }, difficulty: 1 },
    { id: 'unit3', spawned: true, spawn: { x: 1790, y: 695, node: 'a' }, position: { x: 270, y: 1470, node: 'a' }, difficulty: 1 },
  ]);
});

test('Campaign 1 session consumes the original frame-zero tutorial equipment effect instead of only logging it', () => {
  const session = createCampaignOneSession();

  const effects = applyCampaignOneSessionFrame(session);

  assert.deepEqual(effects, [{ type: 'setGuns', target: 'player', primary: 'none', secondary: 'none' }]);
  assert.deepEqual(session.actors[0].guns, { primary: 'none', secondary: 'none', active: 'none' });
  assert.deepEqual(session.runtime, { state: 1, frame: 1 });
});

test('Campaign 1 creates source Unit.setClass/Status state only for actors whose original constructor spawned', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const snapshot = session.actors.map((actor) => ({
    id: actor.id,
    level: actor.level,
    unitInfo: actor.unitInfo && { id: actor.unitInfo.id, hp: actor.unitInfo.hp, crit: actor.unitInfo.crit, aim: actor.unitInfo.aim, skill: actor.unitInfo.skill },
    status: actor.status && { hpCur: actor.status.hpCur, hpMax: actor.status.hpMax, sSpawn: actor.status.sSpawn },
    currentGun: actor.gun?.curGun?.id ?? null,
  }));

  assert.deepEqual(snapshot, [
    { id: 'unit0', level: 1, unitInfo: { id: 'medic', hp: 85, crit: 0.06, aim: 0.7000000000000001, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 85, hpMax: 85, sSpawn: 0 }, currentGun: 'M4' },
    { id: 'unit1', level: 1, unitInfo: { id: 'tank', hp: 130, crit: 0.02, aim: 0.55, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 130, hpMax: 130, sSpawn: 15 }, currentGun: 'Beretta' },
    { id: 'unit2', level: 1, unitInfo: { id: 'soldier', hp: 100, crit: 0.04, aim: 0.6, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 100, hpMax: 100, sSpawn: 15 }, currentGun: 'Socom' },
    { id: 'unit3', level: 1, unitInfo: { id: 'medic', hp: 85, crit: 0.06, aim: 0.7000000000000001, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 85, hpMax: 85, sSpawn: 15 }, currentGun: 'USP' },
    { id: 'unit4', level: 18, unitInfo: null, status: null, currentGun: null },
  ]);
});

test('Campaign 1 advances spawned Unit Status after its source runScripts frame and leaves noSpawn actors untouched', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const results = advanceCampaignOneSessionUnits(session);

  assert.deepEqual(results, [
    { id: 'unit0', events: [], bloodAlpha: 0 },
    { id: 'unit1', events: [], bloodAlpha: null },
    { id: 'unit2', events: [], bloodAlpha: null },
    { id: 'unit3', events: [], bloodAlpha: null },
  ]);
  assert.deepEqual(session.actors.map(({ id, status }) => ({ id, statusFrame: status?.fc ?? null, spawn: status?.sSpawn ?? null })), [
    { id: 'unit0', statusFrame: 1, spawn: 0 },
    { id: 'unit1', statusFrame: 1, spawn: 14 },
    { id: 'unit2', statusFrame: 1, spawn: 14 },
    { id: 'unit3', statusFrame: 1, spawn: 14 },
    { id: 'unit4', statusFrame: null, spawn: null },
  ]);
});

// User journey: when Status.damage reaches zero HP, the original Unit.die()
// hides that Unit, gives it the source PhysActor corpse record and stops its
// Unit/Status frame updates.  This is lifecycle data only; Box2D rendering,
// score and respawn UI remain separate source work.
test('Campaign 1 applies the source Unit.die corpse lifecycle and removes the PhysActor at frame 150', () => {
  const session = createCampaignOneSession({ random: () => 0.5 });
  const [attacker, target] = session.actors;
  target.status.sSpawn = 0;
  const corpse = applyCampaignOneSessionDeath(session, { target, attacker, gun: attacker.gun.curGun, extra: { headMult: 1.5 } });

  assert.deepEqual({
    targetDead: target.dead === corpse,
    targetVisible: target.visible,
    respawnTimer: target.respawnTimer,
    canUseStreak: target.canUseStreak,
    corpseId: corpse.id,
    corpseOrigin: corpse.position,
    corpseCount: session.corpses.length,
  }, {
    targetDead: true,
    targetVisible: false,
    respawnTimer: 150,
    canUseStreak: false,
    corpseId: 'corpse-unit1',
    corpseOrigin: { x: 1530, y: 655 },
    corpseCount: 1,
  });
  const unitFrames = advanceCampaignOneSessionUnits(session);
  assert.deepEqual(unitFrames.map(({ id }) => id), ['unit0', 'unit2', 'unit3']);

  for (let frame = 0; frame < 150; frame += 1) advanceCampaignOneSessionUnits(session);
  assert.deepEqual(session.corpses, []);
});
