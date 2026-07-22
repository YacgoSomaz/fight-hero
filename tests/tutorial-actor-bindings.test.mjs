import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';

// Unit.setClass() selects UnitMC skin with `startFrame + skin`; Campaign 1
// must retain those distinct source identities rather than draw every actor
// as the prototype Medic.  Stats_Campaign owns the actor records and
// Stats_Classes owns these start frames.
test('Tutorial actor bindings retain each Campaign 1 source class, skin frame and spawn state', () => {
  const bindings = createTutorialActorBindings(createCampaignOneSession());

  assert.deepEqual(bindings.actors.map(({ id, human, soldier, skin, unitFrame, spawned, noAim, position }) => ({ id, human, soldier, skin, unitFrame, spawned, noAim, position })), [
    { id: 'unit0', human: true, soldier: 'medic', skin: 7, unitFrame: 57, spawned: true, noAim: true, position: { x: 285, y: 705, node: 'a' } },
    { id: 'unit1', human: false, soldier: 'tank', skin: 5, unitFrame: 105, spawned: true, noAim: false, position: { x: 1530, y: 695, node: 'a' } },
    { id: 'unit2', human: false, soldier: 'soldier', skin: 5, unitFrame: 155, spawned: true, noAim: false, position: { x: 1760, y: 695, node: 'a' } },
    { id: 'unit3', human: false, soldier: 'medic', skin: 5, unitFrame: 55, spawned: true, noAim: false, position: { x: 1790, y: 695, node: 'a' } },
    { id: 'unit4', human: false, soldier: 'soldier', skin: 1, unitFrame: 151, spawned: false, noAim: false, position: null },
  ]);
  assert.deepEqual(bindings.actors[0].guns, { primary: 'M4', secondary: 'USP', active: 'M4' });
  assert.equal(bindings.actors[0].level, null, 'Campaign source delegates player level to saved profile; adapter must not invent it');
});
