import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractArmGunCallbacks } from '../private-assets/parse-arm-gun-callbacks.mjs';
import { actionScriptUint, tutorialM4ActionTick } from '../src/tutorial-m4-action-playback.mjs';

const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/MBFZ_fla/arm_gun_316.as', import.meta.url), 'utf8');
const m4 = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));

test('the original arm-gun script supplies M4 fire and reload callbacks at its exact timeline frames', () => {
  const callbacks = extractArmGunCallbacks(source);
  assert.deepEqual(
    [80, 81, 115].map((frame) => [frame, callbacks[frame]]),
    [[80, 'doneShoot'], [81, 'reloadSound'], [115, 'doneReload']],
  );
});

test('Tutorial M4 playback preserves the original discrete arm frame and its source callback', () => {
  const callbacks = extractArmGunCallbacks(source);
  assert.deepEqual(
    [
      tutorialM4ActionTick(m4, callbacks, 'rifle_fire', 0),
      tutorialM4ActionTick(m4, callbacks, 'rifle_fire', 2),
      tutorialM4ActionTick(m4, callbacks, 'rifle_reload', 0),
      tutorialM4ActionTick(m4, callbacks, 'rifle_reload', 34),
    ].map(({ label, index, frame, callback }) => ({ label, index, frame, callback })),
    [
      { label: 'rifle_fire', index: 0, frame: 78, callback: null },
      { label: 'rifle_fire', index: 2, frame: 80, callback: 'doneShoot' },
      { label: 'rifle_reload', index: 0, frame: 81, callback: 'reloadSound' },
      { label: 'rifle_reload', index: 34, frame: 115, callback: 'doneReload' },
    ],
  );
});

test('M4 shoot delay uses ActionScript uint conversion at the original 30fps assignment boundary', () => {
  assert.equal(actionScriptUint(0.15 * 30), 4);
  assert.equal(actionScriptUint(0), 0);
});
