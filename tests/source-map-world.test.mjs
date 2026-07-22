import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareSourceMapWorld } from '../src/source-map-world.mjs';

test('a map world is published only with matching source layers and decoded wallMC collision', async () => {
  const calls = [];
  const result = await prepareSourceMapWorld({
    options: { mapId: 'cave2', mode: 'jug' },
    createWorld: (options) => ({ ...options, terrainMapId: 'cave', wall: null }),
    getMapVisual: (mapId) => ({ mapId, sky: './sky.png', background: './background.png', terrain: './terrain.png' }),
    getMapLayerCrop: (file) => ({ x: file.length, y: 0, width: 1, height: 1 }),
    loadMapLayers: async (visual) => {
      calls.push(`layers:${visual.mapId}`);
      return { sky: {}, map: {}, terrain: {} };
    },
    loadSourceWallMask: async (mapId) => {
      calls.push(`wall:${mapId}`);
      return { source: { characterId: 1350 }, frame: 1, mask: { source: 'wall-cave-1350/1.png' } };
    },
  });

  assert.deepEqual({ calls, mapId: result.mapId, wall: result.world.wall, wallSource: result.world.wallSource, crops: result.layers }, {
    calls: ['layers:cave2', 'wall:cave2'],
    mapId: 'cave2',
    wall: { source: 'wall-cave-1350/1.png' },
    wallSource: { characterId: 1350, frame: 1 },
    crops: {
      sky: { sourceCrop: { x: 9, y: 0, width: 1, height: 1 } },
      map: { sourceCrop: { x: 16, y: 0, width: 1, height: 1 } },
      terrain: { sourceCrop: { x: 13, y: 0, width: 1, height: 1 } },
    },
  });
});

test('a wall loading failure rejects before a partial map world is returned', async () => {
  await assert.rejects(
    prepareSourceMapWorld({
      options: { mapId: 'swamp' },
      createWorld: () => { throw new Error('must not create partial world'); },
      getMapVisual: () => ({}),
      getMapLayerCrop: () => ({}),
      loadMapLayers: async () => ({ sky: {}, map: {}, terrain: {} }),
      loadSourceWallMask: async () => { throw new Error('wall image missing'); },
    }),
    /wall image missing/,
  );
});

test('a source map world retains every predecoded wallMC frame for same-tick visual timeline swaps', async () => {
  const result = await prepareSourceMapWorld({
    options: { mapId: 'foundry' },
    createWorld: () => ({ wall: null }),
    getMapVisual: () => ({ sky: './sky.png', background: './background.png', terrain: './terrain.png' }),
    getMapLayerCrop: () => ({ x: 0, y: 0, width: 1, height: 1 }),
    loadMapLayers: async () => ({ sky: {}, map: {}, terrain: {} }),
    loadSourceWallMask: async () => ({
      source: { characterId: 1261 }, frame: 1, mask: { id: 'one' },
      masks: [{ frame: 1, mask: { id: 'one' } }, { frame: 2, mask: { id: 'two' } }],
    }),
  });

  assert.deepEqual(result.world.wallFrames, [
    { frame: 1, mask: { id: 'one' } },
    { frame: 2, mask: { id: 'two' } },
  ]);
});
