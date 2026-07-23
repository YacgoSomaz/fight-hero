// Direct, stateful-equivalent port of the collision and locomotion path in
// assets/reverse/ffdec-deep-20260720/scripts/Movement.as.  Positions are the
// original Unit centre-foot coordinates; callers must pass the current decoded
// Wall_tut alpha surface rather than an approximate rectangle collider.
export const TUTORIAL_MOVEMENT_KEYS = Object.freeze({
  UP: 1,
  DOWN: 2,
  LEFT: 4,
  RIGHT: 8,
});

// Movement.as addresses the live Unit's `unitInfo.runType`, assigned by
// Unit.setClass().  Browser bindings also expose a convenient root runType,
// but the authoritative Campaign actor only owns the former.
function sourceRunType(actor) {
  const runType = actor?.unitInfo?.runType ?? actor?.runType;
  return Number.isInteger(runType) && runType > 0 ? runType : '';
}

const SOURCE = Object.freeze({
  xAcc: 1.8,
  xBrake: 1.7,
  xCrouchBrake: 0.5,
  xAirAcc: 1.4,
  xAirBrake: 0.4,
  xMax: 9.5,
  xCrouchMax: 4,
  yGrav: 0.8,
  yMax: 20,
  yJump: 13,
  yJumpBoost: 6,
  yDjump: 10,
});

