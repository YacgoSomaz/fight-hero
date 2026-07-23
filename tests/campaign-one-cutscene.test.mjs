import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceCampaignOnePreCutscene, createCampaignOnePreCutscene } from '../src/campaign-one-cutscene.mjs';

// Cutscene.as receives its type and frame list from the selected MatchSettings
// record.  Campaign 1 must therefore begin at its original prelude frame 1,
// pass through 2 and 3, and only then request Game -- it must not bypass this
// source-owned step and load Tutorial directly from the menu.
test('Campaign 1 follows its original pre-Cutscene pages before starting Tutorial', () => {
  let state = createCampaignOnePreCutscene();
  assert.deepEqual(state, {
    type: 'pre', title: 'Under Siege', frames: [1, 2, 3], index: 0,
    sourceFrame: 1, previous: { visible: false, text: '' }, next: { visible: true, text: 'Next' },
  });

  state = advanceCampaignOnePreCutscene(state, 'next');
  assert.deepEqual({ index: state.index, sourceFrame: state.sourceFrame, previous: state.previous, next: state.next }, {
    index: 1, sourceFrame: 2, previous: { visible: true, text: 'Previous' }, next: { visible: true, text: 'Next' },
  });
  state = advanceCampaignOnePreCutscene(state, 'next');
  assert.deepEqual({ index: state.index, sourceFrame: state.sourceFrame, previous: state.previous, next: state.next }, {
    index: 2, sourceFrame: 3, previous: { visible: true, text: 'Previous' }, next: { visible: true, text: 'Start Game' },
  });
  assert.deepEqual(advanceCampaignOnePreCutscene(state, 'next'), { kind: 'startGame' });
});

test('Campaign 1 rejects non-source Cutscene controls and cannot page past its source bounds', () => {
  const start = createCampaignOnePreCutscene();
  assert.throws(() => advanceCampaignOnePreCutscene(start, 'startGame'), /original Cutscene action/);
  assert.throws(() => advanceCampaignOnePreCutscene(start, 'previous'), /original Cutscene action/);
});
