import test from 'node:test';
import assert from 'node:assert/strict';
import { getObjectiveVisual } from '../src/objective-visuals.mjs';

test('objective visuals point directly to the locally extracted source sprites and their team frames', () => {
  assert.deepEqual(getObjectiveVisual('ctf', 1), {
    source: './private-assets/objective-export/DefineSprite_1222_NodeCtfFlag/1.png', width: 128, height: 96,
  });
  assert.deepEqual(getObjectiveVisual('ctf', 2), {
    source: './private-assets/objective-export/DefineSprite_1222_NodeCtfFlag/2.png', width: 128, height: 96,
  });
  assert.deepEqual(getObjectiveVisual('dom', 0), {
    source: './private-assets/objective-export/DefineSprite_1240_NodeHoldpoint/1.png', width: 80, height: 96,
  });
  assert.deepEqual(getObjectiveVisual('dom', 2), {
    source: './private-assets/objective-export/DefineSprite_1240_NodeHoldpoint/3.png', width: 80, height: 96,
  });
});
