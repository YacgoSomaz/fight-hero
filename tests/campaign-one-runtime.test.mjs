import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCampaignOneBulletEnvironmentHit, applyCampaignOneGunSwap, applyCampaignOneScore, applyCampaignOneSurfaceContact, createCampaignOneRuntime, runCampaignOneFrame } from '../src/campaign-one-runtime.mjs';

// User journey: when the original tutorial opens, its script starts at sn=1,
// fc=0 and immediately removes the authored starting guns before later frame
// events.  A runtime must preserve that original pre-increment timing.
test('Campaign 1 runs source frame-zero and frame-20 events at original fc values', () => {
  const runtime = createCampaignOneRuntime();

  assert.deepEqual(runCampaignOneFrame(runtime), [{ type: 'setGuns', target: 'player', primary: 'none', secondary: 'none' }]);
  assert.deepEqual(runtime, { state: 1, frame: 1 });

  for (let index = 0; index < 19; index += 1) assert.deepEqual(runCampaignOneFrame(runtime), []);
  assert.deepEqual(runtime, { state: 1, frame: 20 });
  assert.deepEqual(runCampaignOneFrame(runtime), [{
    type: 'message', target: 'player', text: "They're here! I have to escape!", seconds: 4, force: true, voice: 'V_Ca1_1',
  }]);
  assert.deepEqual(runtime, { state: 1, frame: 21 });
});

// User journey: at the authored score thresholds near the end of Tutorial,
// dialogue advances sn but does not reset Stats_Campaign.fc.
test('Campaign 1 score transitions advance only at their source state and score', () => {
  const runtime = createCampaignOneRuntime({ state: 14, frame: 360 });

  assert.deepEqual(applyCampaignOneScore(runtime, 5), []);
  assert.deepEqual(runtime, { state: 14, frame: 360 });
  assert.deepEqual(applyCampaignOneScore(runtime, 6), [{
    type: 'message', target: 'unit4', text: 'Hehehah, take some of this!', seconds: 5, force: true, voice: 'V_Ca1_15',
  }]);
  assert.deepEqual(runtime, { state: 15, frame: 360 });
});

// User journey: the tutorial's coloured floor marker only advances a human
// actor.  Its state-eight contact unlocks the original USP2, points to the
// current down-arrow and then changes the Arena wall to state nine.
test('Campaign 1 applies the source human foot-contact transition', () => {
  const runtime = createCampaignOneRuntime({ state: 8, frame: 46 });

  assert.deepEqual(applyCampaignOneSurfaceContact(runtime, { surface: 'ff00ff', human: false }), []);
  assert.deepEqual(runtime, { state: 8, frame: 46 });
  assert.deepEqual(applyCampaignOneSurfaceContact(runtime, { surface: 'ff00ff', human: true }), [
    { type: 'hudFrame', frameLabel: 'tutshoot' },
    { type: 'message', target: 'player', text: "Oh, a pistol... I'm a little rusty.", seconds: 4, force: true, voice: 'V_Ca1_6' },
    { type: 'setGuns', target: 'player', primary: 'USP2', secondary: 'none' },
    { type: 'setNoAim', target: 'player', value: false },
    { type: 'showDownArrows', state: 8 },
    { type: 'changeWallFrame', frameLabel: 9 },
  ]);
  assert.deepEqual(runtime, { state: 9, frame: 0 });
});

test('Campaign 1 preserves the source injury and recovery effects on contact transitions', () => {
  const injured = createCampaignOneRuntime({ state: 10, frame: 4 });
  const recovered = createCampaignOneRuntime({ state: 11, frame: 7 });

  assert.deepEqual(applyCampaignOneSurfaceContact(injured, { surface: 'ff00ff', human: true }), [
    { type: 'hudFrame', frameLabel: 'tutclimb' },
    { type: 'message', target: 'player', text: "Ahhh, my legs! I... I can't jump...", seconds: 5, force: true, voice: 'V_Ca1_8' },
    { type: 'healToMax', target: 'player', show: false, force: true },
    { type: 'damageCurrentHealthFraction', target: 'player', fraction: 0.8, source: 'env', extra: {}, force: true },
    { type: 'setNoJump', target: 'player', value: true },
    { type: 'playSound', sound: 'S_Mine1' },
    { type: 'playSound', sound: 'S_Pan' },
    { type: 'showDownArrows', state: 10 },
    { type: 'changeWallFrame', frameLabel: 11 },
  ]);
  assert.deepEqual(applyCampaignOneSurfaceContact(recovered, { surface: 'ff00ff', human: true }), [
    { type: 'playSound', sound: 'S_Equip' },
    { type: 'message', target: 'player', text: 'Nice, some more ammo and a new weapon.', seconds: 5, force: true, voice: 'V_Ca1_9' },
    { type: 'setGuns', target: 'player', primary: 'M4', secondary: 'USP' },
    { type: 'swapGuns', target: 'player' },
    { type: 'hudFrame', frameLabel: 'tutswitch' },
    { type: 'setNoJump', target: 'player', value: false },
    { type: 'showDownArrows', state: 11 },
    { type: 'changeWallFrame', frameLabel: 12 },
  ]);
  assert.deepEqual({ injured, recovered }, { injured: { state: 11, frame: 0 }, recovered: { state: 12, frame: 0 } });
});

// User journey: pressing the original swap-guns control at sn=12 opens the
// authored door only after it has pointed to the matching down-arrow.
test('Campaign 1 applies the source gun-swap transition at state twelve only', () => {
  const runtime = createCampaignOneRuntime({ state: 12, frame: 10 });

  assert.deepEqual(applyCampaignOneGunSwap(runtime), [
    { type: 'hudFrame', frameLabel: 'idle' },
    { type: 'showDownArrows', state: 12 },
    { type: 'changeWallFrame', frameLabel: 13 },
    { type: 'doorFrame', frameLabel: 'open' },
  ]);
  assert.deepEqual(runtime, { state: 13, frame: 10 });
});

// User journey: firing into the authored 9900ff environment marker at sn=9
// removes the pistol ammunition, changes the wall first, then starts the
// elevator and hides all tutorial arrows.
test('Campaign 1 applies the source bullet/environment elevator transition', () => {
  const runtime = createCampaignOneRuntime({ state: 9, frame: 23 });

  assert.deepEqual(applyCampaignOneBulletEnvironmentHit(runtime, 'ff0000'), []);
  assert.deepEqual(runtime, { state: 9, frame: 23 });
  assert.deepEqual(applyCampaignOneBulletEnvironmentHit(runtime, '9900ff'), [
    { type: 'hudFrame', frameLabel: 'idle' },
    { type: 'message', target: 'player', text: "It looks like the elevator's out.. I'll have to jump.", seconds: 5, force: true, voice: 'V_Ca1_7' },
    { type: 'setAmmo', target: 'player', clip: 0, spare: 0 },
    { type: 'changeWallFrame', frameLabel: 10 },
    { type: 'elevatorFrame', frameLabel: 'play' },
    { type: 'hideDownArrows' },
  ]);
  assert.deepEqual(runtime, { state: 10, frame: 23 });
});
