import { tutorialM4ActionFrame } from './tutorial-m4-action-frame.mjs';

// `shootDelay` is a private uint in Guns.as. Its assignment is
// `curGun.shootDelay * 30`, so ActionScript truncates the M4's 4.5 to four
// EnterFrame ticks before decrementing it.
export function actionScriptUint(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) return 0;
  return Math.trunc(numeric) >>> 0;
}

export function tutorialM4ActionTick(runtime, callbacks, label, index) {
  if (!callbacks || typeof callbacks !== 'object') throw new Error('original arm callback map is required');
  const action = tutorialM4ActionFrame(runtime, label, index);
  return { ...action, callback: callbacks[action.frame] ?? null };
}
