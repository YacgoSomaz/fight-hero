import assert from 'node:assert/strict';
import test from 'node:test';

import { getHudExperienceRenderPlan } from '../src/hud-experience-render-plan.mjs';

test('Hud 1540 expholder keeps its original 1474/1475/699 Display List, matrix, colour transform and dynamic Flash width', () => {
  const plan = getHudExperienceRenderPlan({ level: 5, exp: 100 });

  assert.deepEqual(plan, {
    holder: { x: 200.55, y: 588.45 },
    base: { source: './public/assets/original-swf/hud-exp-base-1474.svg', x: 0, y: 0 },
    green: { source: './public/assets/original-swf/hud-exp-green-1475.svg', x: 0, y: 0 },
    bar: {
      source: './public/assets/original-swf/hud-exp-fill-699-source.svg',
      sourceBounds: { width: 123.2, height: 12.2 },
      matrix: { a: 3.1491546630859375, b: 0, c: 0.6520538330078125, d: -0.5157470703125, x: -1.4, y: 8.4 },
      color: { red: 255, green: 255, blue: 0, alpha: 77 / 256 },
      width: 100 / 115 * 420,
      scaleX: 100 / 115 * 420 / (3.1491546630859375 * 123.2 + 0.6520538330078125 * 12.2),
    },
    text: { text: 'Exp 100 / 115', x: 78, y: -2, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10 },
  });
});

test('Hud 1540 expholder retains the source Level Maxed text and the full 420px bar width', () => {
  const plan = getHudExperienceRenderPlan({ level: 50, exp: 0 });
  assert.deepEqual({ width: plan.bar.width, text: plan.text.text }, { width: 420, text: 'Level Maxed' });
});
