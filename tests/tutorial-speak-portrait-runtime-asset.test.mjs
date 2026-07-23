import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { extractTutorialSpeakPortraitTimeline } from '../tools/extract-tutorial-environment-timeline.mjs';

const SWF = new URL('../assets/reverse/4399-90433-25.swf', import.meta.url);
const RUNTIME = new URL('../public/assets/tutorial-speak-portrait-timeline-runtime.local.json', import.meta.url);

test('ships the exact original Speak head timeline for browser portrait selection', () => {
  assert.equal(existsSync(RUNTIME), true, 'Speak portrait runtime timeline is required');
  assert.deepEqual(
    JSON.parse(readFileSync(RUNTIME, 'utf8')),
    extractTutorialSpeakPortraitTimeline(readFileSync(SWF)),
  );
});
