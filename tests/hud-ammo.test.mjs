import test from 'node:test';
import assert from 'node:assert/strict';
import { getHudAmmoBoxes } from '../src/hud-ammo.mjs';

// User journey: when a Medic holds the source M4, the lower-right ammo display
// must retain Hud.as's compact arifle boxes instead of the old enlarged,
// approximate Canvas rectangles.
test('Hud.as arifle layout preserves the original compact boxes and empty alpha', () => {
  assert.deepEqual(getHudAmmoBoxes({ clip: 2, clipMax: 4, type: 'arifle' }), [
    { x: 0, y: 0, width: 2, height: 10, filled: true },
    { x: 4, y: 0, width: 2, height: 10, filled: true },
    { x: 8, y: 0, width: 2, height: 10, filled: false },
    { x: 12, y: 0, width: 2, height: 10, filled: false },
  ]);
});

test('Hud.as machine layout preserves its overflow row rather than truncating rounds', () => {
  assert.deepEqual(getHudAmmoBoxes({ clip: 9, clipMax: 10, type: 'machine' }), [
    { x: 0, y: 0, width: 2, height: 5, filled: true },
    { x: 4, y: 0, width: 2, height: 5, filled: true },
    { x: 8, y: 0, width: 2, height: 5, filled: true },
    { x: 12, y: 0, width: 2, height: 5, filled: true },
    { x: 16, y: 0, width: 2, height: 5, filled: true },
    { x: 0, y: 7, width: 2, height: 5, filled: true },
    { x: 4, y: 7, width: 2, height: 5, filled: true },
    { x: 8, y: 7, width: 2, height: 5, filled: true },
    { x: 12, y: 7, width: 2, height: 5, filled: true },
    { x: 16, y: 7, width: 2, height: 5, filled: false },
  ]);
});
