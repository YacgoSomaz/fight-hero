import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';

// Cutscene.as reads MatchSettings.preCutFrames and MatchSettings.caName,
// then mutates only curFrame through its but_prev/but_next hit tests.  Keep
// that small state machine separate from the page renderer: source frame
// selection is game logic, while Cutscene 1890's Display List is artwork.
function campaignOneDefinition() {
  const definition = SOURCE_CAMPAIGN_CATALOG.campaign[0];
  if (!definition || definition.stage !== 1 || definition.title !== 'Under Siege') {
    throw new Error('original Campaign 1 Cutscene settings are unavailable');
  }
  return definition;
}

function controls(frames, index) {
  if (index === 0) return Object.freeze({
    previous: Object.freeze({ visible: false, text: '' }),
    next: Object.freeze({ visible: true, text: 'Next' }),
  });
  if (index === frames.length - 1) return Object.freeze({
    previous: Object.freeze({ visible: frames.length > 1, text: frames.length > 1 ? 'Previous' : '' }),
    next: Object.freeze({ visible: true, text: 'Start Game' }),
  });
  return Object.freeze({
    previous: Object.freeze({ visible: true, text: 'Previous' }),
    next: Object.freeze({ visible: true, text: 'Next' }),
  });
}

function atIndex(state, index) {
  const controlsForIndex = controls(state.frames, index);
  return Object.freeze({
    type: state.type,
    title: state.title,
    frames: state.frames,
    index,
    sourceFrame: state.frames[index],
    previous: controlsForIndex.previous,
    next: controlsForIndex.next,
  });
}

export function createCampaignOnePreCutscene() {
  const campaign = campaignOneDefinition();
  const frames = Object.freeze([...campaign.cutscene.preFrames]);
  if (!frames.length || !frames.every((frame) => Number.isInteger(frame) && frame > 0)) {
    throw new Error('original Campaign 1 pre-Cutscene frames are unavailable');
  }
  return atIndex(Object.freeze({ type: 'pre', title: campaign.title, frames }), 0);
}

export function advanceCampaignOnePreCutscene(state, action) {
  if (!state || state.type !== 'pre' || !Array.isArray(state.frames)) {
    throw new TypeError('original Campaign 1 Cutscene state is required');
  }
  if (action === 'previous' && state.previous.visible && state.previous.text === 'Previous') {
    return atIndex(state, state.index - 1);
  }
  if (action === 'next' && state.next.visible && state.next.text === 'Next') {
    return atIndex(state, state.index + 1);
  }
  if (action === 'next' && state.next.visible && state.next.text === 'Start Game') {
    return Object.freeze({ kind: 'startGame' });
  }
  throw new RangeError(`original Cutscene action is unavailable: ${action}`);
}
