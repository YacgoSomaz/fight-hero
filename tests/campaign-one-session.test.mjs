import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from '../src/campaign-one-session.mjs';

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
