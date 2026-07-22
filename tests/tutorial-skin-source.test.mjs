import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCSkinGraph } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { SOURCE_UNITMC_SKIN_TARGETS, tutorialSkinAssetPath } from '../src/tutorial-skin-source.mjs';

test('browser Tutorial skin source is generated from the original nested UnitMC graph', () => {
  const sourceGraph = extractUnitMCSkinGraph();

  assert.deepEqual(SOURCE_UNITMC_SKIN_TARGETS, sourceGraph.targets.map(([path, character, frames]) => ({ path, character, frames })));
  assert.equal(tutorialSkinAssetPath(631, 57), './public/assets/original-swf/unit-skins/DefineSprite_631/57.png');
  assert.throws(() => tutorialSkinAssetPath(669, 57), /not a UnitMC skin child sprite/);
});
