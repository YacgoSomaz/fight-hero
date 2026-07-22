import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTutorialAiGunRuntime, advanceTutorialGunRuntime, createTutorialGunRuntime, tutorialPlayerMouseDown, tutorialPlayerMouseUp } from '../src/tutorial-gun-runtime.mjs';

const standingMedic = Object.freeze({ aim: 0.7000000000000001, crouching: false, jumping: false, xVelocity: 0, reflecting: false });

test('Tutorial USP2 follows original Player.mDown, Guns.shootDelay uint, shotPressed, and noAmmo rules', () => {
  let state = createTutorialGunRuntime({ gunId: 'USP2', ammoMultiplier: 0.9, human: true });
  assert.deepEqual(state, {
    gunId: 'USP2', mDown: false, shotPressed: false, reloading: false, shootDelay: 0, dynRecoil: 3, dynRecoilMod: 0,
    ammo: { clipCur: 1, clipMax: 1, spareCur: 0, spareMax: 0, total: 1 },
  });

  state = tutorialPlayerMouseDown(state, { gameStarted: false, noShoot: false });
  assert.equal(state.mDown, false);
  state = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  let tick = advanceTutorialGunRuntime(state, { unit: standingMedic });
  assert.deepEqual({ fired: tick.fired, action: tick.action, state: tick.state }, {
    fired: true, action: 'fire', state: {
      gunId: 'USP2', mDown: true, shotPressed: true, reloading: false, shootDelay: 6, dynRecoil: 3.25, dynRecoilMod: 4.225,
      ammo: { clipCur: 1, clipMax: 1, spareCur: 0, spareMax: 0, total: 1 },
    },
  });

  state = tutorialPlayerMouseUp(tick.state);
  for (let frame = 0; frame < 6; frame += 1) {
    tick = advanceTutorialGunRuntime(state, { unit: standingMedic });
    state = tick.state;
    assert.equal(tick.fired, false);
  }
  assert.equal(state.shootDelay, 0);
  state = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  tick = advanceTutorialGunRuntime(state, { unit: standingMedic });
  assert.equal(tick.fired, true);
  assert.equal(tick.state.ammo.clipCur, 1);
});

// User journey: when AI.as has passed its source probability gate, it calls
// Guns.shoot() directly.  The bot must not inherit Player.mDown/shotPressed,
// but its same-source-frame Guns.EnterFrame still decrements the uint delay
// and refreshes scatter after makeBullet captured the previous modifier.
test('Tutorial AI gun fires the original Beretta without Player input gates', () => {
  let state = createTutorialGunRuntime({ gunId: 'Beretta' });
  const standingTank = { aim: 0.55, crouching: false, jumping: false, xVelocity: 0, reflecting: false };

  let tick = advanceTutorialAiGunRuntime(state, { shouldShoot: true, unit: standingTank });

  assert.deepEqual({ fired: tick.fired, action: tick.action, bullet: tick.bullet, state: tick.state }, {
    fired: true,
    action: 'fire',
    bullet: { gunId: 'Beretta', dynRecoil: 3, dynRecoilMod: 0 },
    state: {
      gunId: 'Beretta', mDown: false, shotPressed: false, reloading: false, shootDelay: 6, dynRecoil: 3, dynRecoilMod: 4.35,
      ammo: { clipCur: 11, clipMax: 12, spareCur: 60, spareMax: 60, total: 72 },
    },
  });

  state = tick.state;
  tick = advanceTutorialAiGunRuntime(state, { shouldShoot: true, unit: standingTank });
  assert.equal(tick.fired, false);
  assert.equal(tick.state.shootDelay, 5);
});

test('Tutorial gun runtime does not start a source shot while Player or the active gun forbids shooting', () => {
  const state = createTutorialGunRuntime({ gunId: 'none', ammoMultiplier: 1, human: true });
  assert.equal(tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: true }).mDown, false);
  const held = tutorialPlayerMouseDown(state, { gameStarted: true, noShoot: false });
  const blocked = advanceTutorialGunRuntime(held, { unit: standingMedic });
  assert.equal(blocked.fired, false);
});

test('Tutorial USP2 preserves source Guns.EnterFrame scatter modifiers and the pre-shot makeBullet recoil snapshot', () => {
  let state = createTutorialGunRuntime({ gunId: 'USP2', ammoMultiplier: 0.9 });
  let tick = advanceTutorialGunRuntime(state, {
    human: true,
    unit: { aim: 0.7000000000000001, crouching: true, jumping: false, xVelocity: 0, reflecting: false },
  });
  assert.equal(tick.state.dynRecoilMod, 2.3399999999999994);

  state = tutorialPlayerMouseDown(tick.state, { gameStarted: true, noShoot: false });
  tick = advanceTutorialGunRuntime(state, {
    human: true,
    unit: { aim: 0.7000000000000001, crouching: false, jumping: false, xVelocity: 0, reflecting: false },
  });
  assert.deepEqual(tick.bullet, { gunId: 'USP2', dynRecoil: 3, dynRecoilMod: 2.3399999999999994 });
  assert.equal(tick.state.dynRecoil, 3.25);
  assert.equal(tick.state.dynRecoilMod, 4.225);
});
