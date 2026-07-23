import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { extractTutorialSpeakTimeline } from '../tools/extract-tutorial-environment-timeline.mjs';

const SWF = new URL('../assets/reverse/4399-90433-25.swf', import.meta.url);
const RUNTIME = new URL('../public/assets/tutorial-speak-timeline-runtime.local.json', import.meta.url);

// Browser code must consume a checked-in direct projection of the canonical
// SWF.  It may not retype a handful of y offsets and silently lose the close
// frames or dynamic text children.
test('ships the exact original Speak_187 timeline for the Tutorial runtime', () => {
  assert.equal(existsSync(RUNTIME), true, 'Speak_187 runtime timeline is required');
  assert.deepEqual(
    JSON.parse(readFileSync(RUNTIME, 'utf8')),
    extractTutorialSpeakTimeline(readFileSync(SWF)),
  );
});
