import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractTutorialEnvironmentTimelines } from '../tools/extract-tutorial-environment-timeline.mjs';

// The browser cannot execute the SWF parser at runtime, so its local runtime
// record must be a byte-for-byte JSON projection of the canonical timelines.
test('ships the canonical Tutorial environment timeline projection to the browser', () => {
  const source = readFileSync(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
  const expected = extractTutorialEnvironmentTimelines(source);
  const actual = JSON.parse(readFileSync(new URL('../public/assets/tutorial-environment-timeline-runtime.local.json', import.meta.url), 'utf8'));
  assert.deepEqual(actual, expected);
});
