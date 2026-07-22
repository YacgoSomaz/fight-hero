import { createTutorialActorRenderPlan } from './tutorial-actor-render-plan.mjs';
import { tutorialGunActionFrameAtLabel, tutorialGunSource } from './tutorial-gun-action-frame.mjs';
import { advanceTutorialUnitRootFrame } from './tutorial-unitmc-root-playback.mjs';
import { TUTORIAL_UNITMC_ROOT_TIMELINE } from './tutorial-unitmc-root-timeline-source.mjs';
import { transitionTutorialUnitMC } from './tutorial-unitmc-transition.mjs';

function requiredActor(actor) {
  if (!actor || typeof actor.id !== 'string') throw new Error('original Tutorial actor binding is required');
  if (!actor.spawned) throw new Error(`original Tutorial actor ${actor.id} has not spawned`);
  return actor;
}

function requiredState(state) {
  if (!state || !state.actor || !state.rootState || !state.actionState || !Array.isArray(state.events)) {
    throw new Error('original Tutorial actor playback state is required');
  }
  requiredActor(state.actor);
  return state;
}

function originalRootLabelFrame(label) {
  const entry = TUTORIAL_UNITMC_ROOT_TIMELINE.labels.find(([, sourceLabel]) => sourceLabel === label);
  if (!entry) throw new Error(`original UnitMC motion label is unavailable: ${label}`);
  return entry[0];
}

// Starts only from a Campaign-owned actor. The initial values mirror UnitMC's
// constructor root label and Guns.setFrame('idle') M4 arm label.
export function createTutorialActorPlayback(actor) {
  const bound = requiredActor(actor);
  const weaponId = bound.guns?.active;
  const gun = tutorialGunSource(weaponId);
  return {
    actor: bound,
    weaponId,
    rootState: { frame: 1, animation: 'idle', stopped: false },
    actionState: { label: gun.commands.idle, index: 0 },
    events: [],
  };
}

// This is the narrow source command boundary of Guns.setFrame(). It does not
// accept input events or generic animation aliases.
export function beginTutorialActorGunAction(state, command, { random = Math.random } = {}) {
  requiredState(state);
  const label = tutorialGunSource(state.weaponId).commands[command];
  if (!label) throw new Error(`original Guns.setFrame command is unavailable: ${command}`);
  // MuzzleFlash_317.frame1(): gotoAndStop(UT.irand(1, totalFrames)).
  // It is instantiated only by the first pistol_fire arm frame, so retain
  // this one source result in playback state and clear it on the next tick.
  const muzzleFrame = state.weaponId === 'USP2' && command === 'fire'
    ? Math.trunc(random() * 8) + 1
    : undefined;
  return { ...state, actionState: { label, index: 0, ...(muzzleFrame ? { muzzleFrame } : {}) }, events: [] };
}

// Campaign scripts call Guns.setGuns(). This keeps that source-selected gun
// and its authored idle arm label together; it never remaps USP2 to M4.
export function synchronizeTutorialActorWeapon(state, weaponId) {
  requiredState(state);
  const gun = tutorialGunSource(weaponId);
  return { ...state, weaponId, actionState: { label: gun.commands.idle, index: 0 }, events: [] };
}

// The Movement.as nextAnim string is fed through UnitMC.goto(), not directly
// assigned to a sprite.  Keeping this boundary here preserves the original
// uninterruptible climb/landing and duck/getup transition guards.
export function requestTutorialActorMotion(state, requested) {
  requiredState(state);
  const current = state.rootState.animation;
  const runType = state.actor.runType;
  const transition = transitionTutorialUnitMC({ current, requested, runType });
  if (!transition.changed) return { ...state, events: [] };
  return {
    ...state,
    rootState: { frame: originalRootLabelFrame(transition.animation), animation: transition.animation, stopped: false },
    events: [],
  };
}

export function sampleTutorialActorPlayback(state, source, { aim } = {}) {
  requiredState(state);
  return createTutorialActorRenderPlan({
    actor: state.actor,
    rootState: state.rootState,
    actionState: state.actionState,
    weaponId: state.weaponId,
    unitTimeline: source?.unitTimeline,
    m4Runtime: source?.m4Runtime,
    aim,
  });
}

// Advances one source 30fps tick. Non-idle arm timelines advance one decoded
// discrete frame; the extracted arm callback is the only route back to idle.
export function advanceTutorialActorPlayback(state, source, { advanceArm = true } = {}) {
  requiredState(state);
  if (!source?.rootFrameActions || !source?.m4Runtime || !source?.armCallbacks) {
    throw new Error('original Tutorial playback sources are required');
  }
  const rootState = advanceTutorialUnitRootFrame(state.rootState, source.rootFrameActions);
  let actionState = state.actionState;
  let events = [...state.events];
  if (advanceArm) {
    const action = tutorialGunActionFrameAtLabel(source.m4Runtime, state.weaponId, state.actionState.label, state.actionState.index);
    const callback = source.armCallbacks[action.frame] ?? null;
    if (callback) events = [...events, callback];
    if (callback === 'doneShoot' || callback === 'doneReload') {
      actionState = { label: tutorialGunSource(state.weaponId).commands.idle, index: 0 };
    } else if (state.actionState.label !== tutorialGunSource(state.weaponId).commands.idle) {
      // Validate the next source frame rather than silently looping an action.
      tutorialGunActionFrameAtLabel(source.m4Runtime, state.weaponId, state.actionState.label, state.actionState.index + 1);
      actionState = { label: state.actionState.label, index: state.actionState.index + 1 };
    }
  }
  return { ...state, rootState, actionState, events };
}
