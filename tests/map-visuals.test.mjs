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
