import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, step } from '../src/engine.mjs';
import { MAP_CROP, getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera } from '../src/camera.mjs';
import { getUnitRigPose } from '../src/unit-rig.mjs';

test('the web replica starts as a single-player scene with no P2 or AI simulation', () => {
  const world = createWorld();

  assert.equal(world.players.length, 1);
  assert.equal(world.players[0].id, 'p1');
  assert.equal(world.bots.length, 0);
});

test('the single player responds to independent left and right input', () => {
  const world = createWorld();
  const p1 = world.players[0];

  step(world, { p1: { right: true } }, 0.05);
  assert.ok(p1.x > p1.spawnX);
  step(world, { p1: { left: true, right: true } }, 0.05);
  assert.equal(p1.vx, 0);
});

test('walking selects the original running animation state instead of sliding an idle sprite', () => {
  const world = createWorld();

  step(world, { p1: { right: true } }, 1 / 60);

  assert.equal(world.players[0].animation, 'run');
});

test('the UnitMC rig drives opposite original-style leg phases while running', () => {
  const pose = getUnitRigPose({ animation: 'run', animationTime: 0.12, aimAngle: 0, facing: 1, recoil: 0 });

  assert.ok(Math.abs(pose.backLeg.rotation - pose.frontLeg.rotation) > 20);
  assert.equal(pose.state, 'run');
});

test('the UnitMC rig gives climbing its own hand-and-knee pose instead of reusing run', () => {
  const run = getUnitRigPose({ animation: 'run', animationTime: 0.12, aimAngle: 0, facing: 1, recoil: 0 });
  const climb = getUnitRigPose({ animation: 'climbbig', animationTime: 0.12, aimAngle: 0, facing: 1, recoil: 0 });

  assert.equal(climb.state, 'climbbig');
  assert.ok(climb.frontArm.y < run.frontArm.y);
  assert.ok(climb.frontLeg.y < run.frontLeg.y);
});

test('the original-style torso, arms, gun and head turn together toward mouse aim', () => {
  const pose = getUnitRigPose({ animation: 'idle', animationTime: 0, aimAngle: -Math.PI / 4, facing: 1, recoil: 0 });

  assert.ok(pose.frontArm.rotation < -20);
  assert.equal(pose.frontArm.rotation, pose.backArm.rotation);
  assert.ok(pose.head.rotation < 0);
  assert.equal(pose.gun.rotation, pose.frontArm.rotation);
});

test('recoil pushes only the aim assembly back while preserving the lower-body walk cycle', () => {
  const normal = getUnitRigPose({ animation: 'run', animationTime: 0.2, aimAngle: 0, facing: 1, recoil: 0 });
  const recoil = getUnitRigPose({ animation: 'run', animationTime: 0.2, aimAngle: 0, facing: 1, recoil: 1 });

  assert.ok(recoil.gun.x < normal.gun.x);
  assert.equal(recoil.frontLeg.rotation, normal.frontLeg.rotation);
});

test('the player uses a narrow foot hitbox rather than the old circular body radius', () => {
  const world = createWorld();
  const p1 = world.players[0];

  assert.equal(p1.hitbox.halfWidth, 13);
  assert.equal(p1.hitbox.height, 62);
});

test('a falling player lands with feet exactly on a visible platform top', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const platform = world.config.platforms[1];
  p1.x = platform.x + platform.width / 2;
  p1.y = platform.y - 90;
  p1.vy = 0;
  p1.grounded = false;

  for (let i = 0; i < 30; i += 1) step(world, {}, 1 / 60);
  assert.equal(p1.y, platform.y);
  assert.equal(p1.grounded, true);
});

test('a continuous map collider blocks the player from walking through a platform edge', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const platform = world.config.platforms[1];
  p1.x = platform.x - p1.hitbox.halfWidth - 1;
  p1.y = platform.y + 10;
  p1.vy = 0;
  p1.grounded = false;

  step(world, { p1: { right: true } }, 0.05);

  assert.equal(p1.x, platform.x - p1.hitbox.halfWidth);
});

test('a continuous map collider prevents jumping upward through a platform underside', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const platform = world.config.platforms[1];
  p1.x = platform.x + platform.width / 2;
  p1.y = platform.y + platform.height + p1.hitbox.height + 4;
  p1.vy = -800;
  p1.grounded = false;

  step(world, {}, 0.05);

  assert.equal(p1.y, platform.y + platform.height + p1.hitbox.height);
});

