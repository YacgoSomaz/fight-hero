import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractUnitMCSkinBaseShapeBounds,
  extractUnitMCSkinFrameBounds,
  extractUnitMCSkinFrameLayers,
} from '../private-assets/parse-unitmc-skin-graph.mjs';

test('UnitMC base-Shape bounds use the direct skin Shape rather than the leg container with its hidden gun', () => {
  const baseParts = extractUnitMCSkinBaseShapeBounds(57);
  const containerParts = extractUnitMCSkinFrameBounds(57);
  const layers = extractUnitMCSkinFrameLayers(57);
  const legup2 = baseParts.find(({ path }) => path === 'legup2');
  const directLayer = layers.find(({ path }) => path === 'legup2').items.find(({ name }) => !name);
  const container = containerParts.find(({ path }) => path === 'legup2');

  assert.equal(legup2.character, directLayer.character);
  assert.equal(legup2.character, 581);
  assert.notDeepEqual(legup2.bounds, container.bounds);
  assert.ok(legup2.bounds.xMin > container.bounds.xMin, 'the direct leg crop must exclude the gun extending left of the leg');
});
