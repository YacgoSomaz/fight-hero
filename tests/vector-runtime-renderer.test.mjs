import test from 'node:test';
import assert from 'node:assert/strict';
import { drawVectorRuntimeFrame, drawVectorRuntimeSprite } from '../src/vector-runtime-renderer.mjs';

test('recursively draws source shapes through original display-list matrices', () => {
  const calls = [];
  const context = { save: () => calls.push('save'), restore: () => calls.push('restore'), translate: (x, y) => calls.push(['translate', x, y]), transform: (...matrix) => calls.push(['transform', ...matrix]) };
  const runtime = { sprites: { 1: { frameCount: 1, frames: [{ frame: 1, items: [{ depth: 1, character: 2, x: 3, y: 4, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 }] }] } }, shapes: { 2: { fills: [] } } };

  drawVectorRuntimeSprite(context, runtime, 1, 1, (ctx, shape) => calls.push(['shape', shape]));

  assert.deepEqual(calls, ['save', ['translate', 3, 4], ['transform', 1, 0, 0, 1, 0, 0], ['shape', runtime.shapes[2]], 'restore']);
});

test('draws an extracted action display-list frame directly', () => {
  const seen = [];
  const context = { save() {}, restore() {}, translate() {}, transform() {} };
  const runtime = { sprites: {}, shapes: { 2: { fills: [] } } };
  drawVectorRuntimeFrame(context, runtime, [{ depth: 1, character: 2, x: 1, y: 2 }], (ctx, shape) => seen.push(shape));
  assert.deepEqual(seen, [runtime.shapes[2]]);
});

test('uses an AS3 gotoAndStop binding for a named nested gun sprite', () => {
  const frames = [];
  const runtime = { sprites: { 1: { frameCount: 1, frames: [{ frame: 1, items: [{ depth: 1, character: 2, name: 'gun', x: 0, y: 0 }] }] }, 2: { frameCount: 3, frames: [{ frame: 1, items: [] }, { frame: 2, items: [] }, { frame: 3, items: [{ depth: 1, character: 3, x: 0, y: 0 }] }] } }, shapes: { 3: { fills: [] } } };
  const context = { save() {}, restore() {}, translate() {}, transform() {} };

  drawVectorRuntimeSprite(context, runtime, 1, 1, (ctx, shape) => frames.push(shape), { childFrames: { gun: 3 } });

  assert.deepEqual(frames, [runtime.shapes[3]]);
});
