import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCSkinFrameBounds } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { tutorialSkinBounds } from '../src/tutorial-skin-bounds-source.mjs';

test('browser skin registration bounds exactly retain the source SWF crop origin', () => {
  const sourceBody = extractUnitMCSkinFrameBounds(57).find(({ path }) => path === 'body').bounds;

  assert.deepEqual(tutorialSkinBounds(631, 57), sourceBody);
  assert.deepEqual(tutorialSkinBounds(666, 57), { xMin: -6.65, xMax: 15.45, yMin: -20.2, yMax: 3.75 });
  assert.throws(() => tutorialSkinBounds(669, 57), /not an exported UnitMC skin child sprite/);
});
