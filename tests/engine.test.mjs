import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { UNITMC_FRAMES, createWorld, hasLineOfSight, isSolid, step } from '../src/engine.mjs';
import { MAP_CROP, getFollowCamera, getMapSourceRect, screenToWorld, smoothCamera } from '../src/camera.mjs';
import { FOUNDRY_LAYOUT } from '../src/foundry-layout.mjs';
import { getUnitRigPose } from '../src/unit-rig.mjs';

test('the web replica starts with a local player and a migrated AI opponent', () => {
  const world = createWorld();

  assert.equal(world.players.length, 2);
  assert.equal(world.players[0].id, 'p1');
  assert.equal(world.bots.length, 1);
  assert.equal(world.bots[0].isBot, true);
});

test('Foundry uses the decoded Arena wall dimensions, spawns, and navigation nodes', () => {
  const world = createWorld({ foundry: true });

  assert.equal(world.config.width, 2874);
  assert.equal(world.config.height, 863);
  const p1Spawn = FOUNDRY_LAYOUT.spawns.find((spawn) => spawn.name === 'b_0');
  assert.deepEqual({ x: world.players[0].spawnX, y: world.players[0].spawnY }, { x: p1Spawn.x, y: p1Spawn.y });
  assert.equal(world.navigation.length, 17);
  assert.equal(world.actions.length, 21);
  assert.equal(FOUNDRY_LAYOUT.collisionBoxes.length, 33);
  assert.equal(FOUNDRY_LAYOUT.spawns.length, 31);
  assert.equal(world.pickups.length, 4);
});

test('Foundry player collision uses the complete decoded blue rectangles', () => {
  const world = createWorld({ foundry: true, bots: false });
  const crate = FOUNDRY_LAYOUT.collisionBoxes.find((box) => Math.abs(box.x - 491.15) < .01);
  const calibratedCrate = world.collisionBoxes.find((box) => Math.abs(box.x - 491.15) < .01);
  const floor = world.collisionBoxes.find((box) => box.x < 600 && box.width > 900 && box.y > 690);

  assert.ok(crate);
  assert.ok(calibratedCrate);
  assert.ok(floor);
  assert.equal(calibratedCrate.y, crate.y + 24, 'all rendered/physical rectangles share the crate registration calibration');
  assert.equal(isSolid(world, 485, floor.y), true);
  assert.equal(isSolid(world, crate.x, crate.y), true, 'the crate is a decoded blue collision volume');
  assert.equal(isSolid(world, 1200, 550), false, 'unmarked Foundry artwork cannot create a wall');
});

test('Foundry rectangles land on their exact top edge and block their side face', () => {
  const world = createWorld({ foundry: true, bots: false });
  const p1 = world.players[0];
  const crate = world.collisionBoxes.find((box) => Math.abs(box.x - 491.15) < .01);
  const top = crate.y - crate.height / 2;
  const left = crate.x - crate.width / 2;

  p1.x = crate.x; p1.y = top - 5; p1.vy = 200; p1.grounded = false;
  step(world, {}, .05);
  assert.equal(p1.y, top);
  assert.equal(p1.grounded, true);

  p1.x = left - p1.hitbox.halfWidth - 1; p1.y = crate.y; p1.vy = 0; p1.grounded = false;
  step(world, { p1: { right: true } }, .05);
  assert.equal(p1.x, left - p1.hitbox.halfWidth);
});

test('Foundry AI patrols through decoded Arena nodes when it has no target', () => {
  const world = createWorld({ foundry: true });
  const bot = world.bots[0];
  bot.ai.scanFrame = -1;

  step(world, {}, 1 / 60);

  assert.equal(bot.ai.navIndex, 7);
  assert.ok(bot.vx > 0);
});

test('the alpha wall lets a player step smoothly onto a shallow ledge', () => {
  const wall = { isSolid: (x, y) => y >= 620 || (x >= 510 && y >= 608) };
  const world = createWorld({ bots: false, wall });
  const p1 = world.players[0];
  p1.x = 496; p1.y = 620; p1.grounded = true;

  step(world, { p1: { right: true } }, 0.05);

  assert.ok(p1.x > 496);
  assert.ok(p1.y < 620);
  assert.equal(p1.grounded, true);
});

test('a side collision with a tall crate does not hoist the centre foot onto its top', () => {
  const wall = { isSolid: (x, y) => y >= 620 || (x >= 510 && x <= 570 && y >= 570) };
  const world = createWorld({ bots: false, wall });
  const p1 = world.players[0];
  p1.x = 493; p1.y = 619; p1.grounded = true;

  step(world, { p1: { right: true } }, 0.05);

  assert.equal(p1.x, 493, 'the horizontal body probe stops at the crate face');
  assert.equal(p1.y, 619, 'only the centre foot can start a step onto the crate');
  assert.equal(p1.grounded, true);
});

test('the alpha wall snaps feet to the first opaque collision pixel', () => {
  const world = createWorld({ bots: false, wall: { isSolid: (_x, y) => y >= 620 } });
  const p1 = world.players[0];
  p1.y = 618; p1.grounded = false; p1.vy = 100;

  step(world, { p1: {} }, 1 / 60);

  assert.equal(p1.y, 619);
  assert.equal(p1.grounded, true);
});

