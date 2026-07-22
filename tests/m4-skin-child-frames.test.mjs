import assert from 'node:assert/strict';
import test from 'node:test';
import { m4SkinChildFrames } from '../src/m4-skin-child-frames.mjs';

test('M4 arm action Display Lists preserve the gun frame while injecting the actor skin into every limb child', () => {
  assert.deepEqual(m4SkinChildFrames(57), {
    gun: 20,
    arm2up: 57,
    arm2low: 57,
    hand2: 57,
    arm1up: 57,
    arm1low: 57,
    hand1: 57,
  });
  assert.throws(() => m4SkinChildFrames(202), /outside the original UnitMC skin child range/);
});
