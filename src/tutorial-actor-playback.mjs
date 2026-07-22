import { createTutorialActorRenderPlan } from './tutorial-actor-render-plan.mjs';
import { tutorialM4ActionTick } from './tutorial-m4-action-playback.mjs';
import { advanceTutorialUnitRootFrame } from './tutorial-unitmc-root-playback.mjs';

const GUN_ACTIONS = Object.freeze({ idle: 'rifle', fire: 'rifle_fire', reload: 'rifle_reload' });

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

// Starts only from a Campaign-owned actor. The initial values mirror UnitMC's
// constructor root label and Guns.setFrame('idle') M4 arm label.
export function createTutorialActorPlayback(actor) {
  return {
    actor: requiredActor(actor),
    rootState: { frame: 1, animation: 'idle', stopped: false },
    actionState: { label: 'rifle', index: 0 },
    events: [],
  };
}

// This is the narrow source command boundary of Guns.setFrame(). It does not
// accept input events or generic animation aliases.
export function beginTutorialActorGunAction(state, command) {
  requiredState(state);
  const label = GUN_ACTIONS[command];
  if (!label) throw new Error(`original Guns.setFrame command is unavailable: ${command}`);
  return { ...state, actionState: { label, index: 0 }, events: [] };
}

export function sampleTutorialActorPlayback(state, source) {
  requiredState(state);
  return createTutorialActorRenderPlan({
    actor: state.actor,
    rootState: state.rootState,
    actionState: state.actionState,
    unitTimeline: source?.unitTimeline,
    m4Runtime: source?.m4Runtime,
  });
}

// Advances one source 30fps tick. Non-idle arm timelines advance one decoded
// discrete frame; the extracted arm callback is the only route back to idle.
export function advanceTutorialActorPlayback(state, source) {
  requiredState(state);
  if (!source?.rootFrameActions || !source?.m4Runtime || !source?.armCallbacks) {
    throw new Error('original Tutorial playback sources are required');
  }
  const rootState = advanceTutorialUnitRootFrame(state.rootState, source.rootFrameActions);
  const action = tutorialM4ActionTick(source.m4Runtime, source.armCallbacks, state.actionState.label, state.actionState.index);
  let actionState = state.actionState;
  const events = action.callback ? [...state.events, action.callback] : [...state.events];
  if (action.callback === 'doneShoot' || action.callback === 'doneReload') {
    actionState = { label: 'rifle', index: 0 };
  } else if (state.actionState.label !== 'rifle') {
    // Validate the next source frame rather than silently looping an action.
    tutorialM4ActionTick(source.m4Runtime, source.armCallbacks, state.actionState.label, state.actionState.index + 1);
    actionState = { label: state.actionState.label, index: state.actionState.index + 1 };
  }
  return { ...state, rootState, actionState, events };
}
