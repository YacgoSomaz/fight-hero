import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('runtime renders Hud 1540 experience from original child SVGs and source colour transform, not the flattened 1477 image', async () => {
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const hudDraw = main.match(/function drawBottomHud\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /import \{ getHudExperienceRenderPlan \} from '\.\/hud-experience-render-plan\.mjs';/);
  assert.match(main, /hud-exp-base-1474\.svg/);
  assert.match(main, /hud-exp-green-1475\.svg/);
  assert.match(main, /hud-exp-fill-699-source\.svg/);
  assert.match(hudDraw, /getHudExperienceRenderPlan\(\{ level: player\.level, exp: player\.exp \}\)/);
  assert.match(hudDraw, /ctx\.globalCompositeOperation = 'source-in'/);
  assert.match(hudDraw, /ctx\.scale\(experience\.bar\.scaleX, 1\)/);
  assert.match(hudDraw, /ctx\.transform\(experience\.bar\.matrix\.a, experience\.bar\.matrix\.b, experience\.bar\.matrix\.c, experience\.bar\.matrix\.d, experience\.bar\.matrix\.x, experience\.bar\.matrix\.y\)/);
  assert.doesNotMatch(main, /hudExpHolderSprite|hud-expholder-1477\.png/);
});
