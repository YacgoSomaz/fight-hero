import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getMapLayerCrop, getMapVisual } from '../src/map-visuals.mjs';

const MAP_IDS = Object.freeze(['tut', 'foundry', 'foundry2', 'train', 'train2', 'plane', 'plane2', 'swamp', 'swamp2', 'cave', 'cave2', 'dropship', 'missile', 'missile2']);

async function readLayerSize(source) {
  const bytes = await readFile(new URL(`../${source.slice(2)}`, import.meta.url));
  if (source.endsWith('.png')) {
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${source} must remain a PNG`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  const root = new TextDecoder().decode(bytes.subarray(0, 512));
  const width = Number(root.match(/width="([\d.]+)px"/)?.[1]);
  const height = Number(root.match(/height="([\d.]+)px"/)?.[1]);
  assert.ok(Number.isFinite(width) && Number.isFinite(height), `${source} must expose original SVG dimensions`);
  return { width, height };
}

test('every launchable source map uses versioned runtime image layers rather than ignored extraction folders', () => {
  for (const mapId of MAP_IDS) {
    const visual = getMapVisual(mapId);
    for (const source of [visual.sky, visual.background, visual.terrain]) {
      const sourceIsTutorialBaseShape = mapId === 'tut' && source === visual.terrain;
      assert.match(source, sourceIsTutorialBaseShape
        ? /^\.\/public\/assets\/original-swf\/tutorial-arena\/1353\.svg$/
        : /^\.\/public\/assets\/maps\//, `${mapId} must not require a private runtime asset`);
    }
  }
});

test('every launchable map layer exists in the fresh-clone runtime with a positive source registration extent', async () => {
  for (const mapId of MAP_IDS) {
    const visual = getMapVisual(mapId);
    for (const source of [visual.sky, visual.background, visual.terrain]) {
      const crop = getMapLayerCrop(source);
      const size = await readLayerSize(source);
      assert.ok(crop.width > 0 && crop.height > 0, `${mapId}: ${source} needs an authored visible crop`);
      assert.ok(crop.x >= 0 && crop.y >= 0, `${mapId}: ${source} crop cannot begin outside its PNG`);
      assert.ok(size.width > 0 && size.height > 0, `${mapId}: ${source} has no drawable source dimensions`);
    }
  }
});

test('Train draws the locally extracted original Arena terrain and Stats_Maps desert layers', () => {
  const visual = getMapVisual('train');
  assert.equal(visual.terrainMapId, 'train');
  assert.match(visual.terrain, /public\/assets\/maps\/source\/arena\/3\.png$/);
  assert.match(visual.background, /public\/assets\/maps\/source\/background\/6\.png$/);
  assert.match(visual.sky, /public\/assets\/maps\/source\/sky\/2\.png$/);
});

test('source background sprites use their authored visible bounds rather than transparent FFDec stage padding', () => {
  assert.deepEqual(getMapLayerCrop('./public/assets/maps/source/sky/2.png'), { x: 796, y: 0, width: 1598, height: 809 });
  assert.deepEqual(getMapLayerCrop('./public/assets/maps/source/background/6.png'), { x: 1336, y: 584, width: 2581, height: 292 });
});

test('Tutorial terrain uses original Arena Shape 1353 and its source registration instead of a flattened FFDec canvas', () => {
  const visual = getMapVisual('tut');
  assert.match(visual.sky, /public\/assets\/maps\/tut\/sky\.png$/);
  assert.match(visual.background, /public\/assets\/maps\/tut\/background\.png$/);
  assert.match(visual.terrain, /public\/assets\/original-swf\/tutorial-arena\/1353\.svg$/);
  assert.deepEqual(getMapLayerCrop(visual.terrain), { x: 523.8, y: 559.9, width: 3636, height: 2574 });
});

test('every decoded Arena foreground removes its transparent FFDec stage border before camera sampling', () => {
  const root = './public/assets/maps/source/arena';
  const crops = {
    2: { x: 426, y: 496, width: 3102, height: 1000 },
    3: { x: 520, y: 1708, width: 3172, height: 874 },
    4: { x: 520, y: 1708, width: 3172, height: 874 },
    5: { x: 724, y: 929, width: 2532, height: 935 },
    6: { x: 437, y: 598, width: 3030, height: 1378 },
    7: { x: 422, y: 535, width: 3105, height: 1415 },
    8: { x: 526, y: 509, width: 2961, height: 1730 },
    9: { x: 1766, y: 1701, width: 521, height: 279 },
    10: { x: 1133, y: 929, width: 1637, height: 1093 },
  };
  for (const [frame, expected] of Object.entries(crops)) {
    assert.deepEqual(getMapLayerCrop(`${root}/${frame}.png`), expected, `Arena frame ${frame}`);
  }
});

test('night variants use their original background selection while retaining the matching terrain map', () => {
  assert.deepEqual(getMapVisual('foundry2'), {
    terrainMapId: 'foundry',
    sky: './public/assets/maps/source/sky/1.png',
    background: './public/assets/maps/source/background/2.png',
    terrain: './public/assets/maps/foundry-foreground.png',
  });
  assert.equal(getMapVisual('plane2').terrainMapId, 'plane');
  assert.match(getMapVisual('plane2').sky, /7\.png$/);
});
