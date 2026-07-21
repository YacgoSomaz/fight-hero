const ARENA = './private-assets/arena-clean-art-export/DefineSprite_1413_Arena';
const BG = './private-assets/background-export/DefineSprite_1210_Bg';
const SKY = './private-assets/background-export/DefineSprite_1187_BgSky';
const TUTORIAL = './public/assets/maps/tut';
const CROP = Object.freeze({
  [`${BG}/2.png`]: [1336, 184, 2400, 856], [`${BG}/6.png`]: [1336, 584, 2584, 292], [`${BG}/8.png`]: [1336, 184, 1296, 692],
  [`${BG}/10.png`]: [1252, 140, 2524, 1012], [`${BG}/12.png`]: [1260, 20, 2520, 1012], [`${BG}/14.png`]: [1336, 188, 2040, 696],
  [`${BG}/15.png`]: [1340, 272, 2032, 608], [`${BG}/18.png`]: [1312, 556, 2192, 464], [`${BG}/19.png`]: [1312, 184, 2200, 848],
  [`${SKY}/1.png`]: [796, 0, 800, 600], [`${SKY}/2.png`]: [796, 0, 1600, 812], [`${SKY}/3.png`]: [796, 0, 1600, 812],
  [`${SKY}/4.png`]: [796, 0, 1164, 812], [`${SKY}/5.png`]: [796, 0, 1164, 812], [`${SKY}/6.png`]: [796, 0, 1164, 812], [`${SKY}/7.png`]: [796, 0, 1600, 812],
  [`${TUTORIAL}/sky.png`]: [796, 0, 1164, 812], [`${TUTORIAL}/background.png`]: [1312, 556, 2192, 464],
  // FFDec preserves the authoring-stage border around each Arena frame.
  // These are the alpha bounds of the original exported foregrounds, so
  // camera sampling shares the coordinate range used by decoded physics.
  [`${ARENA}/2.png`]: [426, 496, 3102, 1000],
  [`${ARENA}/3.png`]: [520, 1708, 3172, 874],
  [`${ARENA}/4.png`]: [520, 1708, 3172, 874],
  [`${ARENA}/5.png`]: [724, 929, 2532, 935],
  [`${ARENA}/6.png`]: [437, 598, 3030, 1378],
  [`${ARENA}/7.png`]: [422, 535, 3105, 1415],
  [`${ARENA}/8.png`]: [526, 509, 2961, 1730],
  [`${ARENA}/9.png`]: [1766, 1701, 521, 279],
  [`${ARENA}/10.png`]: [1133, 929, 1637, 1093],
  [`${TUTORIAL}/foreground.png`]: [526, 509, 2961, 1730],
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
  // These are byte-for-byte local exports of BgSky frame 5, Bg frame 18 and
  // Arena frame 8.  Runtime must not depend on an ignored extraction folder.
  tut: { terrainMapId: 'tut', sky: `${TUTORIAL}/sky.png`, background: `${TUTORIAL}/background.png`, terrain: `${TUTORIAL}/foreground.png` },
  dropship: { terrainMapId: 'dropship', sky: `${SKY}/4.png`, background: `${BG}/12.png`, terrain: `${ARENA}/9.png` },
  missile: { terrainMapId: 'missile', sky: `${SKY}/4.png`, background: `${BG}/12.png`, terrain: `${ARENA}/10.png` },
  missile2: { terrainMapId: 'missile', sky: `${SKY}/6.png`, background: `${BG}/12.png`, terrain: `${ARENA}/10.png` },
});

export function getMapVisual(mapId) { return VISUALS[mapId] ?? VISUALS.foundry; }
export function getMapLayerCrop(source) {
  const [x, y, width, height] = CROP[source] ?? [0, 0, 0, 0];
  return { x, y, width, height };
}