test('the alpha wall triggers the original small/big climb state on a reachable ledge', () => {
  const wall = { isSolid: (x, y) => y >= 620 || (x >= 510 && y >= 570) };
  const world = createWorld({ bots: false, wall });
  const p1 = world.players[0];
  p1.x = 496; p1.y = 620; p1.grounded = false; p1.vy = 80;

  step(world, { p1: { right: true } }, 1 / 60);

  assert.equal(p1.animation, 'climbbig');
  for (let frame = 0; frame < 18; frame += 1) step(world, { p1: { right: true } }, 1 / 60);
  assert.ok(p1.y <= 573, 'the climb completes on top of the raised wall');
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

test('UnitMC frame labels use the original jump and backwards-running spans', () => {
  assert.deepEqual(UNITMC_FRAMES.run, [21, 38]);
  assert.deepEqual(UNITMC_FRAMES.runback, [58, 75]);
  assert.deepEqual(UNITMC_FRAMES.jump, [191, 208]);
  assert.deepEqual(UNITMC_FRAMES.fall, [209, 229]);
  assert.deepEqual(UNITMC_FRAMES.climbbig, [397, 408]);
});

test('the browser receives every decoded UnitMC body-part matrix without skin switching', () => {
  const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
  const required = ['arm1', 'foot2', 'leglow2', 'legup2', 'foot1', 'leglow1', 'legup1', 'body', 'headhold', 'arm1hold', 'head', 'arm2'];

  assert.equal(timeline.sourceSymbol, 669);
  assert.equal(timeline.frames.length, 449);
  for (const frame of [timeline.frames[0], timeline.frames[20], timeline.frames[190], timeline.frames[391]]) {
    assert.deepEqual(frame.map((item) => item[0]), required);
    assert.ok(frame.every((item) => item.length === 7 && item.slice(1).every(Number.isFinite)));
  }
});

test('moving opposite the aiming direction selects UnitMC runback frames', () => {
  const world = createWorld({ bots: false });
  const player = world.players[0];
  step(world, { p1: { left: true, aimX: player.x + 150, aimY: player.y - 40 } }, 1 / 60);
  assert.equal(player.animation, 'runback');
  assert.equal(player.animationFrame, UNITMC_FRAMES.runback[0]);
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

test('the player uses the original centre foot point and ±17 side probes', () => {
  const world = createWorld();
  const p1 = world.players[0];

  assert.equal(p1.hitbox.halfWidth, 17);
  assert.equal(p1.hitbox.height, 55);
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

test('the reverse run label reverses the original leg phase without freezing the aim rig', () => {
  const forward = getUnitRigPose({ animation: 'run', animationTime: 0.12, aimAngle: 0.25, facing: 1 });
  const backward = getUnitRigPose({ animation: 'runback', animationTime: 0.12, aimAngle: 0.25, facing: 1 });

  assert.equal(backward.state, 'runback');
  assert.equal(backward.frontArm.rotation, forward.frontArm.rotation);
  assert.equal(backward.frontLeg.rotation, -forward.frontLeg.rotation);
});

test('manual and empty-clip reloads preserve the original clip/spare-ammo rule', () => {
  const world = createWorld({ bots: false });
  const p1 = world.players[0];
  p1.weapon.clip = 1;
  p1.weapon.spare = 7;

  step(world, { p1: { firePressed: true } }, 1 / 60);
  assert.equal(p1.weapon.clip, 0);
  assert.ok(p1.weapon.reloadRemaining > 0);
  for (let frame = 0; frame < 60; frame += 1) step(world, {}, 1 / 60);
  assert.equal(p1.weapon.clip, 7);
  assert.equal(p1.weapon.spare, 0);
});

test('a crouched unit remains crouched if the original two head-clearance samples are solid', () => {
  const world = createWorld({ bots: false, wall: { isSolid: (x, y) => y >= 620 || (y < 580 && y > 570 && (Math.abs(x - 872) < 20 || Math.abs(x - 838) < 20)) } });
  const p1 = world.players[0];
  p1.x = 855;
  p1.y = 620;

  step(world, { p1: { down: true } }, 1 / 60);
  step(world, { p1: {} }, 1 / 60);
  assert.equal(p1.crouching, true);
  assert.equal(p1.animation, 'duck');
});

test('the extracted wall mask is used for exact collision, bullets, and AI line of sight', () => {
  const wall = { isSolid: (x) => x >= 500 && x <= 520 };
  const world = createWorld({ bots: false, wall });

  assert.equal(isSolid(world, 510, 200), true);
  assert.equal(hasLineOfSight(world, { x: 400, y: 200 }, { x: 600, y: 200 }), false);
  assert.equal(hasLineOfSight(world, { x: 400, y: 200 }, { x: 450, y: 200 }), true);
});

test('a bullet applies hit feedback, damage, a score, and a timed respawn', () => {
  const world = createWorld();
  const p1 = world.players[0];
  const bot = world.bots[0];
  p1.x = 400; p1.y = 500; bot.x = 500; bot.y = 500; bot.hp = 1;

  step(world, { p1: { aimX: bot.x, aimY: bot.y - 47, firePressed: true } }, 1 / 60);
  for (let frame = 0; frame < 8; frame += 1) step(world, {}, 1 / 60);
  assert.equal(bot.alive, false);
  assert.equal(world.score.p1, 1);
  assert.ok(world.hitEffects.length > 0);
  for (let frame = 0; frame < 150; frame += 1) step(world, {}, 1 / 60);
  assert.equal(bot.alive, true);
  assert.equal(bot.hp, bot.maxHp);
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

test('Foundry camera samples its extracted bitmap directly without the retired laboratory offset', () => {
  const world = createWorld({ foundry: true });
  const camera = getFollowCamera(world.players[0], world.config, 1280, 720);
  const source = getMapSourceRect(camera, 1280, 720);

  assert.deepEqual(MAP_CROP, { x: 0, y: 0, width: 2874, height: 863 });
  assert.ok(source.x >= 0 && source.y >= 0);
  assert.ok(source.x + source.width <= world.config.width);
  assert.ok(source.y + source.height <= world.config.height);
});
