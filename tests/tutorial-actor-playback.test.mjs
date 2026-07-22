import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { extractArmGunCallbacks } from '../private-assets/parse-arm-gun-callbacks.mjs';
import { extractUnitMCRootFrameActions } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';
import { beginTutorialActorGunAction, createTutorialActorPlayback, sampleTutorialActorPlayback, advanceTutorialActorPlayback, requestTutorialActorMotion } from '../src/tutorial-actor-playback.mjs';

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
