import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTutorialPlayerAim, canvasPointToTutorialStage, deriveTutorialUnitAim, tutorialArenaPointer } from '../src/tutorial-aim-runtime.mjs';

function near(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `expected ${actual} to be within ${epsilon} of ${expected}`);
}

test('Tutorial converts a canvas pointer through the original 800x600 stage into Arena-local mouse coordinates', () => {
  const stage = canvasPointToTutorialStage({ clientX: 210, clientY: 120 }, { left: 10, top: 20, width: 400, height: 300 });
  assert.deepEqual(stage, { x: 400, y: 200 });
  assert.deepEqual(tutorialArenaPointer(stage, { x: -170, y: -90 }), { x: 570, y: 290 });
});

test('Tutorial Player aim preserves the source half-step smoothing, arm-holder origin, one-tick flip rule, and off-screen noAim aimer', () => {
  const state = advanceTutorialPlayerAim({ aimX: 300, aimY: 50, aimRotation: 0, reloadRotation: 0 }, {
    actor: { position: { x: 100, y: 100 } },
    arenaMouse: { x: 310, y: 40 },
    armHolder: { x: 10, y: -20 },
    mcRotation: 0,
    jumping: false,
    noAim: false,
    reloading: false,
  });
  assert.deepEqual({ aimX: state.aimX, aimY: state.aimY, flip: state.flip, aimerStage: state.aimerStage }, {
    aimX: 305, aimY: 45, flip: false, aimerStage: null,
  });
  near(state.aimRotation, 79.82448915695684);
  near(state.armRotation, -10.175510843043156);
  near(state.headRotation, -6.105306505825894);

  const blocked = advanceTutorialPlayerAim(state, {
    actor: { position: { x: 100, y: 100 } },
    arenaMouse: { x: -900, y: -900 },
    armHolder: { x: 10, y: -20 },
    mcRotation: 0,
    jumping: false,
    noAim: true,
    reloading: false,
    stageMouse: { x: 401, y: 201 },
  });
  assert.deepEqual({ aimX: blocked.aimX, aimY: blocked.aimY, aimerStage: blocked.aimerStage }, {
    aimX: 305, aimY: 45, aimerStage: { x: -1000, y: -1000 },
  });
});

// User journey: a Campaign AI has already smoothed aimX/aimY inside AI.as.
// Its Unit.as EnterFrame must therefore use those exact coordinates for the
// arm/head transforms without applying Player's pointer half-step a second
// time.
test('Tutorial AI Unit aim maps its source target directly into UnitMC arm and head rotations', () => {
  const state = deriveTutorialUnitAim({ aimX: 300, aimY: 50, aimRotation: 0, reloadRotation: 0 }, {
    actor: { position: { x: 100, y: 100 } },
    armHolder: { x: 10, y: -20 },
    mcRotation: 0,
    unitRotation: 0,
    spinRotation: 0,
    jumping: false,
    reloading: false,
  });

  assert.deepEqual({ aimX: state.aimX, aimY: state.aimY, flip: state.flip }, { aimX: 300, aimY: 50, flip: false });
  near(state.aimRotation, 81.02737338510363);
  near(state.armRotation, -8.97262661489637);
  near(state.headRotation, -5.383575968937822);
});
