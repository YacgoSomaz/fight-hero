import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { extractUnitMCSkinGraph } from '../private-assets/parse-unitmc-skin-graph.mjs';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialActorBindings } from '../src/tutorial-actor-bindings.mjs';

const assetsRoot = new URL('../public/assets/original-swf/unit-skins/', import.meta.url);

function pngSize(path) {
  const bytes = fs.readFileSync(path);
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path} must stay a direct PNG export`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('Campaign 1 skin targets ship direct original SWF child-sprite frames', () => {
  const bindings = createTutorialActorBindings(createCampaignOneSession());
  const skinFrames = [...new Set(bindings.actors.map(({ skinFrame }) => skinFrame))].sort((left, right) => left - right);
  const targetSprites = [...new Set(extractUnitMCSkinGraph().targets.map(([, character]) => character))].sort((left, right) => left - right);

  assert.deepEqual(skinFrames, [55, 57, 105, 151, 155]);
  assert.deepEqual(targetSprites, [266, 298, 385, 538, 568, 598, 631, 666]);

  for (const sprite of targetSprites) {
    for (const skinFrame of skinFrames) {
      const path = fileURLToPath(new URL(`DefineSprite_${sprite}/${skinFrame}.png`, assetsRoot));
      assert.ok(fs.existsSync(path), `missing original UnitMC child sprite ${sprite} at skin frame ${skinFrame}`);
      const { width, height } = pngSize(path);
      assert.ok(width > 0 && height > 0, `original UnitMC child sprite ${sprite}/${skinFrame} must have pixels`);
    }
  }
});
