import assert from 'node:assert/strict';
import test from 'node:test';
import { TUTORIAL_DOWN_ARROWS } from '../src/tutorial-down-arrows-source.mjs';

test('Tutorial DownArrow records retain canonical Arena child depths and twip matrices', () => {
  assert.deepEqual(TUTORIAL_DOWN_ARROWS.map(({ name, depth, matrix }) => [name, depth, matrix.translateX, matrix.translateY]), [
    ['downarrow3', 774, 20689, 13096], ['downarrow7', 764, 47267, 13416], ['downarrow8', 766, 50621, 12171], ['downarrow10', 776, 36667, 26507], ['downarrow12', 778, 33840, 25478],
  ]);
});
