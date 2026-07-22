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

function copyEffects(effects) {
  return effects.map((effect) => ({ ...effect }));
}

function changeWall(transition) {
  return { type: 'changeWallFrame', frameLabel: transition.wallFrame };
}

export function applyCampaignOneSurfaceContact(runtime, { surface, human }) {
  if (!human || surface !== SOURCE_CAMPAIGN_ONE_SCRIPT.surfaceTrigger.surface) return [];
  const transition = SOURCE_CAMPAIGN_ONE_SCRIPT.surfaceTransitions.find((entry) => entry.state === runtime.state);
  if (!transition) return [];
  runtime.state = transition.nextState;
  if (transition.resetFrame) runtime.frame = 0;
  return [
    ...copyEffects(transition.effects),
    { type: 'showDownArrows', state: transition.showDownArrowsState },
    changeWall(transition),
  ];
}

export function applyCampaignOneGunSwap(runtime) {
  const transition = SOURCE_CAMPAIGN_ONE_SCRIPT.inputTransition;
  if (runtime.state !== transition.requiredState) return [];
  runtime.state = transition.nextState;
  // Player.as opens the door after incrementing sn and changing the Arena
  // wall.  Preserve that order while retaining the extracted HUD/arrow calls.
  const doorIndex = transition.effects.findIndex((effect) => effect.type === 'doorFrame');
  const beforeDoor = transition.effects.slice(0, doorIndex < 0 ? transition.effects.length : doorIndex);
  const afterDoor = doorIndex < 0 ? [] : transition.effects.slice(doorIndex);
  return [...copyEffects(beforeDoor), changeWall(transition), ...copyEffects(afterDoor)];
}

export function applyCampaignOneBulletEnvironmentHit(runtime, hitObject) {
  const transition = SOURCE_CAMPAIGN_ONE_SCRIPT.bulletTransition;
  if (runtime.state !== transition.requiredState || hitObject !== transition.hitObject) return [];
  runtime.state = transition.nextState;
  // Bullet.as changes the wall immediately after clearing clip/spare ammo;
  // elevator playback and arrow hiding occur only afterwards.
  const elevatorIndex = transition.effects.findIndex((effect) => effect.type === 'elevatorFrame');
  const beforeElevator = transition.effects.slice(0, elevatorIndex < 0 ? transition.effects.length : elevatorIndex);
  const afterElevator = elevatorIndex < 0 ? [] : transition.effects.slice(elevatorIndex);
  return [...copyEffects(beforeElevator), changeWall(transition), ...copyEffects(afterElevator)];
}
