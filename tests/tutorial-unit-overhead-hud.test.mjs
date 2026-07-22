import test from 'node:test';
import assert from 'node:assert/strict';
import { getTutorialUnitOverheadBar, getTutorialUnitOverheadHud } from '../src/tutorial-unit-overhead-hud.mjs';

test('Unit symbol 687 places its decoded bar_hp sprite at the authored local matrix coordinates', () => {
  const bar = getTutorialUnitOverheadBar({
    human: true,
    team: 0,
    status: { barHpWidth: 48.5 },
  }, { x: 400, y: 300 });

  assert.deepEqual(bar, {
    assetSrc: './public/assets/original-swf/unit-bar-670.png',
    symbolId: 670,
    sourceWidth: 47,
    sourceHeight: 5,
    x: 373,
    y: 223.75,
    width: 48.5,
    height: 3.06121826171875,
    colour: '#33ff33',
  });
});

test('Unit.setTeam chooses the original human/back team colour for each source team', () => {
  const screen = { x: 0, y: 0 };
  const state = { status: { barHpWidth: 1 } };

  assert.equal(getTutorialUnitOverheadBar({ ...state, human: false, team: 0 }, screen).colour, '#009900');
  assert.equal(getTutorialUnitOverheadBar({ ...state, human: true, team: 1 }, screen).colour, '#3399cc');
  assert.equal(getTutorialUnitOverheadBar({ ...state, human: false, team: 1 }, screen).colour, '#0066ff');
  assert.equal(getTutorialUnitOverheadBar({ ...state, human: true, team: 2 }, screen).colour, '#cc6600');
});

test('Status.setBars keeps the original half-alpha red bar_hurt immediately after the reduced hp bar', () => {
  const hud = getTutorialUnitOverheadHud({
    human: true,
    team: 0,
    status: { barHpWidth: 20, barHurtWidth: 8, barHurtX: 20 },
  }, { x: 400, y: 300 });

  assert.deepEqual(hud.hurt, {
    assetSrc: './public/assets/original-swf/unit-bar-670.png',
    symbolId: 670,
    sourceWidth: 47,
    sourceHeight: 5,
    x: 393,
    y: 223.75,
    width: 8,
    height: 3.06121826171875,
    colour: '#f90000',
    alpha: 0.5,
  });
  assert.equal(hud.hp.width, 20);
});
