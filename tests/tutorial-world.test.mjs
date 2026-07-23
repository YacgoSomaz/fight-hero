import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTutorialWorldGameTick, applyTutorialBulletEnvironmentHit, applyTutorialFootContact, createTutorialWorld } from '../src/tutorial-world.mjs';

function sourceWallSet() {
  const frame1 = { id: 'wall-1', isSolid: () => true, colorAt: () => 'ff00ff' };
  const frame2 = { id: 'wall-2', isSolid: () => true, colorAt: () => 'ff00ff' };
  const frame9 = { id: 'wall-9', isSolid: () => true, colorAt: () => '9900ff' };
  const frame10 = { id: 'wall-10', isSolid: () => true, colorAt: () => '9900ff' };
  return {
    at(frame) {
      if (frame === 1) return frame1;
      if (frame === 2) return frame2;
      if (frame === 9) return frame9;
      if (frame === 10) return frame10;
      throw new RangeError(`missing source frame ${frame}`);
    },
    frames: { frame1, frame2, frame9, frame10 },
  };
}

// User journey: the original Campaign 1 elevator branch only advances when a
// bullet hits the 9900ff pixel in Wall_tut frame 9.  Its effects must change
// the wall frame and the active collision surface together, never leave a
// session claiming frame 10 while physics still uses the old image.
test('Tutorial world atomically replaces its original wall surface after the source elevator hit', () => {
  const walls = sourceWallSet();
  const world = createTutorialWorld({ wallSet: walls });
  world.session.runtime.state = 9;
  world.session.map.wallFrame = 9;
  world.wall = walls.at(9);

  const effects = applyTutorialBulletEnvironmentHit(world, { x: 2510, y: 630 });

  assert.equal(effects.some((effect) => effect.type === 'changeWallFrame' && effect.frameLabel === 10), true);
  assert.equal(world.session.runtime.state, 10);
  assert.equal(world.session.map.wallFrame, 10);
  assert.equal(world.wall, walls.frames.frame10);
});

test('Tutorial world ignores a non-source-colour bullet hit without changing walls', () => {
  const walls = sourceWallSet();
  const world = createTutorialWorld({ wallSet: walls });
  world.session.runtime.state = 9;

  assert.deepEqual(applyTutorialBulletEnvironmentHit(world, { x: 0, y: 0 }), []);
  assert.equal(world.session.runtime.state, 9);
  assert.equal(world.session.map.wallFrame, 1);
  assert.equal(world.wall, walls.frames.frame1);
});

test('Tutorial world advances its human foot trigger only from the current original wall pixel', () => {
  const walls = sourceWallSet();
  const world = createTutorialWorld({ wallSet: walls });

  const effects = applyTutorialFootContact(world, { x: 285, y: 706, human: true });

  assert.equal(effects.some((effect) => effect.type === 'changeWallFrame' && effect.frameLabel === 2), true);
  assert.deepEqual(world.session.runtime, { state: 2, frame: 0 });
  assert.equal(world.session.map.wallFrame, 2);
  assert.equal(world.wall, walls.frames.frame2);
});

// The browser world must hand its one session and its current decoded wall to
// the Game.EnterFrame port.  In particular, a line bullet may atomically
// replace wallMC inside the actor walk, before the next Unit sees collision.
test('Tutorial world drives Campaign 1 through the source Game tick and current wall surface', () => {
  const walls = sourceWallSet();
  // This tick-order fixture is not a collision fixture. A fully-solid fake
  // wall would make Movement.as's escape probe intentionally throw.
  for (const wall of Object.values(walls.frames)) wall.isSolid = () => false;
  const world = createTutorialWorld({ wallSet: walls, random: () => 0.999 });
  world.session.runtime.state = 99;
  for (const actor of world.session.actors) {
    if (actor.status) actor.status.sSpawn = 0;
  }
  world.session.actors[0].gunRuntime.mDown = true;
  const bullets = [];

  const result = advanceTutorialWorldGameTick(world, {
    onLineBullet(event) { bullets.push(event); },
  });

  assert.equal(world.tickRuntime.session, world.session);
  assert.deepEqual(bullets.map(({ actorId, bullet }) => `${actorId}:${bullet.gunId}`), ['unit0:M4']);
  assert.equal(result.trace.at(0).phase, 'campaign');
  assert.equal(result.trace.at(1).phase, 'environment');
  assert.equal(result.trace.at(2).phase, 'hud');
  assert.equal(result.trace.at(-1).phase, 'match');
});

test('Tutorial world reads the human foot pixel inside the source Unit tail', () => {
  const walls = sourceWallSet();
  for (const wall of Object.values(walls.frames)) wall.isSolid = () => false;
  const world = createTutorialWorld({ wallSet: walls, random: () => 0.999 });
  for (const actor of world.session.actors) {
    if (actor.status) actor.status.sSpawn = 0;
  }

  const result = advanceTutorialWorldGameTick(world);

  const playerTail = result.trace.findIndex(({ phase, actorId }) => phase === 'unitTail' && actorId === 'unit0');
  const surface = result.trace.findIndex(({ phase, actorId }) => phase === 'surface' && actorId === 'unit0');
  const bot = result.trace.findIndex(({ phase, actorId }) => phase === 'ai' && actorId === 'unit1');
  assert.ok(playerTail > -1 && surface > playerTail && bot > surface);
  assert.deepEqual(world.session.runtime, { state: 2, frame: 0 });
  assert.equal(world.session.map.wallFrame, 2);
  assert.equal(world.wall, walls.frames.frame2);
});
