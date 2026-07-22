import { TUTORIAL_WALL_SOURCE } from './tutorial-wall-source.mjs';

// Original Arena.as calls wallMC.gotoAndStop(map.wall) and draws the selected
// symbol into BitmapData.  These are direct FFDec PNG exports of those wallMC
// symbols; night/dawn variants select a different visual backdrop but retain
// the same physical Arena wall symbol.
const wall = (characterId, directory, width, height, frameCount = 1) => Object.freeze({
  characterId,
  frames: Object.freeze(Array.from({ length: frameCount }, (_, index) => Object.freeze({
    frame: index + 1,
    width,
    height,
    file: `./public/assets/original-swf/${directory}/${index + 1}.png`,
  }))),
});

const PHYSICAL_WALLS = Object.freeze({
  foundry: wall(1261, 'wall-foundry-1261', 2874, 863, 2),
  train: wall(1308, 'wall-train-1308', 2868, 2014),
  plane: wall(1323, 'wall-plane-1323', 2874, 1430),
  swamp: wall(1342, 'wall-swamp-1342', 2757, 1205),
  cave: wall(1350, 'wall-cave-1350', 2757, 1270),
  tut: TUTORIAL_WALL_SOURCE,
  dropship: wall(1406, 'wall-dropship-1406', 2874, 1750),
  missile: wall(1411, 'wall-missile-1411', 2874, 1750),
});

const PHYSICAL_MAP_ID = Object.freeze({
  foundry2: 'foundry',
  train2: 'train',
  plane2: 'plane',
  swamp2: 'swamp',
  cave2: 'cave',
  missile2: 'missile',
});

export function getSourceWall(mapId) {
  const physicalMapId = PHYSICAL_MAP_ID[mapId] ?? mapId;
  const source = PHYSICAL_WALLS[physicalMapId];
  if (!source) throw new Error(`Original Arena wallMC is unavailable: ${mapId}`);
  return source;
}

export { PHYSICAL_MAP_ID, PHYSICAL_WALLS };
