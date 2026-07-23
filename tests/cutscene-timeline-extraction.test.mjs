import assert from 'node:assert/strict';
import test from 'node:test';
import { extractCutsceneTimeline } from '../tools/extract-cutscene-timeline.mjs';

// User journey: selecting Campaign 1 first enters the original pre-cutscene.
// The page needs the exact Cutscene 1890 display frames, not a browser-made
// title card, before it is allowed to start the Tutorial Game.
test('extracts the original Cutscene prelude frames used by Campaign 1', () => {
  const source = extractCutsceneTimeline();

  assert.equal(source.symbolId, 1890);
  assert.equal(source.frameCount, 46);
  assert.deepEqual(source.frames.slice(0, 3).map(({ frame, layers }) => ({
    frame,
    layers: layers.map(({ depth, character, name }) => ({ depth, character, ...(name ? { name } : {}) })),
  })), [
    { frame: 1, layers: [
      { depth: 1, character: 3 }, { depth: 2, character: 3 }, { depth: 3, character: 1571 }, { depth: 4, character: 1573 },
      { depth: 61, character: 1574 }, { depth: 63, character: 1575 }, { depth: 65, character: 1577, name: 'txt_title' },
      { depth: 110, character: 1579, name: 'but_prev' }, { depth: 111, character: 1580, name: 'but_next' },
    ] },
    { frame: 2, layers: [
      { depth: 1, character: 3 }, { depth: 2, character: 3 }, { depth: 3, character: 1581 }, { depth: 4, character: 1582 },
      { depth: 5, character: 1583 }, { depth: 6, character: 1586 }, { depth: 61, character: 1574 }, { depth: 63, character: 1587 },
      { depth: 65, character: 1577, name: 'txt_title' }, { depth: 110, character: 1579, name: 'but_prev' }, { depth: 111, character: 1580, name: 'but_next' },
    ] },
    { frame: 3, layers: [
      { depth: 1, character: 3 }, { depth: 2, character: 3 }, { depth: 3, character: 1581 }, { depth: 5, character: 1588 },
      { depth: 6, character: 1591 }, { depth: 8, character: 1593 }, { depth: 10, character: 1596 }, { depth: 61, character: 1574 },
      { depth: 63, character: 1597 }, { depth: 65, character: 1577, name: 'txt_title' }, { depth: 110, character: 1579, name: 'but_prev' },
      { depth: 111, character: 1580, name: 'but_next' },
    ] },
  ]);
});
