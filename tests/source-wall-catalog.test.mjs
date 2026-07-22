import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { getSourceWall } from '../src/source-wall-catalog.mjs';

const EXPECTED_WALLS = Object.freeze({
  foundry: 1261, foundry2: 1261,
  train: 1308, train2: 1308,
  plane: 1323, plane2: 1323,
  swamp: 1342, swamp2: 1342,
  cave: 1350, cave2: 1350,
  tut: 1378,
  dropship: 1406,
  missile: 1411, missile2: 1411,
});

test('every launchable original map resolves to its extracted wallMC source symbol', () => {
  for (const [mapId, characterId] of Object.entries(EXPECTED_WALLS)) {
    const wall = getSourceWall(mapId);
    assert.equal(wall.characterId, characterId, `${mapId} must use its Arena wallMC character`);
    assert.ok(wall.frames.length > 0, `${mapId} must retain at least one source wall frame`);
  }
});

test('each resolved source wall frame is a public runtime PNG, not an ignored extraction path', async () => {
  for (const mapId of Object.keys(EXPECTED_WALLS)) {
    const wall = getSourceWall(mapId);
    for (const frame of wall.frames) {
      assert.match(frame.file, /^\.\/public\/assets\/original-swf\/wall-/, `${mapId} needs a versioned public wall asset`);
      const local = new URL(`../${frame.file.slice(2)}`, import.meta.url);
      await access(local);
      const header = await readFile(local, { length: 24 });
      assert.deepEqual([...header.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${mapId} frame ${frame.frame} must be PNG`);
      assert.equal(header.readUInt32BE(16), frame.width, `${mapId} frame ${frame.frame} source width`);
      assert.equal(header.readUInt32BE(20), frame.height, `${mapId} frame ${frame.frame} source height`);
    }
  }
});
