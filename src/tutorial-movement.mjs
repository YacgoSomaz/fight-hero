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
  if ((keys & TUTORIAL_MOVEMENT_KEYS.LEFT) && !state.landHard) {
    if (actor.human && actor.noAim) aim = { x: position.x - 200, y: position.y };
    if (state.crouching) {
      nextAnim = actor.flip ? 'duckrun' : `duckrun${actor.noAim && actor.human ? '' : back}`;
      state.xVel += (state.jumping ? -SOURCE.xAirAcc : -SOURCE.xAcc) * state.modSpeed;
      state.xVel = Math.max(state.xVel, -SOURCE.xCrouchMax * state.modMax);
    } else {
      nextAnim = `${actor.flip ? 'run' : `run${actor.noAim && actor.human ? '' : back}`}${actor.runType ?? ''}`;
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
      nextAnim = `${actor.flip ? `run${actor.noAim && actor.human ? '' : back}` : 'run'}${actor.runType ?? ''}`;
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

function resolveTerminalFall({ state, position, wall, keys, nextAnim }) {
  if (!sourceHitTest(wall, position, 0, -50)) {
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
  } else {
    // This is the source's terminal-speed ceiling recovery loop.
    position.y += 1;
  }
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

  displaceUntilFree(position, wall, [[0, state.climb ? 6 : 8]], 0, 0.5);
  if (sourceHitTest(wall, position, 0, 1)) {
    if (state.falltimer >= 1.3 * 30) state.landHard = true;
    if (state.yVel > 0) {
      if (keys & TUTORIAL_MOVEMENT_KEYS.LEFT) nextAnim = `${actor.flip ? 'landrun' : 'landrunback'}${actor.runType ?? ''}`;
      else if (keys & TUTORIAL_MOVEMENT_KEYS.RIGHT) nextAnim = `${actor.flip ? 'landrunback' : 'landrun'}${actor.runType ?? ''}`;
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
      nextAnim = resolveTerminalFall({ state, position, wall, keys, nextAnim });
    }
  }

  return Object.freeze({
    actor: Object.freeze(actor),
    state: Object.freeze(state),
    nextAnim,
    aim,
    canJump: !state.crouching && !state.climb && !state.landHard && !state.jumping && !state.noJump,
  });
}
