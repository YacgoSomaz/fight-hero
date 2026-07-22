import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTutorialCorpseFrame, applyTutorialCorpseHit, createTutorialCorpse } from '../src/tutorial-corpse-runtime.mjs';

test('PhysWorld.createCorpse preserves the original PhysActor origin, mirrored parts and initial body/head impulses', () => {
  const target = {
    id: 'unit1', position: { x: 100, y: 100 }, scaleX: 1, skinFrame: 105,
    movement: { xVelocity: 2, yVelocity: -3 },
  };
  const attacker = { id: 'unit0', position: { x: 50, y: 100 } };
  const corpse = createTutorialCorpse({
    target, attacker, gun: { id: 'USP2', force: 3, splash: 0 }, extra: { headMult: 1.5 }, random: () => 0.5,
  });

  assert.deepEqual({ id: corpse.id, sourceUnitId: corpse.sourceUnitId, position: corpse.position, flip: corpse.flip, skinFrame: corpse.skinFrame, partCount: corpse.parts.length }, {
    id: 'corpse-unit1', sourceUnitId: 'unit1', position: { x: 100, y: 60 }, flip: 1, skinFrame: 105, partCount: 14,
  });
  assert.deepEqual(corpse.parts.slice(0, 3).map(({ kind, position }) => ({ kind, position })), [
    { kind: 'hand', position: { x: 119, y: 68 } },
    { kind: 'lowerArm', position: { x: 111, y: 68 } },
    { kind: 'upperArm', position: { x: 101, y: 61 } },
  ]);
  assert.deepEqual(corpse.bodyImpulses, [{ x: 0, y: 0 }, { x: 2, y: -3 }, { x: 3, y: 0 }]);
  assert.ok(Math.abs(corpse.headImpulses[0].x - 7.844645405527361) < 1e-12);
  assert.ok(Math.abs(corpse.headImpulses[0].y + 1.5689290811054724) < 1e-12);
});

test('PhysActor.EnterFrame removes a corpse exactly on source frame 150', () => {
  const corpse = createTutorialCorpse({
    target: { id: 'unit1', position: { x: 0, y: 40 }, scaleX: -1, skinFrame: 5, movement: { xVelocity: 0, yVelocity: 0 } },
    attacker: { id: 'unit0', position: { x: 10, y: 40 } }, gun: { id: 'USP2', force: 0, splash: 0 }, extra: {}, random: () => 0.5,
  });
  corpse.fc = 149;

  assert.deepEqual(advanceTutorialCorpseFrame(corpse), { removed: true });
  assert.equal(corpse.removed, true);
});

test('PhysWorld.createCorpse preserves source sky9 splash force and source input requirements', () => {
  const target = { id: 'unit2', position: { x: 0, y: 40 }, scaleX: -1, skinFrame: 5, movement: { xVelocity: 0, yVelocity: 0 } };
  const extra = { hitX: 0, hitY: 40 };
  const corpse = createTutorialCorpse({
    target, attacker: { id: 'unit0', position: { x: 0, y: 40 } }, gun: { id: 'RPG', force: 2, splash: 100 }, extra, useMod: 'sky9', random: () => 0.5,
  });

  assert.deepEqual(corpse.parts.slice(0, 3).map(({ position }) => position), [{ x: -19, y: 8 }, { x: -11, y: 8 }, { x: -1, y: 1 }]);
  assert.deepEqual(extra, { hitX: 0, hitY: 41 });
  assert.deepEqual(corpse.bodyImpulses.at(-1), { x: 0, y: -6 });
  assert.deepEqual(advanceTutorialCorpseFrame(corpse), { removed: false });
  assert.throws(() => createTutorialCorpse({ target: { id: 'bad' }, attacker: { position: { x: 0, y: 0 } }, gun: { force: 0, splash: 0 }, extra: {} }), /PhysActor requires target/);
});

// User journey: an original Bullet that reaches an existing PhysActor must
// not silently stop. PhysWorld.hitCorpse() distributes its narrow random
// impulse and then applies the original weapon force from the shooter.
test('PhysWorld.hitCorpse preserves per-part narrow impulse and source gun force', () => {
  const corpse = createTutorialCorpse({
    target: { id: 'unit1', position: { x: 100, y: 100 }, scaleX: 1, skinFrame: 5, movement: { xVelocity: 0, yVelocity: 0 } },
    attacker: { id: 'unit0', position: { x: 50, y: 100 } }, gun: { id: 'USP2', force: 0, splash: 0 }, extra: {}, random: () => 0.5,
  });
  const result = applyTutorialCorpseHit({
    corpse, attacker: { id: 'unit0', position: { x: 50, y: 100 } }, gun: { id: 'USP2', force: 3, splash: 0 }, extra: {}, random: () => 0.5,
  });

  assert.deepEqual(result, { applied: true, force: 3 });
  assert.deepEqual(corpse.parts[0].impulses.at(-1), { x: 0, y: 0 });
  assert.ok(Math.abs(corpse.bodyImpulses.at(-1).x - 2.342606428329091) < 1e-12);
  assert.ok(Math.abs(corpse.bodyImpulses.at(-1).y + 1.8740851426632728) < 1e-12);
});
