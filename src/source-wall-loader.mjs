import { loadSourceWallFrames } from './map-loader.mjs';
import { getSourceWall } from './source-wall-catalog.mjs';
import { decodeFlashWallImage } from './wall-mask.mjs';

// Load every timeline frame before publishing the selected collision mask. This
// keeps Arena's source frame metadata with the exact image that was decoded.
export async function loadSourceWallMask(mapId, {
  frame = 1,
  makeImage,
  decodeWallImage = decodeFlashWallImage,
} = {}) {
  const source = getSourceWall(mapId);
  const frames = await loadSourceWallFrames(source, makeImage);
  const selected = frames.find((candidate) => candidate.frame === frame);
  if (!selected) throw new Error(`Original Arena wallMC frame ${frame} is unavailable for ${mapId}`);
  // Dynamic Arena children (for example Foundry pot_203) can call
  // changeWallFrame during a stage tick. Decode every source frame before
  // publishing the world so that visual and collision state can change in the
  // same tick rather than waiting for an image decode.
  const masks = Object.freeze(frames.map((candidate) => Object.freeze({
    frame: candidate.frame,
    mask: decodeWallImage(candidate.image),
  })));
  const selectedMask = masks.find((candidate) => candidate.frame === frame);
  return Object.freeze({
    source,
    frame,
    frames: Object.freeze(frames),
    masks,
    mask: selectedMask.mask,
  });
}
