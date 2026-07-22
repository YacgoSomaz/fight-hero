import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { extractUnitMCSkinFrameLayers } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { tutorialSkinShape, tutorialSkinShapeAssetPath } from '../src/tutorial-skin-shape-source.mjs';

test('Tutorial skin renders the original base Shape for each child, never the leg gun container duplicate', () => {
  for (const skinFrame of [55, 57, 105, 151, 155]) {
    for (const { path, items } of extractUnitMCSkinFrameLayers(skinFrame)) {
      const directShape = items.find(({ name }) => !name);
      const selected = tutorialSkinShape(path, skinFrame);
      assert.equal(selected.character, directShape.character, `${path} must select its direct source Shape`);
      assert.notEqual(selected.character, 505, `${path} must not absorb the separately controlled leg gun Sprite`);
      assert.ok(fs.existsSync(fileURLToPath(new URL(`../${tutorialSkinShapeAssetPath(path, skinFrame).replace('./public/', 'public/')}`, import.meta.url))), `${path}/${skinFrame} base Shape export is missing`);
    }
  }
  assert.equal(tutorialSkinShape('legup2', 57).character, 581);
});
