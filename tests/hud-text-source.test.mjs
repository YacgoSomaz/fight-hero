import test from 'node:test';
import assert from 'node:assert/strict';
import { getHudTextFields } from '../src/hud-text-source.mjs';

// User journey: the lower HUD must show the current Medic, HP, level, current
// weapon, and spare ammunition in the original Hud 1540 text fields, rather
// than retain the prototype's fixed browser-font labels.
test('Hud 1540 text fields retain their decoded placements, fonts, opacity, and alignments', () => {
  assert.deepEqual(getHudTextFields({ className: 'Medic', hp: 4.1, level: 1, weaponName: 'M4', spare: 90 }), [
    { id: 'classname', text: 'Medic', x: 0.95, y: 528.6, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10, alpha: 127 / 255, align: 'left' },
    { id: 'hp', text: '5 Hp', x: 68.6, y: 558.25, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'left' },
    { id: 'level', text: 'lvl: 1', x: 61.15, y: 578.75, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'left' },
    { id: 'curgun', text: 'M4', x: 798.95, y: 528.6, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10, alpha: 127 / 255, align: 'right' },
    { id: 'ammo', text: '90', x: 683.025, y: 557.25, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'center' },
  ]);
});

test('the runtime consumes source HUD text fields rather than hard-coded prototype labels', async () => {
  const { readFile } = await import('node:fs/promises');
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const hudDraw = main.match(/function drawBottomHud\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /import\s*\{\s*getHudTextFields\s*\}\s*from\s*'\.\/hud-text-source\.mjs'/);
  assert.match(hudDraw, /getHudTextFields\(\{\s*className:\s*player\.className,\s*hp:\s*player\.hp,\s*level:\s*player\.level,\s*weaponName:\s*player\.weapon\.name,\s*spare:\s*player\.weapon\.spare\s*\}\)/);
  assert.match(hudDraw, /QTypeSquare-Bold_12pt_st/);
  assert.doesNotMatch(hudDraw, /'85 Hp'|'lvl: 1'|ctx\.moveTo\(30,\s*hudY - 61\)/, 'fixed text and the hand-drawn class cross must be removed');
});
