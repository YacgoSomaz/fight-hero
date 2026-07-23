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
