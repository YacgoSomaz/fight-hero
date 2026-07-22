import assert from 'node:assert/strict';
import test from 'node:test';
import { drawTutorialM4Gun } from '../src/tutorial-unit-gun-renderer.mjs';

test('Tutorial M4 gun renderer walks the original gun Sprite at its source gotoAndStop frame', () => {
  const calls = [];
  const runtime = { sprites: { 375: { frameCount: 20, frames: Array.from({ length: 20 }, (_, index) => ({ frame: index + 1, items: index === 19 ? [{ depth: 1, character: 900, x: 4, y: 5 }] : [] })) } }, shapes: { 900: { fills: [] } } };
  const context = { save() { calls.push('save'); }, restore() { calls.push('restore'); }, translate(x, y) { calls.push(['translate', x, y]); }, transform(...matrix) { calls.push(['transform', ...matrix]); } };
  drawTutorialM4Gun(context, { character: 375, frame: 20 }, runtime, (_ctx, shape) => calls.push(['shape', shape]));
  assert.deepEqual(calls, ['save', ['translate', 4, 5], ['transform', 1, 0, 0, 1, 0, 0], ['shape', runtime.shapes[900]], 'restore']);
});

test('Tutorial M4 gun renderer refuses a missing original gun sprite', () => {
  assert.throws(() => drawTutorialM4Gun({ save() {}, restore() {}, translate() {}, transform() {} }, { character: 375, frame: 20 }, { sprites: {}, shapes: {} }, () => {}), /original Tutorial M4 gun Sprite is unavailable/);
});
