import test from 'node:test';
import assert from 'node:assert/strict';
import { ORIGINAL_AIMER } from '../src/aimer-source.mjs';

test('the gameplay crosshair uses the directly extracted Aimer symbol instead of a CSS/canvas substitute', () => {
  assert.deepEqual(ORIGINAL_AIMER, {
    source: './public/assets/original-swf/aimer-1431-frame1.png',
    sourceSymbol: 1431,
    sourceFrame: 1,
    width: 26,
    height: 26,
    origin: { x: 13, y: 13 },
  });
});

// User journey: as a player aiming at an enemy, I see the original SWF Aimer
// at my mouse location, rather than a hand-drawn circle and plus sign.
test('the running game draws the extracted Aimer sprite at its original centre and never falls back to a hand-drawn crosshair', async () => {
  const { readFile } = await import('node:fs/promises');
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const aimerDraw = main.match(/function drawAimer\(player\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /import\s*\{\s*ORIGINAL_AIMER\s*\}\s*from\s*'\.\/aimer-source\.mjs'/);
  assert.match(main, /const\s+originalAimerSprite\s*=\s*image\(ORIGINAL_AIMER\.source\)/);
  assert.match(aimerDraw, /ctx\.drawImage\(originalAimerSprite,\s*pointer\.x\s*-\s*ORIGINAL_AIMER\.origin\.x,\s*pointer\.y\s*-\s*ORIGINAL_AIMER\.origin\.y,\s*ORIGINAL_AIMER\.width,\s*ORIGINAL_AIMER\.height\)/);
  assert.doesNotMatch(aimerDraw, /ctx\.arc\(/, 'the original Aimer must not be replaced by a drawn circle');
  assert.doesNotMatch(aimerDraw, /aimerCircleSprite|aimerCenterSprite/, 'obsolete empty placeholders must not control the visible crosshair');
});

test('the running game upgrades the original Aimer to its source line/circle Display List using the Player.as recoil snapshot', async () => {
  const { readFile } = await import('node:fs/promises');
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const aimerDraw = main.match(/function drawAimer\(player\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /import\s*\{\s*getOriginalAimerRig\s*\}\s*from\s*'\.\/aimer-rig\.mjs'/);
  assert.match(main, /getOriginalAimerRig\(\{[\s\S]*dynRecoilMod:\s*player\.aimerDynRecoilMod/);
  assert.match(aimerDraw, /getAimPivot\(player\)/, 'Player.as measures target distance from MC.arm1');
  assert.match(aimerDraw, /ctx\.transform\(\.\.\.part\.matrix\)/, 'source line rotations must remain their decoded matrices');
  assert.match(aimerDraw, /ctx\.drawImage\(sprite,\s*-part\.origin\.x,\s*-part\.origin\.y\)/, 'source registration points must anchor the extracted images');
});
