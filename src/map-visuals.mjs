const ARENA = './private-assets/arena-clean-art-export/DefineSprite_1413_Arena';
const BG = './private-assets/background-export/DefineSprite_1210_Bg';
const SKY = './private-assets/background-export/DefineSprite_1187_BgSky';
const CROP = Object.freeze({
  [`${BG}/2.png`]: [1336, 184, 2400, 856], [`${BG}/6.png`]: [1336, 584, 2584, 292], [`${BG}/8.png`]: [1336, 184, 1296, 692],
  [`${BG}/10.png`]: [1252, 140, 2524, 1012], [`${BG}/12.png`]: [1260, 20, 2520, 1012], [`${BG}/14.png`]: [1336, 188, 2040, 696],
  [`${BG}/15.png`]: [1340, 272, 2032, 608], [`${BG}/18.png`]: [1312, 556, 2192, 464], [`${BG}/19.png`]: [1312, 184, 2200, 848],
  [`${SKY}/1.png`]: [796, 0, 800, 600], [`${SKY}/2.png`]: [796, 0, 1600, 812], [`${SKY}/3.png`]: [796, 0, 1600, 812],
  [`${SKY}/4.png`]: [796, 0, 1164, 812], [`${SKY}/5.png`]: [796, 0, 1164, 812], [`${SKY}/6.png`]: [796, 0, 1164, 812], [`${SKY}/7.png`]: [796, 0, 1600, 812],
  // Arena frame 8 is the tutorial/facility foreground.  FFDec preserves a
  // large transparent stage border around it; drawing that full bitmap makes
  // the world and its decoded physics appear in different places.
  [`${ARENA}/8.png`]: [530, 522, 2952, 1708],
});

// The labels and frame pairing come directly from Stats_Maps.as, Bg and
// BgSky.  Arena frame exports were sanitised only to remove authoring nodes
// and the runtime-hidden wallMC collision bitmap; no scene artwork is drawn
// by this module.
const VISUALS = Object.freeze({
  foundry: { terrainMapId: 'foundry', sky: `${SKY}/1.png`, background: './public/assets/maps/foundry.png', terrain: './public/assets/maps/foundry-foreground.png' },
  foundry2: { terrainMapId: 'foundry', sky: `${SKY}/1.png`, background: `${BG}/2.png`, terrain: './public/assets/maps/foundry-foreground.png' },
  train: { terrainMapId: 'train', sky: `${SKY}/2.png`, background: `${BG}/6.png`, terrain: `${ARENA}/3.png` },
  train2: { terrainMapId: 'train2', sky: `${SKY}/3.png`, background: `${BG}/8.png`, terrain: `${ARENA}/4.png` },
  plane: { terrainMapId: 'plane', sky: `${SKY}/4.png`, background: `${BG}/10.png`, terrain: `${ARENA}/5.png` },
  plane2: { terrainMapId: 'plane', sky: `${SKY}/7.png`, background: `${BG}/6.png`, terrain: `${ARENA}/5.png` },
  swamp: { terrainMapId: 'swamp', sky: `${SKY}/4.png`, background: `${BG}/15.png`, terrain: `${ARENA}/6.png` },
  swamp2: { terrainMapId: 'swamp', sky: `${SKY}/5.png`, background: `${BG}/14.png`, terrain: `${ARENA}/6.png` },
  cave: { terrainMapId: 'cave', sky: `${SKY}/4.png`, background: `${BG}/18.png`, terrain: `${ARENA}/7.png` },
  cave2: { terrainMapId: 'cave', sky: `${SKY}/6.png`, background: `${BG}/19.png`, terrain: `${ARENA}/7.png` },
  tut: { terrainMapId: 'tut', sky: `${SKY}/5.png`, background: `${BG}/18.png`, terrain: `${ARENA}/8.png` },
  dropship: { terrainMapId: 'dropship', sky: `${SKY}/4.png`, background: `${BG}/12.png`, terrain: `${ARENA}/9.png` },
  missile: { terrainMapId: 'missile', sky: `${SKY}/4.png`, background: `${BG}/12.png`, terrain: `${ARENA}/10.png` },
  missile2: { terrainMapId: 'missile', sky: `${SKY}/6.png`, background: `${BG}/12.png`, terrain: `${ARENA}/10.png` },
});

export function getMapVisual(mapId) { return VISUALS[mapId] ?? VISUALS.foundry; }
export function getMapLayerCrop(source) {
  const [x, y, width, height] = CROP[source] ?? [0, 0, 0, 0];
  return { x, y, width, height };
}
