import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TUTORIAL_MOVEMENT_KEYS,
  beginTutorialMovementJump,
  createTutorialMovementState,
  stepTutorialMovement,
} from '../src/tutorial-movement.mjs';

function wallAt(points) {
  const occupied = new Set(points.map(([x, y]) => `${Math.floor(x)},${Math.floor(y)}`));
  return {
    isSolid(x, y) {
      return occupied.has(`${Math.floor(x)},${Math.floor(y)}`);
    },
  };
}

function actor(overrides = {}) {
  return {
    position: { x: 100, y: 100 },
    flip: false,
    human: true,
    noAim: false,
    runType: '',
    ...overrides,
  };
}

// User journey: a player who stops crouching after leaving a low wall must
// regain their full-height collision body and be allowed to jump; the original
// Movement.as keeps crouching only while either +/-17,-45 head probe is solid.
test('source Movement clears a stale wall-crouch when both original head probes are free', () => {
  const state = createTutorialMovementState({ crouching: true });
  const result = stepTutorialMovement({
    state,
    actor: actor(),
    wall: wallAt([[100, 101]]),
    keys: 0,
  });

  assert.equal(result.state.crouching, false);
  assert.equal(result.canJump, true);
});

test('source Movement retains a wall-crouch only while a +/-17,-45 head probe is solid', () => {
  const state = createTutorialMovementState({ crouching: true });
  const result = stepTutorialMovement({
    state,
    actor: actor(),
    wall: wallAt([[83, 55], [100, 101]]),
    keys: 0,
  });

  assert.equal(result.state.crouching, true);
  assert.equal(result.canJump, false);
});

test('source Movement lands on the alpha wall at its original foot probe instead of floating', () => {
  const state = createTutorialMovementState({ yVel: 4, jumping: true, falltimer: 8 });
  const result = stepTutorialMovement({
    state,
    actor: actor({ position: { x: 100, y: 100 } }),
    wall: wallAt([[100, 105]]),
    keys: 0,
  });

  assert.deepEqual(result.actor.position, { x: 100, y: 104 });
  assert.equal(result.state.yVel, 0);
  assert.equal(result.state.jumping, false);
  assert.equal(result.nextAnim, 'land');
});

// Movement.as:357–368 has a second `!hitTest(0, -1)` guard while it resolves
// a foot collision.  Without it, a spawn partly overlapping its floor is
// pushed through the entire platform and the Tutorial camera follows it into
// empty map space.
test('source Movement stops resolving an initial foot overlap once the original head probe reaches the platform', () => {
  const result = stepTutorialMovement({
    state: createTutorialMovementState(),
    actor: actor({ position: { x: 285, y: 705 }, noAim: true }),
    wall: { isSolid: (_x, y) => Math.floor(y) >= 707 && Math.floor(y) <= 745 },
    keys: 0,
  });

  assert.equal(result.actor.position.y, 708);
  assert.equal(result.state.jumping, false);
  assert.equal(result.state.yVel, 0);
});

test('source Movement begins the small right-hand climb only at the original terminal-fall side probes', () => {
  const state = createTutorialMovementState({ yVel: 19.8, jumping: true });
  const result = stepTutorialMovement({
    state,
    actor: actor({ position: { x: 100, y: 100 } }),
    wall: wallAt([
      [118, 99], // after original right acceleration and y += 19.8: (17,-20)
    ]),
    keys: TUTORIAL_MOVEMENT_KEYS.RIGHT,
  });

  assert.equal(result.state.climb, 1);
  assert.equal(result.state.climbSize, 1);
  assert.equal(result.state.yVel, -7);
  assert.equal(result.nextAnim, 'climbsmall');
});

// User journey: the state-eight Tutorial route reaches a chest-high wall
// while still grounded. Movement.as executes its +/-17 side probes after
// *every* ground/fall resolution, not only at terminal fall; it must push
// back from the wall and begin the original small climb rather than walk
// through the Wall_tut alpha surface.
test('source Movement begins a grounded right-hand climb from the normal side-probe phase', () => {
  const result = stepTutorialMovement({
    state: createTutorialMovementState(),
    actor: actor({ position: { x: 100, y: 100 } }),
    wall: wallAt([
      [101, 101], // original (0,1) grounded foot after right acceleration
      [118, 80], // original (+17,-20) chest-height right side probe
    ]),
    keys: TUTORIAL_MOVEMENT_KEYS.RIGHT,
  });

  assert.equal(result.state.climb, 1);
  assert.equal(result.state.climbSize, 1);
  assert.equal(result.state.yVel, -7);
  assert.equal(result.nextAnim, 'climbsmall');
});

test('source Movement manual jump applies its authored boost and velocity only from a standing state', () => {
  const result = beginTutorialMovementJump({
    state: createTutorialMovementState(),
    actor: actor(),
  });

  assert.deepEqual(result.actor.position, { x: 100, y: 94 });
  assert.equal(result.state.yVel, -13);
  assert.equal(result.state.jumping, true);
  assert.equal(result.nextAnim, 'jump');
});

// Movement.as reads `unit.unitInfo.runType`, populated by Unit.setClass();
// the live Campaign actor need not duplicate that field at its root.  Losing
// this lookup emits synthetic `run` and makes UnitMC.goto() reject the
// original label during a real D-key press.
test('Campaign movement derives UnitMC run labels from the source unitInfo runType', () => {
  const result = stepTutorialMovement({
    state: createTutorialMovementState(),
    actor: actor({ position: { x: 285, y: 708 }, noAim: true, unitInfo: { runType: 1 } }),
    wall: { isSolid: (_x, y) => Math.floor(y) >= 709 },
    keys: TUTORIAL_MOVEMENT_KEYS.RIGHT,
  });

  assert.equal(result.nextAnim, 'run1');
});

test('source Movement derives its floor tilt from the original left/right ten-pixel wall probes', () => {
  const result = stepTutorialMovement({
    state: createTutorialMovementState(),
    actor: actor(),
    wall: wallAt([
      [100, 101], // centre foot: grounded
      [90, 100], // left (-10) probe first collision at offset 0
      [110, 110], // right (+10) probe first collision at offset 10
    ]),
    keys: 0,
  });

  assert.equal(result.state.tiltL, 0);
  assert.equal(result.state.tiltR, 10);
  assert.ok(Math.abs(result.state.rotation - 7.9695) < 0.0001);
});
