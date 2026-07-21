import test from 'node:test';
import assert from 'node:assert/strict';
import { drawRuntimeShape } from '../src/vector-shape-canvas.mjs';

test('draws serialized runtime fill contours on Canvas', () => {
  const calls = [];
  const ctx = { save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, closePath() {}, fill() { calls.push('fill'); }, set fillStyle(value) { calls.push(value); }, globalAlpha: 1 };
  drawRuntimeShape(ctx, { fills: [{ fill: { type: 'solid', color: '#ffff99' }, contours: [{ start: { x: 0, y: 0 }, closed: true, segments: [{ edge: 'straight', to: { x: 1, y: 1 } }] }] }] });
  assert.deepEqual(calls, ['#ffff99', 'fill']);
});
