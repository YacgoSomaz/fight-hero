import test from 'node:test';
import assert from 'node:assert/strict';
import { getMapLayerCrop, getMapVisual } from '../src/map-visuals.mjs';

test('Train draws the locally extracted original Arena terrain and Stats_Maps desert layers', () => {
  const visual = getMapVisual('train');
  assert.equal(visual.terrainMapId, 'train');
  assert.match(visual.terrain, /arena-clean-art-export\/DefineSprite_1413_Arena\/3\.png$/);
  assert.match(visual.background, /background-export\/DefineSprite_1210_Bg\/6\.png$/);
  assert.match(visual.sky, /background-export\/DefineSprite_1187_BgSky\/2\.png$/);
});

test('source background sprites use their authored visible bounds rather than transparent FFDec stage padding', () => {
  assert.deepEqual(getMapLayerCrop('./private-assets/background-export/DefineSprite_1187_BgSky/2.png'), { x: 796, y: 0, width: 1600, height: 812 });
  assert.deepEqual(getMapLayerCrop('./private-assets/background-export/DefineSprite_1210_Bg/6.png'), { x: 1336, y: 584, width: 2584, height: 292 });
});

test('Tutorial terrain uses its authored visible bounds instead of the empty FFDec stage canvas', () => {
  const visual = getMapVisual('tut');
  assert.match(visual.sky, /public\/assets\/maps\/tut\/sky\.png$/);
  assert.match(visual.background, /public\/assets\/maps\/tut\/background\.png$/);
  assert.match(visual.terrain, /public\/assets\/maps\/tut\/foreground\.png$/);
  assert.deepEqual(getMapLayerCrop(visual.terrain), { x: 526, y: 509, width: 2961, height: 1730 });
});

test('every decoded Arena foreground removes its transparent FFDec stage border before camera sampling', () => {
  const root = './private-assets/arena-clean-art-export/DefineSprite_1413_Arena';
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
    sky: './private-assets/background-export/DefineSprite_1187_BgSky/1.png',
    background: './private-assets/background-export/DefineSprite_1210_Bg/2.png',
    terrain: './public/assets/maps/foundry-foreground.png',
  });
  assert.equal(getMapVisual('plane2').terrainMapId, 'plane');
  assert.match(getMapVisual('plane2').sky, /7\.png$/);
});
