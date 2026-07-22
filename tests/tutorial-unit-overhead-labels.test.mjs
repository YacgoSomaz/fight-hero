import assert from 'node:assert/strict';
import test from 'node:test';
import { getTutorialUnitOverheadLabels } from '../src/tutorial-unit-overhead-labels.mjs';

test('Unit symbol 687 places its original txt_name and txt_level fields at the decoded first-frame matrices', () => {
  const labels = getTutorialUnitOverheadLabels({
    team: 0,
    unitInfo: { name: 'Juice-Tin', level: 50 },
  }, { x: 400, y: 300 });

  assert.deepEqual(labels, [
    {
      assetSrc: './public/assets/original-swf/unit-font-683.ttf',
      fontFamily: 'QTypeSquare-Bold_8pt_st',
      fontSize: 8,
      symbolId: 684,
      text: 'Juice-Tin',
      x: 391,
      y: 212,
      width: 100.75,
      height: 13.6,
      colour: '#33ff33',
      alpha: 0.7,
    },
    {
      assetSrc: './public/assets/original-swf/unit-font-683.ttf',
      fontFamily: 'QTypeSquare-Bold_8pt_st',
      fontSize: 8,
      symbolId: 685,
      text: '50',
      x: 372,
      y: 212,
      width: 19.6,
      height: 13.6,
      colour: '#33ff33',
      alpha: 0.7,
    },
  ]);
});

test('Unit.setTeam applies the original front team colour to both text fields, independent of human status', () => {
  const base = { unitInfo: { name: 'source', level: 1 } };
  const screen = { x: 0, y: 0 };

  assert.equal(getTutorialUnitOverheadLabels({ ...base, team: 1 }, screen)[0].colour, '#3399cc');
  assert.equal(getTutorialUnitOverheadLabels({ ...base, team: 2 }, screen)[1].colour, '#cc9900');
});

test('missing original Unit info is rejected rather than silently substituting a label', () => {
  assert.throws(
    () => getTutorialUnitOverheadLabels({ team: 0 }, { x: 0, y: 0 }),
    /original Unit info/i,
  );
});
