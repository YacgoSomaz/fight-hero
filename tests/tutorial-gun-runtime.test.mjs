import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTutorialGunRuntime, createTutorialGunRuntime, tutorialPlayerMouseDown, tutorialPlayerMouseUp } from '../src/tutorial-gun-runtime.mjs';

test('Tutorial USP2 follows original Player.mDown, Guns.shootDelay uint, shotPressed, and noAmmo rules', () => {
  let state = createTutorialGunRuntime({ gunId: 'USP2', ammoMultiplier: 0.9, human: true });
  assert.deepEqual(state, {
    gunId: 'USP2', mDown: false, shotPressed: false, reloading: false, shootDelay: 0,
    ammo: { clipCur: 1, clipMax: 1, spareCur: 0, spareMax: 0, total: 1 },
  });

  state = tutorialPlayerMouseDown(state, { gameStarted: false, noShoot: false });
  assert.equal(state.mDown, false);
  state = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  let tick = advanceTutorialGunRuntime(state);
  assert.deepEqual({ fired: tick.fired, action: tick.action, state: tick.state }, {
    fired: true, action: 'fire', state: {
      gunId: 'USP2', mDown: true, shotPressed: true, reloading: false, shootDelay: 6,
      ammo: { clipCur: 1, clipMax: 1, spareCur: 0, spareMax: 0, total: 1 },
    },
  });

  state = tutorialPlayerMouseUp(tick.state);
  for (let frame = 0; frame < 6; frame += 1) {
    tick = advanceTutorialGunRuntime(state);
    state = tick.state;
    assert.equal(tick.fired, false);
  }
  assert.equal(state.shootDelay, 0);
  state = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  tick = advanceTutorialGunRuntime(state);
  assert.equal(tick.fired, true);
  assert.equal(tick.state.ammo.clipCur, 1);
});

test('Tutorial gun runtime does not start a source shot while Player or the active gun forbids shooting', () => {
  const state = createTutorialGunRuntime({ gunId: 'USP2', ammoMultiplier: 1, human: true });
  assert.equal(tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: true }).mDown, false);
  const held = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  const blocked = advanceTutorialGunRuntime({ ...held, gun: { ...held.gun, extra: { noShoot: true } } });
  assert.deepEqual({ fired: blocked.fired, state: blocked.state }, { fired: false, state: held });
});
