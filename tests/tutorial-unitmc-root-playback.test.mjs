import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractUnitMCRootFrameActions } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { advanceTutorialUnitRootFrame } from '../src/tutorial-unitmc-root-playback.mjs';

const unitMcSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/UnitMC.as', import.meta.url), 'utf8');

test('UnitMC frame scripts retain original root playback commands at authored end frames', () => {
  const actions = extractUnitMCRootFrameActions(unitMcSource);
  assert.deepEqual(
    [20, 208, 264, 290, 301].map((frame) => [frame, actions[frame]]),
    [
      [20, { type: 'goto', label: 'idle', force: true }],
      [208, { type: 'goto', label: 'fall', force: false }],
      [264, { type: 'play', label: 'fallloop' }],
      [290, { type: 'stop' }],
      [301, { type: 'goto', label: 'duckloop', force: true }],
    ],
  );
});

test('Tutorial root playback applies original loops, jump fall guard, direct fallloop play, and stop frame', () => {
  const actions = extractUnitMCRootFrameActions(unitMcSource);
  assert.deepEqual(advanceTutorialUnitRootFrame({ frame: 19, animation: 'idle', stopped: false }, actions), { frame: 1, animation: 'idle', stopped: false });
  assert.deepEqual(advanceTutorialUnitRootFrame({ frame: 207, animation: 'jump', stopped: false }, actions), { frame: 208, animation: 'jump', stopped: false });
  assert.deepEqual(advanceTutorialUnitRootFrame({ frame: 263, animation: 'fall', stopped: false }, actions), { frame: 230, animation: 'fall', stopped: false });
  assert.deepEqual(advanceTutorialUnitRootFrame({ frame: 289, animation: 'tuck', stopped: false }, actions), { frame: 290, animation: 'tuck', stopped: true });
  assert.deepEqual(advanceTutorialUnitRootFrame({ frame: 290, animation: 'tuck', stopped: true }, actions), { frame: 290, animation: 'tuck', stopped: true });
});
