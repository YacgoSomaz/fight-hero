import { TUTORIAL_UNITMC_ROOT_TIMELINE } from './tutorial-unitmc-root-timeline-source.mjs';
import { transitionTutorialUnitMC } from './tutorial-unitmc-transition.mjs';

function rootLabelFrame(label) {
  const pair = TUTORIAL_UNITMC_ROOT_TIMELINE.labels.find(([, name]) => name === label);
  if (!pair) throw new Error(`original UnitMC root label is unavailable: ${label}`);
  return pair[0];
}

// Advances exactly one Flash root timeline tick. The caller supplies frame
// commands mechanically extracted from UnitMC.as. Direct gotoAndPlay affects
// the physical frame but, like the source code, does not rewrite curAnim.
export function advanceTutorialUnitRootFrame(state, frameActions) {
  if (!state || !Number.isInteger(state.frame) || typeof state.animation !== 'string' || typeof state.stopped !== 'boolean') throw new Error('original Tutorial UnitMC root state is required');
  if (!frameActions || typeof frameActions !== 'object') throw new Error('original UnitMC root frame actions are required');
  if (state.stopped) return { ...state };
  const frame = state.frame + 1;
  if (frame > TUTORIAL_UNITMC_ROOT_TIMELINE.frameCount) throw new Error('original UnitMC root timeline advanced past frame 449');
  const action = frameActions[frame];
  if (!action) return { frame, animation: state.animation, stopped: false };
  if (action.type === 'stop') return { frame, animation: state.animation, stopped: true };
  if (action.type === 'play') return { frame: rootLabelFrame(action.label), animation: state.animation, stopped: false };
  if (action.type === 'goto') {
    const transition = transitionTutorialUnitMC({ current: state.animation, requested: action.label, runType: state.animation.endsWith('2') ? 2 : 1, force: action.force });
    return transition.changed
      ? { frame: rootLabelFrame(transition.animation), animation: transition.animation, stopped: false }
      : { frame, animation: state.animation, stopped: false };
  }
  throw new Error(`original UnitMC root action is unsupported: ${action.type}`);
}
