import test from 'node:test';
import assert from 'node:assert/strict';
import { hitTestTutorialBullet } from '../src/tutorial-bullet-hit-test.mjs';

const wall = {
  isSolid: (x) => x === 10,
  colorAt: () => '9900ff',
};
const shooter = { id: 'unit0', position: { x: 70, y: 100 }, team: 1 };
const standingEnemy = { id: 'unit1', position: { x: 100, y: 100 }, team: 2, scaleX: 1, crouching: false, dead: false, blurred: false };

test('Tutorial Bullet.hitTestAll resolves opaque original wall before a unit in the same source point', () => {
  assert.deepEqual(hitTestTutorialBullet({ point: { x: 10, y: 90 }, shooter, wall, units: [shooter, standingEnemy] }), {
    type: 'wall', color: '9900ff', extra: {}, target: null,
  });
});

test('Tutorial Bullet.hitTestAll distinguishes standing body and head boxes, carrying original head/assassin flags', () => {
  assert.deepEqual(hitTestTutorialBullet({ point: { x: 100, y: 70 }, shooter, wall: { isSolid: () => false, colorAt: () => '' }, units: [shooter, standingEnemy] }), {
    type: 'unit', color: null, target: standingEnemy, extra: {},
  });
  assert.deepEqual(hitTestTutorialBullet({ point: { x: 100, y: 50 }, shooter, wall: { isSolid: () => false, colorAt: () => '' }, units: [shooter, standingEnemy] }), {
    type: 'unit', color: null, target: standingEnemy, extra: { assassin: 1.5, headMult: 1.5 },
  });
});

test('Tutorial Bullet.hitTestAll skips same teams, dead or blurred units, then tests corpses at source radius thirty', () => {
  const corpse = { id: 'corpse0', position: { x: 124, y: 100 } };
  const skipped = [
    { ...standingEnemy, id: 'ally', team: 1 },
    { ...standingEnemy, id: 'dead', dead: true },
    { ...standingEnemy, id: 'blurred', blurred: true },
  ];
  assert.deepEqual(hitTestTutorialBullet({ point: { x: 100, y: 70 }, shooter, wall: { isSolid: () => false, colorAt: () => '' }, units: [shooter, ...skipped], corpses: [corpse] }), {
    type: 'corpse', color: null, target: corpse, extra: {},
  });
});
