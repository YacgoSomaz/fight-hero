import assert from 'node:assert/strict';
import test from 'node:test';
import { getTutorialDownArrowRenderPlan } from '../src/tutorial-down-arrow-render-plan.mjs';

test('Tutorial DownArrow plan converts the original Arena twip matrix and plays the original 16-frame sprite', () => {
  const arrows = [
    { name: 'downarrow3', visible: false, matrix: { translateX: 20689, translateY: 13096, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 } },
    { name: 'downarrow10', visible: true, matrix: { translateX: 36667, translateY: 26507, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 } },
  ];

  const plan = getTutorialDownArrowRenderPlan(arrows, 16, { x: -100, y: -200 });

  assert.deepEqual(plan, [{
    name: 'downarrow10',
    frame: 1,
    x: 1733.35,
    y: 1125.35,
    matrix: { scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
  }]);
});

test('Tutorial DownArrow plan retains authored rotation and selects a later source frame without wrapping a hand-made animation', () => {
  const [arrow] = getTutorialDownArrowRenderPlan([{ name: 'downarrow8', visible: true, matrix: { translateX: 50621, translateY: 12171, scaleX: .70710754, scaleY: .70710754, rotateSkew0: -.7070923, rotateSkew1: .7070923 } }], 18, { x: 0, y: 0 });

  assert.deepEqual(arrow, {
    name: 'downarrow8',
    frame: 3,
    x: 2531.05,
    y: 608.55,
    matrix: { scaleX: .70710754, scaleY: .70710754, rotateSkew0: -.7070923, rotateSkew1: .7070923 },
  });
});
