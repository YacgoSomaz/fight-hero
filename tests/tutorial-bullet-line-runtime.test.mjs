import assert from 'node:assert/strict';
import test from 'node:test';
import { traceTutorialLineBullet } from '../src/tutorial-bullet-line-runtime.mjs';

test('Tutorial USP2 Bullet_Line_Basic preserves source muzzle offset, xOff half-steps, ten-pixel wall trace, and wall colour', () => {
  const randomValues = [0.5, 0.5, 0, 0.5];
  const trace = traceTutorialLineBullet({
    gunId: 'USP2',
    shooter: {
      position: { x: 100, y: 100 },
      aimRotation: 90,
      mcRotation: 0,
      armY: -42,
      scaleX: 1,
      dynRecoil: 3,
      dynRecoilMod: 3,
    },
    wall: {
      isSolid: (x) => x >= 267,
      colorAt: (x) => (x >= 267 ? '9900ff' : ''),
    },
    random: () => randomValues.shift() ?? 0.5,
  });

  assert.deepEqual(trace, {
    gunId: 'USP2',
    rotation: 90,
    origin: { x: 137, y: 58 },
    impact: { x: 267, y: 58 },
    distance: 130,
    hit: { type: 'wall', color: '9900ff' },
    linePath: [{ x: 137, y: 58 }],
  });
});

test('Tutorial line bullet rejects an unresolved source scatter profile instead of inventing a recoil value', () => {
  assert.throws(() => traceTutorialLineBullet({
    gunId: 'USP2',
    shooter: { position: { x: 0, y: 0 }, aimRotation: 0, mcRotation: 0, armY: 0, scaleX: 1, dynRecoil: 3 },
    wall: { isSolid: () => false, colorAt: () => '' },
  }), /dynRecoilMod/);
});
