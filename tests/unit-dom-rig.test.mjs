import test from 'node:test';
import assert from 'node:assert/strict';
import { getUnitDomRigFrame } from '../src/unit-dom-rig.mjs';

const frame = [
  ['arm1', 65.65, -96.5, 1, 1, 0, 0],
  ['foot2', .6, -11.2, .97, .97, -.0035, .0936],
  ['leglow2', 10.75, -16.6, .966, .966, -.081, .081],
  ['legup2', 3.85, -24.2, .955, .955, -.168, .168],
  ['foot1', -16.95, -12.2, .996, .982, .088, -.243],
  ['leglow1', -2.05, -13, .874, .874, .485, -.485],
  ['legup1', -3.85, -23.65, .926, .926, .377, -.377],
  ['body', 1, -34.25, 1.01, 1, -.039, .023],
  ['headhold', 1.9, -49.4, .973, .976, .215, -.231],
  ['arm1hold', .3, -42, 1, 1, 0, 0],
  ['head', 60.2, -104.25, .973, .976, .215, -.231],
  ['arm2', 59.35, -96.1, 1, 1, 0, 0],
];

test('a decoded UnitMC frame becomes original body-part placements, not a replacement walk cycle', () => {
  const parts = getUnitDomRigFrame({ frames: [frame], frameNumber: 1, aimAngle: 0, facing: 1, recoil: 0 });

  assert.deepEqual(parts.map(({ id, source }) => ({ id, source })), [
    { id: 'arm1', source: './public/assets/unit-parts/full/rifle_arm_rifle_idle.png' },
    { id: 'foot2', source: './public/assets/unit-parts/tight/foot.png' },
    { id: 'leglow2', source: './public/assets/unit-parts/tight/leg_lower.png' },
    { id: 'legup2', source: './public/assets/unit-parts/tight/leg_upper.png' },
    { id: 'foot1', source: './public/assets/unit-parts/tight/foot.png' },
    { id: 'leglow1', source: './public/assets/unit-parts/tight/leg_lower.png' },
    { id: 'legup1', source: './public/assets/unit-parts/tight/leg_upper.png' },
    { id: 'body', source: './public/assets/unit-parts/tight/body.png' },
    { id: 'head', source: './public/assets/unit-parts/tight/head.png' },
    { id: 'arm2', source: './public/assets/unit-parts/full/front_arm_rifle_idle.png' },
  ]);
  assert.deepEqual(parts.find(({ id }) => id === 'body').matrix, [1.01, -.039, .023, 1]);
  assert.deepEqual(parts.find(({ id }) => id === 'body').position, { x: 1, y: -34.25 });
  assert.deepEqual(parts.find(({ id }) => id === 'head').position, { x: 1.9, y: -49.4 });
});

test('aimed limbs remain on the decoded arm holder while the head uses its own original holder', () => {
  const parts = getUnitDomRigFrame({ frames: [frame], frameNumber: 1, aimAngle: Math.PI / 2, facing: 1, recoil: .5 });

  assert.deepEqual(parts.find(({ id }) => id === 'arm1').position, { x: .3, y: -42 });
  assert.deepEqual(parts.find(({ id }) => id === 'arm2').position, { x: .3, y: -42 });
  assert.deepEqual(parts.find(({ id }) => id === 'head').position, { x: 1.9, y: -49.4 });
  assert.deepEqual(parts.find(({ id }) => id === 'arm1').offset, { x: -9, y: -15 });
  assert.deepEqual(parts.find(({ id }) => id === 'head').matrix.map((value) => Number(value.toFixed(3))), [0.574, 0.789, -0.79, 0.576]);
});

test('an unavailable original timeline frame produces no invented body pose', () => {
  assert.deepEqual(getUnitDomRigFrame({ frames: [], frameNumber: 1 }), []);
  assert.deepEqual(getUnitDomRigFrame({ frames: [frame], frameNumber: 2 }), []);
});
