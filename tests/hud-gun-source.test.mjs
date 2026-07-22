import test from 'node:test';
import assert from 'node:assert/strict';

// User journey: while holding the source M4, I see the original GunsMenu 724
// M4 icon at Hud 1540.curgun's own transformed placement, not a CSS-filtered
// replacement silhouette.
test('the lower-right M4 uses GunsMenu 724 frame 20 and its Hud 1540 matrix', async () => {
  const { readFile } = await import('node:fs/promises');
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const hudDraw = main.match(/function drawBottomHud\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /hud-gunsmenu-724-m4-frame20\.png/);
  assert.match(hudDraw, /ctx\.transform\(1\.7536468505859375,\s*-0\.5263671875,\s*0\.5263671875,\s*1\.7536468505859375,\s*674\.2,\s*568\)/);
  assert.match(hudDraw, /ctx\.drawImage\(hudM4MenuSprite,\s*0,\s*0\)/);
  assert.doesNotMatch(hudDraw, /ctx\.filter/, 'the original exported icon must not be recoloured by a CSS/Canvas filter');
});
