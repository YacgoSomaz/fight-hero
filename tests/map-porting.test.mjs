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