function number(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

export function createTutorialMovementState(overrides = {}) {
  return {
    xVel: number(overrides.xVel, 0),
    xVelSlide: number(overrides.xVelSlide, 0),
    yVel: number(overrides.yVel, 0),
    manualJump: Boolean(overrides.manualJump),
    jumping: Boolean(overrides.jumping),
    crouching: Boolean(overrides.crouching),
    climb: number(overrides.climb, 0),
    climbSize: number(overrides.climbSize, 0),
    falltimer: number(overrides.falltimer, 0),
    landHard: Boolean(overrides.landHard),
    noJump: Boolean(overrides.noJump),
    parachute: Boolean(overrides.parachute),
    tiltL: number(overrides.tiltL, 0),
    tiltR: number(overrides.tiltR, 0),
    rotation: number(overrides.rotation, 0),
    modSpeed: number(overrides.modSpeed, 1),
    modMax: number(overrides.modMax, 1),
    modBrake: number(overrides.modBrake, 1),
    modJump: number(overrides.modJump, 1),
    modSlide: number(overrides.modSlide, 0),
    modMove: number(overrides.modMove, 0),
    modGrav: number(overrides.modGrav, 1),
  };
}

function requireWall(wall) {
  if (typeof wall?.isSolid !== 'function') {
    throw new TypeError('Tutorial Movement requires the decoded original Wall_tut alpha surface');
  }
}

function sourceHitTest(wall, position, dx = 0, dy = 0) {
  // Movement.hitTest calls BitmapData.getPixel32 at these non-rounded probe
  // coordinates. createFlashWallSurface performs Flash-equivalent floor lookup.
  return Boolean(wall.isSolid(position.x + dx, position.y + dy));
}

function displaceUntilFree(position, wall, probes, deltaX = 0, deltaY = 0) {
  let guard = 0;
  while (probes.some(([x, y]) => sourceHitTest(wall, position, x, y))) {
    position.x += deltaX;
    position.y += deltaY;
    guard += 1;
    if (guard > 4096) throw new RangeError('source Movement collision probes could not leave Wall_tut');
  }
}

function resolveSourceFootOverlap(position, wall, footOffset) {
  let guard = 0;
  // Movement.as:357/364 keeps this negative-one probe in the loop condition.
  // It prevents a partially embedded spawn from being pushed all the way
  // through its authored floor while resolving the eight-pixel foot probe.
  while (sourceHitTest(wall, position, 0, footOffset) && !sourceHitTest(wall, position, 0, -1)) {
    position.y += 0.5;
    guard += 1;
    if (guard > 4096) throw new RangeError('source Movement foot collision could not resolve');
  }
}

function beginClimb(state, direction) {
  state.climb = direction;
  state.yVel = state.climbSize === 1 ? -7 : -10;
  return `climb${state.climbSize === 1 ? 'small' : 'big'}`;
}

// Direct port of Movement.doJump() for the normal manual-jump path.  Climb
// jumps are issued only by resolveTerminalFall(), where the source has already
// established climbSize from its Wall_tut side probes.
export function beginTutorialMovementJump({ state: sourceState, actor: sourceActor }) {
  const state = createTutorialMovementState(sourceState);
  const actor = { ...sourceActor, position: { ...sourceActor.position } };
  if (state.crouching || state.climb || state.landHard || state.jumping || state.noJump) {
    return Object.freeze({ actor: Object.freeze(actor), state: Object.freeze(state), nextAnim: null });
  }
  actor.position.y -= SOURCE.yJumpBoost;
  state.yVel -= SOURCE.yJump * state.modJump;
  state.jumping = true;
  state.manualJump = true;
  return Object.freeze({ actor: Object.freeze(actor), state: Object.freeze(state), nextAnim: 'jump' });
}

function updateHorizontal({ state, actor, position, keys }) {
  let nextAnim = 'idle';
  let aim = null;
  const back = 'back';
  const runType = sourceRunType(actor);
  if ((keys & TUTORIAL_MOVEMENT_KEYS.LEFT) && !state.landHard) {
    if (actor.human && actor.noAim) aim = { x: position.x - 200, y: position.y };
    if (state.crouching) {
      nextAnim = actor.flip ? 'duckrun' : `duckrun${actor.noAim && actor.human ? '' : back}`;
      state.xVel += (state.jumping ? -SOURCE.xAirAcc : -SOURCE.xAcc) * state.modSpeed;
      state.xVel = Math.max(state.xVel, -SOURCE.xCrouchMax * state.modMax);
    } else {
      nextAnim = `${actor.flip ? 'run' : `run${actor.noAim && actor.human ? '' : back}`}${runType}`;
      state.xVel += (state.jumping ? -SOURCE.xAirAcc : -SOURCE.xAcc) * state.modSpeed;
      state.xVel = Math.max(state.xVel, -SOURCE.xMax * state.modMax);
    }
  } else if ((keys & TUTORIAL_MOVEMENT_KEYS.RIGHT) && !state.landHard) {
    if (actor.human && actor.noAim) aim = { x: position.x + 200, y: position.y };
    if (state.crouching) {
      nextAnim = actor.flip ? `duckrun${actor.noAim && actor.human ? '' : back}` : 'duckrun';
      state.xVel += (state.jumping ? SOURCE.xAirAcc : SOURCE.xAcc) * state.modSpeed;
      state.xVel = Math.min(state.xVel, SOURCE.xCrouchMax * state.modMax);
    } else {
      nextAnim = `${actor.flip ? `run${actor.noAim && actor.human ? '' : back}` : 'run'}${runType}`;
      state.xVel += (state.jumping ? SOURCE.xAirAcc : SOURCE.xAcc) * state.modSpeed;
      state.xVel = Math.min(state.xVel, SOURCE.xMax * state.modMax);
    }
  } else {
    const brake = (state.jumping ? SOURCE.xAirBrake : (state.crouching ? SOURCE.xCrouchBrake : SOURCE.xBrake)) * state.modBrake;
    if (state.xVel > brake) state.xVel -= brake;
    if (state.xVel < -brake) state.xVel += brake;
    if (state.xVel > -brake - 0.1 && state.xVel < brake + 0.1) state.xVel = 0;
  }
  return { nextAnim, aim };
}

function updateCrouch(state, position, wall, keys) {
  // Exact order from Movement.EnterFrame: input crouch wins, otherwise a
  // crouched unit stays low only if the ±17, -45 head probes still collide.
  if (!state.jumping && (keys & TUTORIAL_MOVEMENT_KEYS.DOWN) && !state.landHard) {
    state.crouching = true;
  } else if (state.crouching && (sourceHitTest(wall, position, -17, -45) || sourceHitTest(wall, position, 17, -45))) {
    state.crouching = true;
  } else {
    state.crouching = false;
  }
}

function resolveTerminalFall({ state, position, wall }) {
  if (sourceHitTest(wall, position, 0, -50)) {
    // This is the source's terminal-speed ceiling recovery loop.
    position.y += 1;
  }
}

// Movement.as:454–543 performs these side probes after *both* the grounded
// and falling paths. They are not a terminal-fall-only feature: a grounded
// Unit walking into a chest-high Wall_tut ledge must be pushed out and enter
// its authored climb state in the same source frame.
function resolveSourceSideClimb({ state, position, wall, keys, nextAnim }) {
  let rightClimb = false;
  if ((keys & TUTORIAL_MOVEMENT_KEYS.RIGHT) && sourceHitTest(wall, position, 17, -40) && !sourceHitTest(wall, position, 17, -55)) {
    state.climbSize = 2;
    rightClimb = true;
  } else if ((keys & TUTORIAL_MOVEMENT_KEYS.RIGHT) && sourceHitTest(wall, position, 17, -20) && !sourceHitTest(wall, position, 17, -55)) {
    state.climbSize = 1;
    rightClimb = true;
  }
  displaceUntilFree(
    position,
    wall,
    state.crouching ? [[17, -20], [17, -25], [17, -35]] : [[17, -20], [17, -25], [17, -35], [17, -45]],
    -1,
  );

  let leftClimb = false;
  if ((keys & TUTORIAL_MOVEMENT_KEYS.LEFT) && sourceHitTest(wall, position, -17, -40) && !sourceHitTest(wall, position, -17, -55)) {
    state.climbSize = 2;
    leftClimb = true;
  } else if ((keys & TUTORIAL_MOVEMENT_KEYS.LEFT) && sourceHitTest(wall, position, -17, -20) && !sourceHitTest(wall, position, -17, -55)) {
    state.climbSize = 1;
    leftClimb = true;
  }
  displaceUntilFree(
    position,
    wall,
    state.crouching ? [[-17, -20], [-17, -25], [-17, -35]] : [[-17, -20], [-17, -25], [-17, -35], [-17, -45]],
    1,
  );
  let guard = 0;
  while (sourceHitTest(wall, position, 0, 0)) {
    position.y -= 0.5;
    guard += 1;
    if (guard > 4096) throw new RangeError('source Movement centre probe could not leave Wall_tut');
  }
  if (rightClimb) nextAnim = beginClimb(state, 1);
  if (leftClimb) nextAnim = beginClimb(state, -1);
  return nextAnim;
}

function sourceRotation(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  let radians = dy < 0 ? Math.PI * 2 - Math.acos(dx / distance) : Math.acos(dx / distance);
  let degrees = radians * 180 / Math.PI - 90;
  if (degrees > 180) degrees -= 360;
  if (degrees < -180) degrees += 360;
  return degrees;
}

function updateFloorTilt({ state, position, wall, keys, nextAnim, actor }) {
  let target = 0;
  if (!state.jumping) {
    state.tiltL = -10;
    let samples = 0;
    while (samples < 30 && !sourceHitTest(wall, position, -10, state.tiltL)) {
      samples += 1;
      state.tiltL += 1;
    }
    state.tiltR = -10;
    samples = 0;
    while (samples < 30 && !sourceHitTest(wall, position, 10, state.tiltR)) {
      samples += 1;
      state.tiltR += 1;
    }
    if (state.tiltL < 20 && state.tiltR < 20) {
      target = sourceRotation(-10, state.tiltL, 10, state.tiltR) - 90;
    }
  }
  state.rotation += (target - state.rotation) * 0.3;
  if (state.crouching && !(keys & TUTORIAL_MOVEMENT_KEYS.LEFT) && !(keys & TUTORIAL_MOVEMENT_KEYS.RIGHT)) nextAnim = 'duck';
  if (state.landHard) nextAnim = 'landhard';
  return nextAnim;
}

// One ActionScript EnterFrame equivalent.  It does not invent an alternative
// physics model: it returns the source's nextAnim command so UnitMC transition
// handling can be connected separately to its original timeline guards.
export function stepTutorialMovement({ state: sourceState, actor: sourceActor, wall, keys = 0 }) {
  requireWall(wall);
  const state = createTutorialMovementState(sourceState);
  const actor = { ...sourceActor, position: { ...sourceActor.position } };
  const position = actor.position;
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) throw new TypeError('Tutorial Movement requires a finite source actor position');

  updateCrouch(state, position, wall, keys);
  if (state.parachute) state.modGrav = 0.2;
  let { nextAnim, aim } = updateHorizontal({ state, actor, position, keys });

  if (state.climb === 1) state.xVel = 5;
  else if (state.climb === -1) state.xVel = -5;
  position.x += state.xVel + state.modMove;
  if (!state.modSlide) state.xVel += state.xVelSlide;
  state.xVelSlide = Math.round(state.rotation) * state.modSlide;
  if (state.xVelSlide > 0) state.xVelSlide -= 0.05;
  if (state.xVelSlide < 0) state.xVelSlide += 0.05;
  if (state.xVelSlide > -0.1 && state.xVelSlide < 0.1) state.xVelSlide = 0;
  position.x += state.xVelSlide;
  position.y += state.yVel;

  resolveSourceFootOverlap(position, wall, state.climb ? 6 : 8);
  if (sourceHitTest(wall, position, 0, 1)) {
    if (state.falltimer >= 1.3 * 30) state.landHard = true;
    if (state.yVel > 0) {
      const runType = sourceRunType(actor);
      if (keys & TUTORIAL_MOVEMENT_KEYS.LEFT) nextAnim = `${actor.flip ? 'landrun' : 'landrunback'}${runType}`;
      else if (keys & TUTORIAL_MOVEMENT_KEYS.RIGHT) nextAnim = `${actor.flip ? 'landrunback' : 'landrun'}${runType}`;
      else nextAnim = 'land';
    }
    state.manualJump = false;
    state.jumping = false;
    state.yVel = 0;
    state.falltimer = 0;
    state.parachute = false;
  } else {
    if (state.yVel > 0) state.falltimer += 1;
    nextAnim = 'fall';
    state.jumping = true;
    state.yVel += SOURCE.yGrav * state.modGrav;
    if (state.yVel > SOURCE.yMax * state.modGrav) {
      state.yVel = SOURCE.yMax * state.modGrav;
      resolveTerminalFall({ state, position, wall });
    }
  }

  nextAnim = resolveSourceSideClimb({ state, position, wall, keys, nextAnim });
  nextAnim = updateFloorTilt({ state, position, wall, keys, nextAnim, actor });

  return Object.freeze({
    actor: Object.freeze(actor),
    state: Object.freeze(state),
    nextAnim,
    aim,
    canJump: !state.crouching && !state.climb && !state.landHard && !state.jumping && !state.noJump,
  });
}
