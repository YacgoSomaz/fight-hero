import { extractSymbolFrameDisplayList } from './parse-foundry-foreground.mjs';

const CUTSCENE = 1890;
const FRAME_COUNT = 46;

// Cutscene.as selects explicit source frames (Campaign 1 pre: 1/2/3).  This
// keeps its root Display List as source data so a future browser renderer can
// load the actual Shape/Sprite assets in depth order instead of recreating a
// generic dialogue screen.
export function extractCutsceneTimeline({ swf } = {}) {
  const frames = Array.from({ length: FRAME_COUNT }, (_, index) => {
    const source = extractSymbolFrameDisplayList({ character: CUTSCENE, frame: index + 1, ...(swf ? { swf } : {}) });
    if (source.kind !== 'sprite') throw new Error('original Cutscene symbol 1890 is not a sprite');
    return Object.freeze({ frame: source.frame, layers: source.layers });
  });
  return Object.freeze({ symbolId: CUTSCENE, frameCount: FRAME_COUNT, frames: Object.freeze(frames) });
}

// Pre-cutscene art is a mixture of direct Shapes and small nested Sprites.
// Return the recursively reachable source graph for selected root frames so
// the browser can ship exactly those assets, rather than substituting a
// screenshot or hand-authored panel.
export function extractCutsceneAssetGraph({ frames = [1, 2, 3], swf } = {}) {
  if (!Array.isArray(frames) || !frames.length || !frames.every((frame) => Number.isInteger(frame) && frame >= 1 && frame <= FRAME_COUNT)) {
    throw new TypeError('original Cutscene root frames are required');
  }
  const timeline = extractCutsceneTimeline({ swf });
  const roots = new Set(frames.flatMap((frame) => timeline.frames[frame - 1].layers.map(({ character }) => character)));
  const shapes = new Set();
  const sprites = new Set();
  const visited = new Set();
  const visit = (character) => {
    if (visited.has(character)) return;
    visited.add(character);
    const source = extractSymbolFrameDisplayList({ character, frame: 1, ...(swf ? { swf } : {}) });
    if (source.kind === 'shape') {
      shapes.add(character);
      return;
    }
    sprites.add(character);
    for (const child of source.layers) visit(child.character);
  };
  for (const character of roots) visit(character);
  return Object.freeze({
    symbolId: CUTSCENE,
    frames: Object.freeze([...frames]),
    shapes: Object.freeze([...shapes].sort((left, right) => left - right)),
    sprites: Object.freeze([...sprites].sort((left, right) => left - right)),
  });
}
