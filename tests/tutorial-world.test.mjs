import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTutorialBulletEnvironmentHit, createTutorialWorld } from '../src/tutorial-world.mjs';

function sourceWallSet() {
  const frame1 = { id: 'wall-1', isSolid: () => true, colorAt: () => 'ff00ff' };
  const frame9 = { id: 'wall-9', isSolid: () => true, colorAt: () => '9900ff' };
  const frame10 = { id: 'wall-10', isSolid: () => true, colorAt: () => '9900ff' };
  return {
    at(frame) {
      if (frame === 1) return frame1;
      if (frame === 9) return frame9;
      if (frame === 10) return frame10;
      throw new RangeError(`missing source frame ${frame}`);
    },
    frames: { frame1, frame9, frame10 },
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
