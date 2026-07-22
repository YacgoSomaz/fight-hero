import { loadSourceWallFrames } from './map-loader.mjs';
import { createTutorialWallSet } from './tutorial-wall-runtime.mjs';
import { TUTORIAL_WALL_SOURCE } from './tutorial-wall-source.mjs';
import { createTutorialWorld } from './tutorial-world.mjs';
import { decodeFlashWallImage } from './wall-mask.mjs';

// Browser construction boundary for the Tutorial.  Its dependency injection
// keeps decoding testable but its defaults always point at original public
// Wall_tut frames and the shared Flash ARGB image decoder.
export async function loadTutorialWorld({ makeImage, decode = decodeFlashWallImage } = {}) {
  const frames = await loadSourceWallFrames(TUTORIAL_WALL_SOURCE, makeImage);
  const wallSet = createTutorialWallSet(frames, decode);
  return createTutorialWorld({ wallSet });
}
