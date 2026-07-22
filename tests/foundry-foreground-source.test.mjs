import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFoundryForegroundDisplayList } from '../tools/parse-foundry-foreground.mjs';

test('extracts the original Foundry foreground children from Arena frame 2 without flattening them', () => {
  const source = extractFoundryForegroundDisplayList();

  assert.deepEqual(source, {
    arenaCharacter: 1413,
    frame: 2,
    label: 'foundry',
    layers: [
      {
        depth: 1,
        character: 1242,
        frameCount: 1,
        matrix: { a: 1, b: 0, c: 0, d: 1, x: 0, y: 0 },
      },
      {
        depth: 2,
        character: 1252,
        frameCount: 76,
        matrix: { a: 0.9674072265625, b: 0, c: 0, d: 1, x: 1160.2, y: 722.95 },
      },
      {
        depth: 7,
        character: 1258,
        frameCount: 306,
        matrix: { a: 1, b: 0, c: 0, d: 1, x: 1046.4, y: -65.05 },
      },
    ],
  });
});

test('the extracted Foundry foreground contains only drawable original child symbols, not wallMC or authoring nodes', () => {
  const { layers } = extractFoundryForegroundDisplayList();

  assert.deepEqual(layers.map(({ character }) => character), [1242, 1252, 1258]);
});
