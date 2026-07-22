import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFoundryForegroundRegistration } from '../tools/parse-foundry-foreground.mjs';

test('derives Foundry child registration bounds from SWF geometry rather than PNG alpha or canvas size', () => {
  const records = extractFoundryForegroundRegistration();

  assert.deepEqual(records[0], {
    character: 1242,
    frames: 1,
    bounds: { xMin: -154.6, xMax: 2947.4, yMin: -68, yMax: 879 },
  });
  assert.deepEqual(records.map(({ character, frames }) => ({ character, frames })), [
    { character: 1242, frames: 1 },
    { character: 1252, frames: 76 },
    { character: 1258, frames: 306 },
  ]);
  for (const { bounds } of records.slice(1)) {
    assert.ok(bounds.xMax > bounds.xMin && bounds.yMax > bounds.yMin, 'nested original symbol must retain a non-empty source rectangle');
  }
});
