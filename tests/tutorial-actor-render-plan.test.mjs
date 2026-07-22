import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';
import { getTutorialActorRenderPlan } from '../src/tutorial-actor-render-plan.mjs';

test('Tutorial source actors point at their own extracted UnitMC skin frames', () => {
  const bindings = createTutorialActorBindings(createCampaignOneSession());
  const plan = getTutorialActorRenderPlan(bindings);

  assert.deepEqual(plan.map(({ id, source, visible }) => ({ id, source, visible })), [
    { id: 'unit0', source: './public/assets/unit-frames/57.png', visible: true },
    { id: 'unit1', source: './public/assets/unit-frames/105.png', visible: true },
    { id: 'unit2', source: './public/assets/unit-frames/155.png', visible: true },
    { id: 'unit3', source: './public/assets/unit-frames/55.png', visible: true },
    { id: 'unit4', source: './public/assets/unit-frames/151.png', visible: false },
  ]);
  for (const actor of plan) assert.ok(fs.statSync(new URL(`../${actor.source.slice(2)}`, import.meta.url)).size > 0, `missing raw source skin ${actor.unitFrame}`);
});
