import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';
import { createTutorialActorRenderPlan } from '../src/tutorial-actor-render-plan.mjs';

const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
const m4 = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));
const actors = createTutorialActorBindings(createCampaignOneSession()).actors;

test('Tutorial actor render plan combines a spawned original Campaign actor with source root and M4 action frames', () => {
  const plan = createTutorialActorRenderPlan({ actor: actors[0], rootState: { frame: 1, animation: 'idle', stopped: false }, actionState: { label: 'rifle_fire', index: 1 }, unitTimeline: timeline, m4Runtime: m4 });
  assert.deepEqual(
    { actorId: plan.actorId, skinFrame: plan.skinFrame, rootFrame: plan.rootFrame, rootAnimation: plan.rootAnimation, armFrame: plan.arm.frame, gun: plan.pose.gunParts.map(({ rootId, character, frame }) => ({ rootId, character, frame })) },
    { actorId: 'unit0', skinFrame: 57, rootFrame: 1, rootAnimation: 'idle', armFrame: 79, gun: [{ rootId: 'arm1', character: 375, frame: 20 }] },
  );
});

test('Tutorial actor render plan refuses unspawned or source-incomplete actor inputs instead of using a generic fallback', () => {
  assert.throws(() => createTutorialActorRenderPlan({ actor: actors[4], rootState: { frame: 1, animation: 'idle', stopped: false }, actionState: { label: 'rifle', index: 0 }, unitTimeline: timeline, m4Runtime: m4 }), /has not spawned/);
  assert.throws(() => createTutorialActorRenderPlan({ actor: actors[0], rootState: { frame: 450, animation: 'idle', stopped: false }, actionState: { label: 'rifle', index: 0 }, unitTimeline: timeline, m4Runtime: m4 }), /root frame is unavailable/);
});
