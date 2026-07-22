import assert from 'node:assert/strict';
import test from 'node:test';
import { transitionTutorialUnitMC } from '../src/tutorial-unitmc-transition.mjs';

test('Tutorial UnitMC preserves original uninterruptible climb, landing, and jump-to-fall guards', () => {
  assert.deepEqual(transitionTutorialUnitMC({ current: 'climbsmall', requested: 'idle', runType: 1 }), { changed: false, animation: 'climbsmall' });
  assert.deepEqual(transitionTutorialUnitMC({ current: 'landhard', requested: 'run1', runType: 1 }), { changed: false, animation: 'landhard' });
  assert.deepEqual(transitionTutorialUnitMC({ current: 'jump', requested: 'fall', runType: 1 }), { changed: false, animation: 'jump' });
});

test('Tutorial UnitMC applies original duck/getup/slide transition rewrites instead of replacing poses', () => {
  assert.deepEqual(transitionTutorialUnitMC({ current: 'duck', requested: 'idle', runType: 1 }), { changed: true, animation: 'getup' });
  assert.deepEqual(transitionTutorialUnitMC({ current: 'run1', requested: 'duckrun', runType: 1 }), { changed: true, animation: 'slide' });
  assert.deepEqual(transitionTutorialUnitMC({ current: 'duckrunback', requested: 'runback1', runType: 1 }), { changed: true, animation: 'getup' });
});

test('forced UnitMC transition follows the source force flag and bypasses normal guard rewrites', () => {
  assert.deepEqual(transitionTutorialUnitMC({ current: 'climbbig', requested: 'idle', runType: 2, force: true }), { changed: true, animation: 'idle' });
});
