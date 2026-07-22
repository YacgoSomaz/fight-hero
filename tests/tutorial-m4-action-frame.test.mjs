import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createTutorialUnitPoseAtAction, tutorialM4ActionFrame } from '../src/tutorial-m4-action-frame.mjs';

const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
const m4 = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));

test('Tutorial M4 action resolver selects the original discrete rifle, fire, and reload frames without interpolation', () => {
  assert.deepEqual(
    [
      ['rifle', 0, 77],
      ['rifle_fire', 0, 78],
      ['rifle_fire', 2, 80],
      ['rifle_reload', 0, 81],
      ['rifle_reload', 34, 115],
    ].map(([label, index, expectedFrame]) => ({ label, index, expectedFrame, frame: tutorialM4ActionFrame(m4, label, index).frame })),
    [
      { label: 'rifle', index: 0, expectedFrame: 77, frame: 77 },
      { label: 'rifle_fire', index: 0, expectedFrame: 78, frame: 78 },
      { label: 'rifle_fire', index: 2, expectedFrame: 80, frame: 80 },
      { label: 'rifle_reload', index: 0, expectedFrame: 81, frame: 81 },
      { label: 'rifle_reload', index: 34, expectedFrame: 115, frame: 115 },
    ],
  );
});

test('Tutorial M4 action resolver passes the exact original nested arm lists into the pose plan', () => {
  const action = tutorialM4ActionFrame(m4, 'rifle_fire', 1);
  const pose = createTutorialUnitPoseAtAction({ rootFrame: timeline.frames[0], runtime: m4, actionLabel: 'rifle_fire', actionIndex: 1, skinFrame: 57 });
  assert.equal(action.frame, 79);
  assert.deepEqual(
    pose.gunParts.map(({ rootId, character, frame, local }) => ({ rootId, character, frame, local })),
    action.rearAction.filter(({ name }) => name === 'gun').map(({ character, x, y, scaleX, scaleY, rotateSkew0, rotateSkew1 }) => ({
      rootId: 'arm1', character, frame: 20, local: { x, y, scaleX, scaleY, skewX: rotateSkew0, skewY: rotateSkew1 },
    })),
  );
});

test('Tutorial M4 action resolver rejects a label or index outside the original action timeline', () => {
  assert.throws(() => tutorialM4ActionFrame(m4, 'rifle_fire', 3), /outside original rifle_fire timeline/);
  assert.throws(() => tutorialM4ActionFrame(m4, 'invented', 0), /original M4 action is unavailable/);
});
