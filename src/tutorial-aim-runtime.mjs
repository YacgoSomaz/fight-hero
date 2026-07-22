const STAGE = Object.freeze({ width: 800, height: 600 });

function fixRotation(value) {
  if (value > 180) return value - 360;
  if (value < -180) return value + 360;
  return value;
}

// Direct equivalent of UT.getRotation(x1, y1, x2, y2).  The game's unusual
// angle convention is deliberate: 90° points to the right for xMoveToRot.
function sourceRotation(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (!distance) return 0;
  const radians = dy < 0
    ? Math.PI * 2 - Math.acos(dx / distance)
    : Math.acos(dx / distance);
  return fixRotation(radians * 180 / Math.PI - 90);
}

// The DOM canvas may be CSS-scaled, but Player/Game source coordinates always
// use the fixed SWF 800×600 stage rectangle.
export function canvasPointToTutorialStage({ clientX, clientY }, { left, top, width, height }) {
  if (![clientX, clientY, left, top, width, height].every(Number.isFinite) || !(width > 0) || !(height > 0)) {
    throw new TypeError('Tutorial pointer and canvas rectangle must be finite');
  }
  return {
    x: (clientX - left) * STAGE.width / width,
    y: (clientY - top) * STAGE.height / height,
  };
}

// `arena.mouseX/Y` are local coordinates of the translated Arena display
// object, so they are stage mouse coordinates less Arena.x/y.
export function tutorialArenaPointer(stageMouse, arenaPosition) {
  if (![stageMouse?.x, stageMouse?.y, arenaPosition?.x, arenaPosition?.y].every(Number.isFinite)) {
    throw new TypeError('Tutorial stage mouse and Arena position are required');
  }
  return { x: stageMouse.x - arenaPosition.x, y: stageMouse.y - arenaPosition.y };
}

// Source port of Player.EnterFrame's aimX/aimY smoothing and Unit.EnterFrame
// arm/head transform calculations. `aimRotation` is intentionally read before
// it is rewritten: the source flip calculation has that one-source-tick lag.
export function advanceTutorialPlayerAim(sourceState, {
  actor,
  arenaMouse,
  armHolder,
  mcRotation = 0,
  unitRotation = 0,
  spinRotation = 0,
  jumping = false,
  noAim = false,
  reloading = false,
  stageMouse,
} = {}) {
  if (![sourceState?.aimX, sourceState?.aimY, sourceState?.aimRotation, sourceState?.reloadRotation, actor?.position?.x, actor?.position?.y, arenaMouse?.x, arenaMouse?.y, armHolder?.x, armHolder?.y, mcRotation, unitRotation, spinRotation].every(Number.isFinite)) {
    throw new TypeError('Tutorial Player source aim state and coordinates are required');
  }
  let aimX = sourceState.aimX;
  let aimY = sourceState.aimY;
  if (!noAim) {
    aimX += (arenaMouse.x - aimX) * 0.5;
    aimY += (arenaMouse.y - aimY) * 0.5;
  }
  const flip = jumping
    ? aimX < actor.position.x
    : fixRotation(sourceState.aimRotation - mcRotation) < 0;
  let rotArm = sourceRotation(
    actor.position.x + armHolder.x + mcRotation * 1.2,
    actor.position.y + armHolder.y,
    aimX,
    aimY,
  ) - 90;
  const aimRotation = fixRotation(rotArm + 90) + spinRotation;
  if (flip) rotArm = -rotArm + 180;
  rotArm = fixRotation(rotArm - unitRotation) + (flip ? mcRotation : -mcRotation);
  const reloadRotation = sourceState.reloadRotation + (((reloading && rotArm < 30 ? 30 : 0) - sourceState.reloadRotation) * 0.2);
  return Object.freeze({
    aimX,
    aimY,
    aimRotation,
    reloadRotation,
    armRotation: reloadRotation + rotArm,
    headRotation: reloadRotation + rotArm * 0.6,
    flip,
    aimerStage: noAim ? { x: -1000, y: -1000 } : (stageMouse ? { x: stageMouse.x, y: stageMouse.y } : null),
  });
}
