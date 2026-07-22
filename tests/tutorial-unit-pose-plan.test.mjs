import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createTutorialUnitPosePlan } from '../src/tutorial-unit-pose-plan.mjs';

const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
const m4 = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));

test('a fixed Tutorial pose composes original root, M4 action and direct skin Shape layers without the hidden leg gun', () => {
  const pose = createTutorialUnitPosePlan({
    rootFrame: timeline.frames[0],
    rearAction: m4.actions.rifle.rear[0].items,
    frontAction: m4.actions.rifle.front[0].items,
    skinFrame: 57,
  });

  assert.deepEqual(pose.staticParts.map(({ id, character }) => ({ id, character })), [
    { id: 'foot2', character: 518 },
    { id: 'leglow2', character: 551 },
    { id: 'legup2', character: 581 },
    { id: 'foot1', character: 518 },
    { id: 'leglow1', character: 551 },
    { id: 'legup1', character: 581 },
    { id: 'body', character: 611 },
    { id: 'head', character: 645 },
  ]);
  assert.deepEqual(pose.staticParts.find(({ id }) => id === 'legup2').crop, { xMin: -5.5, xMax: 11.1, yMin: -2.95, yMax: 13.55 });
  assert.equal(pose.staticParts.some(({ character }) => character === 505), false);

  const rearUpper = pose.armParts.find(({ id }) => id === 'arm1.arm2up');
  assert.deepEqual(rearUpper.root, { x: 0.3, y: -42, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 });
  assert.deepEqual(rearUpper.local, { x: 4.55, y: -0.15, scaleX: 0.314422607421875, scaleY: 0.314422607421875, skewX: 0.887176513671875, skewY: -0.887176513671875 });
  assert.equal(rearUpper.character, 279);
  assert.equal(rearUpper.source, './public/assets/original-swf/unit-skin-shapes/279.png');

  assert.deepEqual(pose.gunParts.map(({ rootId, character, frame }) => ({ rootId, character, frame })), [
    { rootId: 'arm1', character: 375, frame: 20 },
  ]);
});

test('Tutorial pose applies UnitMC EnterFrame headhold and arm1hold x/y overrides before drawing direct Shapes', () => {
  const pose = createTutorialUnitPosePlan({
    rootFrame: timeline.frames[0],
    rearAction: m4.actions.rifle.rear[0].items,
    frontAction: m4.actions.rifle.front[0].items,
    skinFrame: 57,
  });
  assert.deepEqual(pose.staticParts.find(({ id }) => id === 'head').root, {
    x: 1.9, y: -49.4, scaleX: 0.9730224609375, scaleY: 0.97650146484375,
    skewX: 0.2154998779296875, skewY: -0.2312469482421875,
  });
  assert.deepEqual(pose.armParts.find(({ id }) => id === 'arm1.arm2up').root, {
    x: 0.3, y: -42, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0,
  });
});

test('Tutorial pose applies the source Unit arm/head rotation properties after holder placement and flips the whole UnitMC', () => {
  const pose = createTutorialUnitPosePlan({
    rootFrame: timeline.frames[0],
    rearAction: m4.actions.rifle.rear[0].items,
    frontAction: m4.actions.rifle.front[0].items,
    skinFrame: 57,
    aim: { armRotation: 90, headRotation: 0, flip: true },
  });
  assert.equal(pose.flip, true);
  assert.deepEqual(pose.armParts.find(({ id }) => id === 'arm1.arm2up').root, {
    x: 0.3, y: -42, scaleX: 0, scaleY: 0, skewX: 1, skewY: -1,
  });
});
