import { createTutorialUnitPosePlan } from './tutorial-unit-pose-plan.mjs';

// Source: Stats_Guns.as records M4 -> sprite M4 / rifle labels and
// USP2 -> sprite USP / pistol labels.  The two arm roots are the original
// arm_gun_316 (501) and arm_front_328 (668) display lists.
const SOURCE_GUNS = Object.freeze({
  M4: Object.freeze({ gunFrame: 20, commands: Object.freeze({ idle: 'rifle', fire: 'rifle_fire', reload: 'rifle_reload' }) }),
  USP2: Object.freeze({ gunFrame: 2, commands: Object.freeze({ idle: 'pistol', fire: 'pistol_fire', reload: 'pistol_reload' }) }),
});

const ARM_ROOTS = Object.freeze({ rear: 501, front: 668 });

function sourceGun(id) {
  const source = SOURCE_GUNS[id];
  if (!source) throw new Error(`original Tutorial gun is unavailable: ${id}`);
  return source;
}

function decodedArmSpan(runtime, rootId, label) {
  const sprite = runtime?.sprites?.[rootId];
  if (!sprite || !Array.isArray(sprite.labels) || !Array.isArray(sprite.frames)) {
    throw new Error(`original Tutorial arm root is unavailable: ${rootId}`);
  }
  const labelIndex = sprite.labels.findIndex((entry) => entry.label === label);
  if (labelIndex < 0) throw new Error(`original ${label} arm label is unavailable`);
  const start = sprite.labels[labelIndex].frame;
  const end = (sprite.labels[labelIndex + 1]?.frame ?? sprite.frameCount + 1) - 1;
  return sprite.frames.slice(start - 1, end);
}

function originalActionFrames(runtime, label) {
  const extracted = runtime?.actions?.[label];
  if (extracted && Array.isArray(extracted.rear) && Array.isArray(extracted.front)) return extracted;
  return {
    rear: decodedArmSpan(runtime, ARM_ROOTS.rear, label),
    front: decodedArmSpan(runtime, ARM_ROOTS.front, label),
  };
}

// Resolves source MovieClip frames rather than generating weapon poses. A
// span ends at the next authored label on each arm root; no interpolation or
// repeated terminal frame is allowed.
function sourceActionFrame(runtime, gunId, source, command, label, actionIndex) {
  if (!Number.isInteger(actionIndex) || actionIndex < 0) throw new Error(`outside original ${gunId} timeline: ${actionIndex}`);
  const action = originalActionFrames(runtime, label);
  const rear = action.rear[actionIndex];
  const front = action.front[actionIndex];
  if (!rear || !front || !Array.isArray(rear.items) || !Array.isArray(front.items)) {
    throw new Error(`outside original ${label} timeline: ${actionIndex}`);
  }
  if (rear.frame !== front.frame) throw new Error(`original ${label} front/rear frame mismatch at ${actionIndex}`);
  return {
    gunId,
    command,
    label,
    index: actionIndex,
    frame: rear.frame,
    gunFrame: source.gunFrame,
    rearAction: rear.items,
    frontAction: front.items,
  };
}

export function tutorialGunActionFrame(runtime, gunId, command, actionIndex) {
  const source = sourceGun(gunId);
  const label = source.commands[command];
  if (!label) throw new Error(`original ${gunId} command is unavailable: ${command}`);
  return sourceActionFrame(runtime, gunId, source, command, label, actionIndex);
}

export function tutorialGunActionFrameAtLabel(runtime, gunId, label, actionIndex) {
  const source = sourceGun(gunId);
  const command = Object.entries(source.commands).find(([, sourceLabel]) => sourceLabel === label)?.[0];
  if (!command) throw new Error(`original ${gunId} arm label is unavailable: ${label}`);
  return sourceActionFrame(runtime, gunId, source, command, label, actionIndex);
}

export function createTutorialUnitPoseAtGunAction({ rootFrame, runtime, gunId, command, actionIndex, skinFrame, muzzleFrame } = {}) {
  const action = tutorialGunActionFrame(runtime, gunId, command, actionIndex);
  return createTutorialUnitPosePlan({
    rootFrame,
    rearAction: action.rearAction,
    frontAction: action.frontAction,
    skinFrame,
    gunFrame: action.gunFrame,
    muzzleFrame,
  });
}

export function tutorialGunSource(gunId) {
  return sourceGun(gunId);
}
