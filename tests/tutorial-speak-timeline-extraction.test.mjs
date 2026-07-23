import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { extractTutorialSpeakTimeline } from '../tools/extract-tutorial-environment-timeline.mjs';

const SOURCE = new URL('../assets/reverse/4399-90433-25.swf', import.meta.url);

// User journey: Campaign 1 messages must play the real Speak_187 MovieClip,
// not a browser dialogue card.  The new SWF says symbol 1488 has 16 source
// frames; its background/mask, portrait child and dynamic name/description
// anchors have to remain observable before any renderer consumes them.
test('extracts original Speak_187 timeline, labels and dynamic child anchors', () => {
  const speak = extractTutorialSpeakTimeline(readFileSync(SOURCE));

  assert.deepEqual({
    symbolId: speak.symbolId,
    frameCount: speak.frameCount,
    labels: speak.labels,
    first: speak.frames[0].items.map(({ depth, character, name, clipDepth }) => ({ depth, character, name, clipDepth })),
    last: speak.frames.at(-1).items.map(({ depth, character, name }) => ({ depth, character, name })),
  }, {
    symbolId: 1488,
    frameCount: 33,
    labels: { open: 2, close: 17 },
    first: [
      { depth: 1, character: 1482, name: null, clipDepth: null },
      { depth: 2, character: 1483, name: null, clipDepth: 5 },
      { depth: 3, character: 666, name: 'head', clipDepth: null },
      { depth: 6, character: 1484, name: null, clipDepth: null },
      { depth: 7, character: 1486, name: 'txt_name', clipDepth: null },
      { depth: 8, character: 1487, name: 'txt_desc', clipDepth: null },
    ],
    last: [
      { depth: 1, character: 1482, name: null },
      { depth: 2, character: 1483, name: null },
      { depth: 3, character: 666, name: 'head' },
      { depth: 6, character: 1484, name: null },
      { depth: 7, character: 1486, name: 'txt_name' },
      { depth: 8, character: 1487, name: 'txt_desc' },
    ],
  });
});
