import assert from 'node:assert/strict';
import test from 'node:test';

import { getFoundryForegroundRuntimePlan } from '../src/foundry-foreground-runtime.mjs';

test('Foundry source frame 32 selects the original water and pot SVG frames that share the wallMC trigger frame', () => {
  const plan = getFoundryForegroundRuntimePlan({
    mapId: 'foundry',
    timelineFrame: 32,
    source: { x: 1000, y: 100, width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
  });

  assert.deepEqual(plan, {
    mapId: 'foundry',
    timelineFrame: 32,
    wallFrame: 2,
    layers: [
      { depth: 1, character: 1242, frame: 1, type: 'png', source: './public/assets/original-swf/foundry-foreground-1242/1.png', left: -1154.6, top: -168, width: 3102, height: 947 },
      { depth: 2, character: 1252, frame: 32, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1252-svg/32.svg', left: 158.02333374023442, top: 563.6, width: 301.9761657714844, height: 97.35 },
      { depth: 7, character: 1258, frame: 32, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1258-svg/32.svg', left: 31, top: -220.05, width: 550.95, height: 904.35 },
    ],
  });
});

test('Foundry foreground repeats only its 76-frame child while retaining the original 306-frame pot and wall state', () => {
  const plan = getFoundryForegroundRuntimePlan({
    mapId: 'foundry2',
    timelineFrame: 130,
    source: { x: 0, y: 0, width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
  });

  assert.deepEqual({ mapId: plan.mapId, waterFrame: plan.layers[1].frame, potFrame: plan.layers[2].frame, wallFrame: plan.wallFrame }, {
    mapId: 'foundry2', waterFrame: 54, potFrame: 130, wallFrame: 1,
  });
});
