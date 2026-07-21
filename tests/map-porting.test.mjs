import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/engine.mjs';

test('Train uses its decoded Arena collision, spawn, navigation, action, and pickup layers', () => {
  const world = createWorld({ mapId: 'train', bots: false });

  assert.equal(world.mapId, 'train');
  assert.equal(world.collisionBoxes.length, 12);
  assert.equal(world.players[0].spawnX, 774.8);
  assert.equal(world.players[0].spawnY, 1812.45);
  assert.equal(world.navigation.length, 16);
  assert.equal(world.actions.length, 22);
  assert.equal(world.pickups.length, 4);
});

test('every original Arena map is registered only with decoded source layout data', () => {
  for (const mapId of ['foundry', 'train', 'train2', 'plane', 'swamp', 'cave', 'tut', 'dropship', 'missile']) {
    const world = createWorld({ mapId, bots: false });
    assert.equal(world.mapId, mapId);
    assert.ok(world.collisionBoxes.length > 0, `${mapId} needs decoded collision boxes`);
    assert.ok(world.players[0].spawnX > 0, `${mapId} needs an authored spawn`);
  }
});

test('source day/night map variants retain their requested id while sharing the original Arena terrain', () => {
  const nightFoundry = createWorld({ mapId: 'foundry2', bots: false });
  const dawnPlane = createWorld({ mapId: 'plane2', bots: false });
  const duskCave = createWorld({ mapId: 'cave2', bots: false });

  assert.equal(nightFoundry.mapId, 'foundry2');
  assert.equal(nightFoundry.terrainMapId, 'foundry');
  assert.equal(nightFoundry.collisionBoxes.length, 33);
  assert.equal(dawnPlane.terrainMapId, 'plane');
  assert.equal(duskCave.terrainMapId, 'cave');
});

test('Foundry exposes its original CTF flags and domination points from Arena nodes', () => {
  const ctf = createWorld({ mapId: 'foundry', mode: 'ctf', bots: false, random: () => .99 });
  const dom = createWorld({ mapId: 'foundry', mode: 'dom', bots: false });

  assert.equal(ctf.mode, 'ctf');
  assert.deepEqual(ctf.objectives.flags.map(({ id, team, x, y }) => ({ id, team, x, y })), [
    { id: 'a', team: 1, x: 128.5, y: 712.7 }, { id: 'j', team: 2, x: 2687.1, y: 508.15 },
  ]);
  assert.deepEqual(dom.objectives.holdpoints.map(({ letter, x, y }) => ({ letter, x, y })), [
    { letter: 'A', x: 494.8, y: 499.9 }, { letter: 'B', x: 1653.2, y: 414.95 }, { letter: 'C', x: 2214.15, y: 702.9 },
  ]);
});
