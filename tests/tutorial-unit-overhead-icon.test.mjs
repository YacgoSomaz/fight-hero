import assert from 'node:assert/strict';
import test from 'node:test';
import { getTutorialUnitOverheadIcon } from '../src/tutorial-unit-overhead-icon.mjs';

test('Unit symbol 687 places the original symbol 682 Medic frame at its decoded Display List matrix', () => {
  const icon = getTutorialUnitOverheadIcon({
    team: 0,
    unitInfo: { icon: 'medic' },
  }, { x: 400, y: 300 });

  assert.deepEqual(icon, {
    assetSrc: './public/assets/original-swf/unit-icon-682-medic-frame2.png',
    spriteId: 682,
    frame: 2,
    sourceWidth: 15,
    sourceHeight: 15,
    x: 365.3,
    y: 219.7,
    width: 15,
    height: 15,
    colour: '#33ff33',
    alpha: 0.7,
  });
});

test('Unit.setTeam uses its source front team colour for every class icon', () => {
  const sourceUnit = { unitInfo: { icon: 'tank' } };
  const screen = { x: 0, y: 0 };

  assert.equal(getTutorialUnitOverheadIcon({ ...sourceUnit, team: 1 }, screen).colour, '#3399cc');
  assert.equal(getTutorialUnitOverheadIcon({ ...sourceUnit, team: 2 }, screen).colour, '#cc9900');
});

test('a Unit without an original class icon refuses a generic replacement graphic', () => {
  assert.throws(
    () => getTutorialUnitOverheadIcon({ team: 0, unitInfo: { icon: 'robot' } }, { x: 0, y: 0 }),
    /original Unit icon/i,
  );
});
