import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractArmGunCallbacks } from '../private-assets/parse-arm-gun-callbacks.mjs';
import { extractUnitMCRootFrameActions } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';
import { beginTutorialActorGunAction, createTutorialActorPlayback, sampleTutorialActorPlayback, advanceTutorialActorPlayback, requestTutorialActorMotion, synchronizeTutorialActorWeapon } from '../src/tutorial-actor-playback.mjs';

const unitTimeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
const m4Runtime = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));
const unitMcSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/UnitMC.as', import.meta.url), 'utf8');
const armSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/MBFZ_fla/arm_gun_316.as', import.meta.url), 'utf8');
const source = {
  unitTimeline,
  rootFrameActions: extractUnitMCRootFrameActions(unitMcSource),
  m4Runtime,
  armCallbacks: extractArmGunCallbacks(armSource),
};
const [player, , , , unspawned] = createTutorialActorBindings(createCampaignOneSession()).actors;

test('a Tutorial actor starts with its own Campaign binding and samples the source idle pose', () => {
  const state = createTutorialActorPlayback(player);
  const sample = sampleTutorialActorPlayback(state, source);
  assert.deepEqual(
    { actorId: sample.actorId, skinFrame: sample.skinFrame, rootFrame: sample.rootFrame, armFrame: sample.arm.frame },
    { actorId: 'unit0', skinFrame: 57, rootFrame: 1, armFrame: 77 },
  );
});

test('a source M4 fire action exposes frames 78/79/80 and only returns to idle on UnitMC doneShoot', () => {
  let state = beginTutorialActorGunAction(createTutorialActorPlayback(player), 'fire');
  const frames = [];
  for (let tick = 0; tick < 3; tick += 1) {
    frames.push(sampleTutorialActorPlayback(state, source).arm.frame);
    state = advanceTutorialActorPlayback(state, source);
  }
  assert.deepEqual(frames, [78, 79, 80]);
  assert.deepEqual(
    { rootFrame: state.rootState.frame, action: state.actionState, events: state.events },
    { rootFrame: 4, action: { label: 'rifle', index: 0 }, events: ['doneShoot'] },
  );
});

test('Campaign Tutorial USP2 switch reuses pistol frames 3-8 and the source doneShoot callback at frame 8', () => {
  let state = synchronizeTutorialActorWeapon(createTutorialActorPlayback(player), 'USP2');
  state = beginTutorialActorGunAction(state, 'fire');
  const frames = [];
  for (let tick = 0; tick < 6; tick += 1) {
    const sample = sampleTutorialActorPlayback(state, source);
    frames.push({ armFrame: sample.arm.frame, gunFrame: sample.pose.gunParts[0]?.frame });
    state = advanceTutorialActorPlayback(state, source);
  }
  assert.deepEqual(frames, [
    { armFrame: 3, gunFrame: 2 }, { armFrame: 4, gunFrame: 2 }, { armFrame: 5, gunFrame: 2 },
    { armFrame: 6, gunFrame: 2 }, { armFrame: 7, gunFrame: 2 }, { armFrame: 8, gunFrame: 2 },
  ]);
  assert.deepEqual({ weaponId: state.weaponId, action: state.actionState, events: state.events }, {
    weaponId: 'USP2', action: { label: 'pistol', index: 0 }, events: ['doneShoot'],
  });
});

test('a USP2 fire action preserves its original MuzzleFlash_317 random frame for exactly the authored first pistol-fire frame', () => {
  let state = synchronizeTutorialActorWeapon(createTutorialActorPlayback(player), 'USP2');
  state = beginTutorialActorGunAction(state, 'fire', { random: () => 0.999 });
  const first = sampleTutorialActorPlayback(state, source);
  assert.deepEqual(first.pose.muzzleParts.map(({ rootId, character, frame, local }) => ({ rootId, character, frame, local })), [{
    rootId: 'arm1', character: 394, frame: 8,
    local: { x: 41.8, y: -12.3, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
  }]);
  state = advanceTutorialActorPlayback(state, source);
  assert.equal(state.actionState.muzzleFrame, undefined);
  assert.deepEqual(sampleTutorialActorPlayback(state, source).pose.muzzleParts, []);
});

test('a source tick that starts USP2 fire advances the UnitMC root but keeps the authored muzzle frame until the next arm tick', () => {
  let state = synchronizeTutorialActorWeapon(createTutorialActorPlayback(player), 'USP2');
  state = beginTutorialActorGunAction(state, 'fire', { random: () => 0 });
  state = advanceTutorialActorPlayback(state, source, { advanceArm: false });
  const first = sampleTutorialActorPlayback(state, source);
  assert.deepEqual({ rootFrame: state.rootState.frame, action: state.actionState, muzzle: first.pose.muzzleParts.map(({ frame }) => frame) }, {
    rootFrame: 2, action: { label: 'pistol_fire', index: 0, muzzleFrame: 1 }, muzzle: [1],
  });
  state = advanceTutorialActorPlayback(state, source);
  assert.deepEqual({ action: state.actionState, muzzle: sampleTutorialActorPlayback(state, source).pose.muzzleParts }, {
    action: { label: 'pistol_fire', index: 1 }, muzzle: [],
  });
});

test('Tutorial actor playback refuses a Campaign actor that has not spawned', () => {
  assert.throws(() => createTutorialActorPlayback(unspawned), /has not spawned/);
});

test('Tutorial movement requests the original UnitMC run label and keeps its decoded label frame', () => {
  const state = requestTutorialActorMotion(createTutorialActorPlayback(player), 'run1');

  assert.deepEqual(state.rootState, { frame: 21, animation: 'run1', stopped: false });
});

test('Tutorial movement cannot interrupt an original UnitMC climb with a synthetic idle pose', () => {
  const climbing = { ...createTutorialActorPlayback(player), rootState: { frame: 392, animation: 'climbsmall', stopped: false } };
  const state = requestTutorialActorMotion(climbing, 'idle');

  assert.deepEqual(state.rootState, { frame: 392, animation: 'climbsmall', stopped: false });
});