test('falling into a short reachable ledge begins the original-style climb and finishes on top', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const platform = world.config.platforms[1];
  p1.x = platform.x - p1.hitbox.halfWidth - 3;
  p1.y = platform.y + 44;
  p1.vy = 120;
  p1.grounded = false;

  step(world, { p1: { right: true } }, 1 / 60);
  assert.equal(p1.animation, 'climbbig');

  for (let frame = 0; frame < 18; frame += 1) step(world, { p1: { right: true } }, 1 / 60);
  assert.equal(p1.y, platform.y);
});

test('a player can jump only from a platform and returns to that same foot level', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const platform = world.config.platforms[1];
  p1.x = platform.x + platform.width / 2;
  p1.y = platform.y;
  p1.grounded = true;

  step(world, { p1: { jump: true } }, 1 / 60);
  assert.ok(p1.vy < 0);
  for (let i = 0; i < 180; i += 1) step(world, {}, 1 / 60);
  assert.equal(p1.y, platform.y);
});

test('firing creates a brief original-muzzle event independently from its tracer', () => {
  const world = createWorld();

  step(world, { p1: { fire: true } }, 1 / 60);
  assert.equal(world.muzzleFlashes.length, 1);
  assert.equal(world.muzzleFlashes[0].owner, 'p1');
  assert.ok(world.bullets.length > 0);
  assert.ok(world.players[0].crosshairSpread > world.players[0].crosshairRestSpread);
  assert.equal(world.players[0].recoil, 1);
  step(world, {}, 0.05);
  step(world, {}, 0.05);
  assert.equal(world.muzzleFlashes.length, 0);
  assert.ok(world.bullets.length > 0);
});

test('weapon recoil settles independently after the shot so the rig can recover its aim pose', () => {
  const world = createWorld();

  step(world, { p1: { fire: true } }, 1 / 60);
  step(world, {}, 0.05);

  assert.ok(world.players[0].recoil < 1 && world.players[0].recoil > 0);
});

test('a short left-click press is retained long enough to fire exactly once', () => {
  const world = createWorld();

  step(world, { p1: { firePressed: true } }, 1 / 60);

  assert.equal(world.bullets.length, 1);
});

test('mouse aim turns the player and sends the tracer toward the cursor', () => {
  const world = createWorld();
  const p1 = world.players[0];

  step(world, { p1: { aimX: p1.x - 220, aimY: p1.y - 170, fire: true } }, 1 / 60);

  assert.equal(p1.facing, -1);
  assert.ok(p1.aimAngle < 0);
  assert.equal(world.bullets.length, 1);
  assert.ok(world.bullets[0].vx < 0);
  assert.ok(world.bullets[0].vy < 0);
  assert.ok(world.muzzleFlashes[0].x < p1.x);
});

test('the camera follows the player through the map while remaining inside map bounds', () => {
  const config = { width: 2591, height: 1457 };
  const first = getFollowCamera({ x: 900, y: 1000, facing: 1 }, config, 1280, 720);
  const second = getFollowCamera({ x: 1500, y: 1000, facing: 1 }, config, 1280, 720);

  assert.ok(second.x > first.x);
  assert.ok(first.x >= 640);
  assert.ok(second.x <= config.width - 640);
});

test('moving the mouse across the player does not reverse or snap the camera', () => {
  const config = { width: 2591, height: 1457 };
  const rightAim = getFollowCamera({ x: 1300, y: 1000, facing: 1 }, config, 1280, 720);
  const leftAim = getFollowCamera({ x: 1300, y: 1000, facing: -1 }, config, 1280, 720);
  const advanced = smoothCamera({ x: 900, y: 800, zoom: 1 }, rightAim, 1 / 60);

  assert.deepEqual(leftAim, rightAim);
  assert.ok(advanced.x > 900 && advanced.x < rightAim.x);
});

test('the follow camera renders a local source window and converts mouse coordinates back to world space', () => {
  const camera = getFollowCamera({ x: 1300, y: 1000, facing: 1 }, { width: 2591, height: 1457 }, 1280, 720);
  const source = getMapSourceRect(camera, 1280, 720);
  const worldPoint = screenToWorld({ x: 640, y: 360 }, camera, 1280, 720);

  assert.equal(source.width, 1280);
  assert.equal(source.height, 720);
  assert.ok(source.x > MAP_CROP.x);
  assert.deepEqual(worldPoint, { x: camera.x, y: camera.y });
});
