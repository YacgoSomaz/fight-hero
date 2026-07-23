import assert from 'node:assert/strict';
import test from 'node:test';
import { drawTutorialEnvironment } from '../src/tutorial-environment-renderer.mjs';

function canvasSpy() {
  const calls = [];
  return {
    calls,
    save() { calls.push(['save']); },
    restore() { calls.push(['restore']); },
    translate(x, y) { calls.push(['translate', x, y]); },
    transform(a, b, c, d, e, f) { calls.push(['transform', a, b, c, d, e, f]); },
    clearRect(x, y, width, height) { calls.push(['clearRect', x, y, width, height]); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
    set globalCompositeOperation(value) { calls.push(['composite', value]); },
  };
}

test('draws the original door panel through its original mask and draws the original elevator shape', () => {
  const context = canvasSpy();
  const bufferContext = canvasSpy();
  const buffer = { width: 0, height: 0, getContext: () => bufferContext };
  const assets = { doorMask: { name: '1359' }, doorPanel: { name: '1360' }, elevator: { name: '1387' } };
  const plan = {
    door: {
      outer: { x: 10, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
      mask: { x: -2.7, y: -3.75, width: 85.7, height: 132.95 },
      panel: { x: 41.25, y: 64.1, width: 82.5, height: 129.75, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
    },
    elevator: {
      outer: { x: 30, y: 40, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
      child: { x: 45, y: 76.2, width: 60, height: 140.45, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
    },
  };

  drawTutorialEnvironment(context, plan, assets, { createCanvas: () => buffer });

  assert.deepEqual(bufferContext.calls.slice(0, 4), [
    ['clearRect', 0, 0, 86, 133],
    ['drawImage', assets.doorPanel, 2.7, 1.35, 82.5, 129.75],
    ['composite', 'destination-in'],
    ['drawImage', assets.doorMask, 0, 0, 85.7, 132.95],
  ]);
  assert.ok(context.calls.some((call) => call[0] === 'drawImage' && call[1] === buffer));
  assert.ok(context.calls.some((call) => call[0] === 'drawImage' && call[1] === assets.elevator && call[2] === -30 && call[3] === -70.2));
});
