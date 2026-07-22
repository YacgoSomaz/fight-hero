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
    origin: { x: 145, y: 50 },
    impact: { x: 275, y: 50 },
    distance: 130,
    hit: { type: 'wall', color: '9900ff' },
    linePath: [{ x: 145, y: 50 }],
  });
});

test('Tutorial line bullet rejects an unresolved source scatter profile instead of inventing a recoil value', () => {
  assert.throws(() => traceTutorialLineBullet({
    gunId: 'USP2',
    shooter: { position: { x: 0, y: 0 }, aimRotation: 0, mcRotation: 0, armY: 0, scaleX: 1, dynRecoil: 3 },
    wall: { isSolid: () => false, colorAt: () => '' },
  }), /dynRecoilMod/);
});

test('Tutorial USP2 stops at the first original living unit hit box after checking wall pixels', () => {
  const shooter = {
    id: 'unit0', team: 1, position: { x: 100, y: 100 }, aimRotation: 90, mcRotation: 0, armY: -42, scaleX: 1, dynRecoil: 0, dynRecoilMod: 0,
  };
  const enemy = { id: 'unit1', team: 2, position: { x: 205, y: 80 }, scaleX: 1, crouching: false, dead: false, blurred: false };
  const trace = traceTutorialLineBullet({
    gunId: 'USP2', shooter,
    wall: { isSolid: () => false, colorAt: () => '' },
    units: [shooter, enemy],
    random: () => 0.5,
  });

  assert.deepEqual(trace.hit, { type: 'unit', target: enemy, extra: {} });
  assert.deepEqual(trace.impact, { x: 195, y: 50 });
});
