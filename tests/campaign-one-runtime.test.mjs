import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCampaignOneScore, createCampaignOneRuntime, runCampaignOneFrame } from '../src/campaign-one-runtime.mjs';

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
