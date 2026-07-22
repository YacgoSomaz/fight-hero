import { createTutorialUnitPoseAtGunAction, tutorialGunActionFrameAtLabel } from './tutorial-gun-action-frame.mjs';

// Joins only source-owned data that is required to draw one Tutorial actor.
// It deliberately does not accept generic engine actors, whole-body PNGs, or
// fallback action frames.
export function createTutorialActorRenderPlan({ actor, rootState, actionState, weaponId = 'M4', unitTimeline, m4Runtime, aim } = {}) {
  if (!actor || typeof actor.id !== 'string' || !Number.isInteger(actor.skinFrame)) throw new Error('original Tutorial actor binding is required');
  if (!actor.spawned) throw new Error(`original Tutorial actor ${actor.id} has not spawned`);
  if (!rootState || !Number.isInteger(rootState.frame) || typeof rootState.animation !== 'string') throw new Error('original UnitMC root state is required');
  if (!actionState || typeof actionState.label !== 'string' || !Number.isInteger(actionState.index)) throw new Error('original M4 action state is required');
  const rootFrame = unitTimeline?.frames?.[rootState.frame - 1];
  if (!Array.isArray(rootFrame)) throw new Error(`original UnitMC root frame is unavailable: ${rootState.frame}`);
  const arm = tutorialGunActionFrameAtLabel(m4Runtime, weaponId, actionState.label, actionState.index);
  return {
    actorId: actor.id,
    skinFrame: actor.skinFrame,
    rootFrame: rootState.frame,
    rootAnimation: rootState.animation,
    arm,
    pose: createTutorialUnitPoseAtGunAction({ rootFrame, runtime: m4Runtime, gunId: weaponId, command: arm.command, actionIndex: actionState.index, skinFrame: actor.skinFrame, muzzleFrame: actionState.muzzleFrame, aim }),
  };
}
