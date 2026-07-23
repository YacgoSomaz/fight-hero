const CHROME_IDS = Object.freeze([1482, 1483, 1484]);
const PORTRAIT_IDS = Object.freeze(Array.from({ length: 34 }, (_, index) => 632 + index));

function sourcePath(id, kind = '') {
  return `./public/assets/original-swf/tutorial-speak/${kind}${id}.svg`;
}

// Directly projected from Speak_187.head (symbol 666).  Each range is an
// unmodified source Display List child record; Unit.unitInfo.frame is the
// lookup value passed by Hud.setMsg().
const PORTRAIT_FRAME_RANGES = Object.freeze([
  [1, 1, 632], [2, 2, 633], [3, 3, 634], [4, 4, 635], [5, 5, 636], [6, 6, 637], [7, 50, 638],
  [51, 51, 639], [52, 52, 640], [53, 53, 641], [54, 54, 642], [55, 55, 643], [56, 56, 644], [57, 63, 645], [64, 64, 646], [65, 65, 647], [66, 66, 648], [67, 100, 649],
  [101, 101, 650], [102, 102, 651], [103, 103, 652], [104, 104, 653], [105, 105, 654], [106, 107, 655], [108, 150, 656],
  [151, 151, 657], [152, 152, 658], [153, 153, 659], [154, 154, 660], [155, 155, 661], [156, 156, 662], [157, 157, 663], [158, 158, 664], [159, 200, 665],
].map(([start, end, character]) => Object.freeze({ start, end, character })));

export const TUTORIAL_SPEAK_SOURCE_ASSETS = Object.freeze({
  chrome: Object.freeze(Object.fromEntries(CHROME_IDS.map((id) => [id, sourcePath(id)]))),
  portraits: Object.freeze(Object.fromEntries(PORTRAIT_IDS.map((id) => [id, sourcePath(id, 'head/')]))),
  fonts: Object.freeze({
    name: './public/assets/original-swf/tutorial-speak/font-1485.ttf',
    description: './public/assets/original-swf/tutorial-speak/font-800.ttf',
  }),
});

export function getTutorialSpeakPortraitSource(frame) {
  if (!Number.isInteger(frame) || frame < 1 || frame > 200) {
    throw new RangeError(`Tutorial Speak portrait frame is unavailable: ${frame}`);
  }
  const range = PORTRAIT_FRAME_RANGES.find((candidate) => frame >= candidate.start && frame <= candidate.end);
  if (!range) throw new Error(`Tutorial Speak portrait source is unavailable: ${frame}`);
  return Object.freeze({ character: range.character, source: TUTORIAL_SPEAK_SOURCE_ASSETS.portraits[range.character] });
}
