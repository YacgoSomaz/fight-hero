import test from 'node:test';
import assert from 'node:assert/strict';
import { getUnitRenderPlan } from '../src/unit-render-plan.mjs';

test('a living unit retains the original complete Medic sprite while optional timeline parts are ready', () => {
  assert.deepEqual(getUnitRenderPlan({ alive: true, hasTimeline: true, hasParts: true }), ['source-skin', 'timeline-rig']);
});

test('a living unit still has the original complete Medic sprite while timeline assets are loading', () => {
  assert.deepEqual(getUnitRenderPlan({ alive: true, hasTimeline: false, hasParts: false }), ['source-skin']);
});

test('a dead unit has no render layers', () => {
  assert.deepEqual(getUnitRenderPlan({ alive: false, hasTimeline: true, hasParts: true }), []);
});
