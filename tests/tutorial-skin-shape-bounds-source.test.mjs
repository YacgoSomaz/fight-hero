import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCSkinBaseShapeBounds } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { tutorialSkinShapeBounds } from '../src/tutorial-skin-shape-bounds-source.mjs';

test('browser Tutorial Shape crop origins exactly retain direct source Shape bounds', () => {
  const sourceLeg = extractUnitMCSkinBaseShapeBounds(57).find(({ path }) => path === 'legup2');

  assert.deepEqual(tutorialSkinShapeBounds('legup2', 57), sourceLeg.bounds);
  assert.deepEqual(tutorialSkinShapeBounds('legup2', 57), { xMin: -5.5, xMax: 11.1, yMin: -2.95, yMax: 13.55 });
  assert.throws(() => tutorialSkinShapeBounds('legup2', 669), /was not exported/);
});
