import { SOURCE_CAMPAIGN_ONE_SCRIPT } from './campaign-one-script-source.mjs';

function effectFrom(sourceAction) {
  const { state, frame, score, nextState, ...effect } = sourceAction;
  return { ...effect };
}

// Stats_Campaign.setLvl() initializes sn=1 and fc=0.  The original
// runScripts() evaluates its current fc and only then increments it, so this
// deliberately does not use elapsed seconds or a browser animation clock.
export function createCampaignOneRuntime({ state = 1, frame = 0 } = {}) {
  return { state, frame };
}

export function runCampaignOneFrame(runtime) {
  const effects = SOURCE_CAMPAIGN_ONE_SCRIPT.timed
    .filter((action) => action.state === runtime.state && action.frame === runtime.frame)
    .map(effectFrom);
  runtime.frame += 1;
  return effects;
}

// The source score branches increment sn without assigning fc=0.  Retaining
// the current frame is important for exact late-tutorial dialogue timing.
export function applyCampaignOneScore(runtime, team1score) {
  const transition = SOURCE_CAMPAIGN_ONE_SCRIPT.scoreTransitions.find((action) => (
    action.state === runtime.state && action.score === team1score
  ));
  if (!transition) return [];
  runtime.state = transition.nextState;
  return [effectFrom(transition)];
}
