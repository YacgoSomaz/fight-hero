import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractTutorialEnvironmentTimelines } from '../tools/extract-tutorial-environment-timeline.mjs';

// The door and elevator in Campaign 1 are original nested MovieClips.  Their
// frame labels and display lists must be read from the canonical SWF instead
// of recreating a substitute animation in JavaScript.
test('extracts the original Campaign 1 door and elevator timelines from the canonical SWF', () => {
  const source = readFileSync(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
  const timelines = extractTutorialEnvironmentTimelines(source);

  assert.deepEqual(Object.keys(timelines).map(Number).sort((left, right) => left - right), [1361, 1388]);
  assert.equal(timelines[1361].frameCount, 23);
  assert.deepEqual(timelines[1361].labels, { open: 2, close: 13 });
  assert.deepEqual(
    timelines[1361].frames.map(({ items }) => items.map(({ depth, character, clipDepth }) => [depth, character, clipDepth])),
    Array.from({ length: 23 }, () => [[1, 1359, 3], [2, 1360, null]]),
  );
  assert.equal(timelines[1361].frames[0].items[1].y, 64.1);
  assert.equal(timelines[1361].frames[11].items[1].y, -47.9);
  assert.equal(timelines[1361].frames[22].items[1].y, 64.1);

  assert.equal(timelines[1388].frameCount, 19);
  assert.deepEqual(timelines[1388].labels, {});
  assert.equal(timelines[1388].frames[0].items[0].character, 1387);
  assert.equal(timelines[1388].frames[0].items[0].depth, 1);
  assert.equal(timelines[1388].frames.at(-1).items[0].character, 1387);
});
