import { createTutorialUnitPosePlan } from './tutorial-unit-pose-plan.mjs';

function originalActionFrames(runtime, actionLabel) {
  const action = runtime?.actions?.[actionLabel];
  if (!action || !Array.isArray(action.rear) || !Array.isArray(action.front)) {
    throw new Error(`original M4 action is unavailable: ${actionLabel}`);
  }
  return action;
}

// Guns.as sends named arm clips to gotoAndStop for idle and gotoAndPlay for
// fire/reload. This resolver deliberately exposes the decoded discrete frame
// index; it never interpolates, loops, or fabricates an action frame.
export function tutorialM4ActionFrame(runtime, actionLabel, actionIndex) {
  if (!Number.isInteger(actionIndex) || actionIndex < 0) {
    throw new Error(`outside original ${actionLabel} timeline: ${actionIndex}`);
  }
  const action = originalActionFrames(runtime, actionLabel);
  const rear = action.rear[actionIndex];
  const front = action.front[actionIndex];
  if (!rear || !front || !Array.isArray(rear.items) || !Array.isArray(front.items)) {
    throw new Error(`outside original ${actionLabel} timeline: ${actionIndex}`);
  }
  if (rear.frame !== front.frame) {
    throw new Error(`original ${actionLabel} front/rear frame mismatch at ${actionIndex}`);
  }
  return { label: actionLabel, index: actionIndex, frame: rear.frame, rearAction: rear.items, frontAction: front.items };
}

export function createTutorialUnitPoseAtAction({ rootFrame, runtime, actionLabel, actionIndex, skinFrame } = {}) {
  const action = tutorialM4ActionFrame(runtime, actionLabel, actionIndex);
  return createTutorialUnitPosePlan({ rootFrame, rearAction: action.rearAction, frontAction: action.frontAction, skinFrame });
}
