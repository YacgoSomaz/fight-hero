import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTutorialLineBullet } from '../src/tutorial-bullet-line-renderer.mjs';

test('Tutorial Bullet_Line_Basic uses the original gun parameter triplets and alternating Flash line path', () => {
  const calls = [];
  const context = {
    beginPath: () => calls.push(['beginPath']),
    moveTo: (x, y) => calls.push(['moveTo', x, y]),
    lineTo: (x, y) => calls.push(['lineTo', x, y]),
    stroke: () => calls.push(['stroke']),
    set lineWidth(value) { calls.push(['lineWidth', value]); },
    set strokeStyle(value) { calls.push(['strokeStyle', value]); },
  };

  renderTutorialLineBullet(context, {
    gunId: 'USP2',
    linePath: [{ x: 100, y: 200 }],
    impact: { x: 130, y: 200 },
  }, (point) => ({ x: point.x - 80, y: point.y - 180 }));

  assert.deepEqual(calls, [
    ['lineWidth', 3.5], ['strokeStyle', 'rgba(255,255,196,0.3)'], ['beginPath'], ['moveTo', 20, 20], ['lineTo', 50, 20], ['stroke'],
    ['lineWidth', 1.5], ['strokeStyle', 'rgba(255,255,196,0.6)'], ['beginPath'], ['moveTo', 20, 20], ['lineTo', 50, 20], ['stroke'],
  ]);
});
