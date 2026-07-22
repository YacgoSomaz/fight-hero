function xMoveToRot(rotation, distance) {
  return rotation === 0 || rotation === 180 || rotation === -180 ? 0 : Math.sin(rotation * Math.PI / 180) * distance;
}

function yMoveToRot(rotation, distance) {
  return rotation === 90 || rotation === -90 ? 0 : Math.cos(rotation * Math.PI / 180) * -distance;
}

function fixRotation(rotation) {
  if (rotation > 180) rotation -= 360;
  if (rotation < -180) rotation += 360;
  return rotation;
}

function getRotation(x1, y1, x2, y2) {
  const x = x1 - x2;
  const y = y1 - y2;
  const distance = Math.hypot(x, y);
  const radians = y < 0 ? Math.PI * 2 - Math.acos(x / distance) : Math.acos(x / distance);
  return fixRotation(radians * 180 / Math.PI - 90);
}

const PARTS = Object.freeze([
  ['hand', 19, 8, 0, 1], ['lowerArm', 11, 8, -0.5, 0.6], ['upperArm', 1, 1, -0.2, 0.5],
  ['foot', -2, 34, 0, 1], ['lowerLeg', -2, 28, 0, 0.6], ['upperLeg', -2, 17, 0, 0.6],
  ['foot', -2, 34, 0, 1], ['lowerLeg', -2, 28, 0, 0.6], ['upperLeg', -2, 17, 0, 0.6],
  ['body', 0, 0, 0.1, 0.8], ['head', 5, -14, 0.05, 1],
  ['hand', 19, 8, 0, 1], ['lowerArm', 11, 8, -0.5, 0.6], ['upperArm', 1, 1, -0.2, 0.5],
]);

function requireSourceUnit(unit, label) {
  if (!Number.isFinite(unit?.position?.x) || !Number.isFinite(unit?.position?.y) || !Number.isFinite(unit?.scaleX)
    || !Number.isFinite(unit?.skinFrame) || !Number.isFinite(unit?.movement?.xVelocity) || !Number.isFinite(unit?.movement?.yVelocity)) {
    throw new TypeError(`PhysActor requires ${label} source position, flip, skin and Movement velocity`);
  }
}

function addImpulse(part, impulse) {
  part.impulses.push(impulse);
}

// Direct record of PhysWorld.createCorpse() and PhysActor construction. It
// preserves body topology and all source impulse inputs; Box2D integration
// and visible Phys* sprites remain a later, separate source task.
export function createTutorialCorpse({ target, attacker, gun, extra, useMod = '', random = Math.random } = {}) {
  requireSourceUnit(target, 'target');
  if (!Number.isFinite(attacker?.position?.x) || !Number.isFinite(attacker?.position?.y)) throw new TypeError('PhysActor requires attacker source position');
  const flip = target.scaleX;
  const origin = { x: target.position.x, y: target.position.y - 40 };
  const parts = PARTS.map(([kind, x, y, rotation, size]) => ({
    kind,
    position: { x: origin.x + x * flip, y: origin.y + y },
    rotation: rotation * flip * 360,
    size,
    impulses: [],
  }));
  const body = parts.find(({ kind }) => kind === 'body');
  const head = parts.find(({ kind }) => kind === 'head');
  const corpse = {
    id: `corpse-${target.id}`,
    sourceUnitId: target.id,
    position: { ...origin },
    flip,
    skinFrame: target.skinFrame,
    parts,
    bodyImpulses: body.impulses,
    headImpulses: [],
    fc: 0,
    removed: false,
  };

  // PhysWorld.createCorpse() first calls PhysActor.impulseAll().
  for (const part of parts) addImpulse(part, { x: random() * 2 - 1, y: random() * 2 - 1 });
  addImpulse(body, { x: target.movement.xVelocity, y: target.movement.yVelocity });

  let force = gun.force;
  if (useMod === 'sky9') force *= 3;
  if (force) {
    let rotation;
    if (gun.splash) {
      if (extra.hitX === target.position.x && extra.hitY === target.position.y) extra.hitY += 1;
      rotation = getRotation(extra.hitX, extra.hitY, target.position.x, target.position.y - 40);
    } else {
      if (attacker.position.x === target.position.x && attacker.position.y === target.position.y) target.position.y -= 2;
      rotation = getRotation(attacker.position.x, attacker.position.y, target.position.x, target.position.y);
    }
    addImpulse(body, { x: xMoveToRot(rotation, force), y: yMoveToRot(rotation, force) });
  }
  if (extra.headMult) {
    if (attacker.position.x === target.position.x && attacker.position.y === target.position.y - 10) target.position.y -= 1;
    const rotation = getRotation(attacker.position.x, attacker.position.y, target.position.x, target.position.y - 10);
    const impulse = { x: xMoveToRot(rotation, 8), y: yMoveToRot(rotation, 8) };
    addImpulse(head, impulse);
    corpse.headImpulses.push(impulse);
  }
  return corpse;
}

function requireSourceCorpse(corpse) {
  const body = corpse?.parts?.find(({ kind }) => kind === 'body');
  if (!body || !Array.isArray(corpse.parts) || !Array.isArray(body.impulses)
    || !Number.isFinite(body.position?.x) || !Number.isFinite(body.position?.y)) {
    throw new TypeError('PhysWorld.hitCorpse requires a source PhysActor body and parts');
  }
  return body;
}

// Direct numerical state port of PhysWorld.hitCorpse().  This intentionally
// records source impulses only; Box2D force integration and the Phys* sprite
// display list are not substituted by a hand-drawn corpse renderer.
export function applyTutorialCorpseHit({ corpse, attacker, gun, extra = {}, useMod = '', random = Math.random } = {}) {
  const body = requireSourceCorpse(corpse);
  if (!Number.isFinite(attacker?.position?.x) || !Number.isFinite(attacker?.position?.y)) throw new TypeError('PhysWorld.hitCorpse requires attacker source position');
  if (!Number.isFinite(gun?.force) || !Number.isFinite(gun?.splash)) throw new TypeError('PhysWorld.hitCorpse requires source gun force and splash');
  for (const part of corpse.parts) addImpulse(part, { x: random() - 0.5, y: random() - 0.5 });
  let force = gun.force;
  if (useMod === 'sky9') force *= 1.5;
  if (force) {
    let rotation;
    if (gun.splash) {
      if (extra.hitX === body.position.x && extra.hitY === body.position.y) extra.hitY += 1;
      rotation = getRotation(extra.hitX, extra.hitY, body.position.x, body.position.y - 40);
    } else {
      if (attacker.position.x === body.position.x && attacker.position.y === body.position.y) body.position.y -= 1;
      rotation = getRotation(attacker.position.x, attacker.position.y, body.position.x, body.position.y);
    }
    addImpulse(body, { x: xMoveToRot(rotation, force), y: yMoveToRot(rotation, force) });
  }
  return { applied: true, force };
}

// PhysActor.EnterFrame increments first, then destroys exactly at 5 * 30.
export function advanceTutorialCorpseFrame(corpse) {
  corpse.fc += 1;
  if (corpse.fc === 5 * 30) {
    corpse.removed = true;
    return { removed: true };
  }
  return { removed: false };
}
