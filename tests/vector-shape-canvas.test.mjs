import test from 'node:test';
import assert from 'node:assert/strict';
import { drawRuntimeShape } from '../src/vector-shape-canvas.mjs';

test('draws serialized runtime fill contours on Canvas', () => {
  const calls = [];
  const ctx = { save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, closePath() {}, fill() { calls.push('fill'); }, set fillStyle(value) { calls.push(value); }, globalAlpha: 1 };
  drawRuntimeShape(ctx, { fills: [{ fill: { type: 'solid', color: '#ffff99' }, contours: [{ start: { x: 0, y: 0 }, closed: true, segments: [{ edge: 'straight', to: { x: 1, y: 1 } }] }] }] });
  assert.deepEqual(calls, ['#ffff99', 'fill']);
});

test('draws an extracted source line with its authored width and alpha', () => {
  const calls = [];
  const ctx = {
    globalAlpha: 1,
    save() { calls.push('save'); }, restore() { calls.push('restore'); }, beginPath() { calls.push('beginPath'); },
    moveTo(x, y) { calls.push(['moveTo', x, y]); }, lineTo(x, y) { calls.push(['lineTo', x, y]); },
    quadraticCurveTo() {}, closePath() { calls.push('closePath'); }, stroke() { calls.push('stroke'); },
    set strokeStyle(value) { calls.push(['strokeStyle', value]); }, set lineWidth(value) { calls.push(['lineWidth', value]); },
  };

  drawRuntimeShape(ctx, { fills: [], lines: [{ line: { color: '#00ff00', opacity: .8, width: 1 }, contours: [{ start: { x: 0, y: 0 }, closed: true, segments: [{ edge: 'straight', to: { x: 1, y: 1 } }] }] }] });

  assert.deepEqual(calls, ['save', ['strokeStyle', '#00ff00'], ['lineWidth', 1], 'beginPath', ['moveTo', 0, 0], ['lineTo', 1, 1], 'closePath', 'stroke', 'restore']);
  assert.equal(ctx.globalAlpha, 1);
});
