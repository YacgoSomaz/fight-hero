import { createTutorialUnitPosePlan } from './tutorial-unit-pose-plan.mjs';
import { SOURCE_GUNS } from './gun-source.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

const ARM_ROOTS = Object.freeze({ rear: 501, front: 668 });

function sourceGun(id) {
  const gun = GUN_BY_ID.get(id);
  if (!gun?.sprite || !gun.animation?.idle || !gun.animation?.fire || !gun.animation?.reload) {
    throw new Error(`original Tutorial gun is unavailable: ${id}`);
  }
  return Object.freeze({
    sprite: gun.sprite,
    // Guns.setFrame() uses frameIdle directly, but appends `_fire`/`_reload`
    // before gotoAndPlay for the two non-idle arm spans.
    commands: Object.freeze({
      idle: gun.animation.idle,
      fire: `${gun.animation.fire}_fire`,
      reload: `${gun.animation.reload}_reload`,
    }),
  });
}

// Guns.setFrame() invokes arm1.gun.gotoAndStop(curGun.sprite).  Symbol 375
// is the extracted source Gun Sprite, so its authored labels—not a hand map
// of weapon ids—are the only valid source of the nested frame number.
function sourceGunFrame(runtime, source) {
  const frame = runtime?.sprites?.[375]?.labels?.find((entry) => entry.label === source.sprite)?.frame;
  if (!Number.isInteger(frame)) throw new Error(`original Tutorial gun Sprite label is unavailable: ${source.sprite}`);
  return frame;
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
    gunFrame: sourceGunFrame(runtime, source),
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

export function createTutorialUnitPoseAtGunAction({ rootFrame, runtime, gunId, command, actionIndex, skinFrame, muzzleFrame, aim } = {}) {
  const action = tutorialGunActionFrame(runtime, gunId, command, actionIndex);
  return createTutorialUnitPosePlan({
    rootFrame,
    rearAction: action.rearAction,
    frontAction: action.frontAction,
    skinFrame,
    gunFrame: action.gunFrame,
    muzzleFrame,
    aim,
  });
}

export function tutorialGunSource(gunId) {
  return sourceGun(gunId);
}
