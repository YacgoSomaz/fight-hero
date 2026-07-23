import test from 'node:test';
import assert from 'node:assert/strict';
import { getSourceMissionLaunch } from '../src/source-mission-launch.mjs';
import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS, createMatchSelection } from '../src/menu-state.mjs';

// User journey: selecting Under Siege in the original Campaign list opens
// its dedicated source Tutorial runtime, rather than disguising it as a
// quick-match launch or leaving the visible source button inert.
test('Campaign 1 has the audited source Tutorial launch while every other mission remains unavailable', () => {
  assert.deepEqual(getSourceMissionLaunch(createMatchSelection(CAMPAIGN_MISSIONS[0])), {
    kind: 'campaign-one-tutorial',
    href: './tutorial-scene-preview.html?source=campaign-1',
    message: '第 1 关已接入原 Tutorial 场景承载。',
  });
  assert.equal(getSourceMissionLaunch(createMatchSelection(CAMPAIGN_MISSIONS[1])), null);
  assert.equal(getSourceMissionLaunch(createMatchSelection(CHALLENGE_MISSIONS[0])), null);
  assert.equal(getSourceMissionLaunch(createMatchSelection()), null);
});
