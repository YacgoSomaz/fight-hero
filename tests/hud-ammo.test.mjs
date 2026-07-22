import test from 'node:test';
import assert from 'node:assert/strict';
import { getHudAmmoBoxes } from '../src/hud-ammo.mjs';

// User journey: when a Medic holds the source M4, the lower-right ammo display
// must retain Hud.as's compact arifle boxes instead of the old enlarged,
// approximate Canvas rectangles.
test('Hud.as arifle layout preserves the original compact boxes and empty alpha', () => {
  assert.deepEqual(getHudAmmoBoxes({ clip: 2, clipMax: 4, type: 'arifle' }), [
    { x: 0, y: 0, width: 2, height: 10, filled: true },
    { x: 4, y: 0, width: 2, height: 10, filled: true },
    { x: 8, y: 0, width: 2, height: 10, filled: false },
    { x: 12, y: 0, width: 2, height: 10, filled: false },
  ]);
});

test('Hud.as machine layout preserves its overflow row rather than truncating rounds', () => {
  assert.deepEqual(getHudAmmoBoxes({ clip: 9, clipMax: 10, type: 'machine' }), [
    { x: 0, y: 0, width: 2, height: 5, filled: true },
    { x: 4, y: 0, width: 2, height: 5, filled: true },
    { x: 8, y: 0, width: 2, height: 5, filled: true },
    { x: 12, y: 0, width: 2, height: 5, filled: true },
    { x: 16, y: 0, width: 2, height: 5, filled: true },
    { x: 0, y: 7, width: 2, height: 5, filled: true },
    { x: 4, y: 7, width: 2, height: 5, filled: true },
    { x: 8, y: 7, width: 2, height: 5, filled: true },
    { x: 12, y: 7, width: 2, height: 5, filled: true },
    { x: 16, y: 7, width: 2, height: 5, filled: false },
  ]);
});

test('the running M4 HUD uses the decoded bulletCont anchor and both-axis Flash flip', async () => {
  const { readFile } = await import('node:fs/promises');
  const main = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  const engine = await readFile(new URL('../src/engine.mjs', import.meta.url), 'utf8');
  const hudDraw = main.match(/function drawBottomHud\(\) \{([\s\S]*?)\n\}/)?.[1] ?? '';

  assert.match(main, /import\s*\{\s*getHudAmmoBoxes\s*\}\s*from\s*'\.\/hud-ammo\.mjs'/);
  assert.match(engine, /weapon:\s*\{[\s\S]*?ammoType:\s*'arifle'/);
  assert.match(hudDraw, /const\s+player\s*=\s*world\.players\[0\]/, 'the lower HUD reads the active local Player once');
  assert.match(hudDraw, /getHudAmmoBoxes\(\{\s*clip,\s*clipMax:\s*player\.weapon\.clipMax,\s*type:\s*player\.weapon\.ammoType\s*\}\)/);
  assert.match(hudDraw, /ctx\.translate\(664\.3,\s*571\.3\)/);
  assert.match(hudDraw, /ctx\.scale\(-1,\s*-1\)/);
  assert.doesNotMatch(hudDraw, /index \* 7|hudY - 48/, 'the enlarged approximate boxes must be removed');
});
