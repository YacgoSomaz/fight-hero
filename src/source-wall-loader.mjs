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
  return Object.freeze({
    source,
    frame,
    frames: Object.freeze(frames),
    mask: decodeWallImage(selected.image),
  });
}
