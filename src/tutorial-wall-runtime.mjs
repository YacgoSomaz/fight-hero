import { TUTORIAL_WALL_SOURCE } from './tutorial-wall-source.mjs';

// Retains the exact original frame identity: gameplay may only request one of
// the sixteen decoded Wall_tut frames extracted from the SWF.
export function createTutorialWallSet(loadedFrames, decode) {
  const sourceFrames = TUTORIAL_WALL_SOURCE.frames;
  const loadedByFrame = new Map(loadedFrames.map((loaded) => [loaded.frame, loaded]));
  const masks = new Map();

  for (const sourceFrame of sourceFrames) {
    const loaded = loadedByFrame.get(sourceFrame.frame);
    if (!loaded?.image) throw new Error(`missing original Wall_tut frame ${sourceFrame.frame}`);
    masks.set(sourceFrame.frame, decode(loaded.image));
  }

  return Object.freeze({
    source: TUTORIAL_WALL_SOURCE,
    at(frame) {
      const mask = masks.get(frame);
      if (!mask) throw new RangeError(`Wall_tut frame ${frame} is not available`);
      return mask;
    },
  });
}
