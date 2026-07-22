import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { tutorialGunActionFrame } from '../src/tutorial-gun-action-frame.mjs';
import { createTutorialUnitPoseAtGunAction } from '../src/tutorial-gun-action-frame.mjs';

const runtime = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));

test('Tutorial USP2 reuses the original pistol arm display-list spans and exact USP child frame', () => {
  assert.deepEqual(
    [
      ['idle', 0, 2],
      ['fire', 0, 3],
      ['fire', 5, 8],
      ['reload', 0, 9],
      ['reload', 28, 37],
    ].map(([command, index, expectedArmFrame]) => {
      const frame = tutorialGunActionFrame(runtime, 'USP2', command, index);
      return {
        command,
        index,
        expectedArmFrame,
        armFrame: frame.frame,
        gunFrame: frame.gunFrame,
        gunShape: runtime.sprites[375].frames[frame.gunFrame - 1].items[0].character,
      };
    }),
    [
      { command: 'idle', index: 0, expectedArmFrame: 2, armFrame: 2, gunFrame: 2, gunShape: 299 },
      { command: 'fire', index: 0, expectedArmFrame: 3, armFrame: 3, gunFrame: 2, gunShape: 299 },
      { command: 'fire', index: 5, expectedArmFrame: 8, armFrame: 8, gunFrame: 2, gunShape: 299 },
      { command: 'reload', index: 0, expectedArmFrame: 9, armFrame: 9, gunFrame: 2, gunShape: 299 },
      { command: 'reload', index: 28, expectedArmFrame: 37, armFrame: 37, gunFrame: 2, gunShape: 299 },
    ],
  );
});

test('Tutorial USP2 cannot interpolate or move past its original pistol arm labels', () => {
  assert.throws(() => tutorialGunActionFrame(runtime, 'USP2', 'fire', 6), /outside original pistol_fire timeline/);
  assert.throws(() => tutorialGunActionFrame(runtime, 'USP2', 'invented', 0), /original USP2 command is unavailable/);
});

test('Tutorial USP2 pose passes its original pistol arm lists and USP Sprite frame into the composed UnitMC pose', () => {
  const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
  const pose = createTutorialUnitPoseAtGunAction({
    rootFrame: timeline.frames[0],
    runtime,
    gunId: 'USP2',
    command: 'fire',
    actionIndex: 0,
    skinFrame: 57,
  });
  assert.deepEqual(
    pose.gunParts.map(({ rootId, character, frame }) => ({ rootId, character, frame })),
    [{ rootId: 'arm1', character: 375, frame: 2 }],
  );
});
