// A render-side reconstruction of the UnitMC hierarchy.  The original AS3
// rotates arm1/arm2 by the aim rotation and the head by 60% of that value;
// legs remain driven by the timeline label (run/climb/etc.).
const degrees = (radians) => radians * 180 / Math.PI;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function part(x, y, rotation = 0) {
  return { x, y, rotation };
}

export function getUnitRigPose({
  animation = 'idle',
  animationTime = 0,
  aimAngle = 0,
  facing = 1,
  recoil = 0,
} = {}) {
  const state = ['run', 'climbsmall', 'climbbig', 'jump', 'fall'].includes(animation) ? animation : 'idle';
  const aim = clamp(degrees(aimAngle), -78, 78);
  const gunKick = clamp(recoil, 0, 1) * 6;
  const pose = {
    state,
    facing: facing < 0 ? -1 : 1,
    torso: part(0, -45),
    head: part(-1, -67, aim * 0.6),
    backArm: part(5, -53, aim),
    frontArm: part(5, -53, aim),
    gun: part(23 - gunKick, -53, aim),
    backLeg: part(-7, -27),
    frontLeg: part(7, -27),
  };

  if (state === 'run') {
    const swing = Math.sin(animationTime * Math.PI * 10);
    pose.backLeg.rotation = swing * 34;
    pose.frontLeg.rotation = -swing * 34;
    pose.torso.y += Math.abs(swing) * 1.8;
    pose.head.y += Math.abs(swing) * 1.8;
    return pose;
  }

  if (state === 'climbsmall' || state === 'climbbig') {
    const progress = clamp(animationTime / 0.28, 0, 1);
    const lift = state === 'climbbig' ? 15 : 9;
    const reach = 17 + progress * 13;
    pose.torso.y = -42 - lift * 0.25;
    pose.head.y = -65 - lift * 0.35;
    pose.backArm = part(7 + progress * 6, -61 - lift, -52 + progress * 18);
    pose.frontArm = part(10 + progress * 11, -63 - lift, -72 + progress * 24);
    pose.gun = part(26 + progress * 10, -63 - lift, pose.frontArm.rotation);
    pose.backLeg = part(-7, -27 - lift * 0.15, 42 - progress * 52);
    pose.frontLeg = part(7 + progress * 8, -27 - lift * 0.5, -44 + progress * 30);
    return pose;
  }

  if (state === 'jump' || state === 'fall') {
    pose.backLeg.rotation = state === 'jump' ? -22 : 18;
    pose.frontLeg.rotation = state === 'jump' ? 25 : -14;
    pose.torso.rotation = state === 'jump' ? -4 : 3;
  }

  return pose;
}

export const UNIT_PARTS = Object.freeze([
  'backLeg',
  'backArm',
  'torso',
  'frontLeg',
  'head',
  'frontArm',
  'gun',
]);
