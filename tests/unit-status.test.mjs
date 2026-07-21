import test from 'node:test';
import assert from 'node:assert/strict';
import { getUnitOverheadHud } from '../src/unit-status.mjs';

test('each living unit uses the decoded SWF Unit.bar_hp source sprite, not a drawn rectangle', () => {
  const hud = getUnitOverheadHud({ isBot: true, hp: 3, maxHp: 5 }, { x: 400, y: 300 }, 76);
  assert.deepEqual(hud.bar, {
    assetSrc: './public/assets/original-swf/unit-bar-670.png',
    sourceWidth: 47,
    sourceHeight: 5,
    x: 379.5,
    y: 210,
    width: 24.3,
    colour: '#009900',
  });
});

test('the decoded Unit bar follows Status.bar_width and clamps health before scaling', () => {
  const hud = getUnitOverheadHud({ isBot: false, hp: 99, maxHp: 5 }, { x: 50, y: 80 }, 76);
  assert.equal(hud.label, 'P1');
  assert.equal(hud.bar.width, 40.5);
  assert.equal(hud.bar.colour, '#33ff33');
});
