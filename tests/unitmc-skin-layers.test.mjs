import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { extractUnitMCSkinFrameLayers } from '../private-assets/parse-unitmc-skin-graph.mjs';

test('UnitMC skin layers retain the leg gun sublayer that setSkin hides only on legup2', () => {
  const layers = extractUnitMCSkinFrameLayers(57);
  const upperLeg = layers.find(({ path }) => path === 'legup1');

  assert.equal(upperLeg.character, 598);
  assert.deepEqual(upperLeg.items.find(({ name }) => name === 'gun'), { depth: 2, character: 505, name: 'gun' });
  const unitSource = fs.readFileSync(fileURLToPath(new URL('../assets/reverse/ffdec-deep-20260720/scripts/UnitMC.as', import.meta.url)), 'utf8');
  assert.match(unitSource, /this\.legup2\.gun\.visible = false/);
});
