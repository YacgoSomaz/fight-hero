import assert from 'node:assert/strict';
import test from 'node:test';
import { getTutorialUnitJugMarker } from '../src/tutorial-unit-jug-marker.mjs';

test('Unit.setJug frame two places original shape 686 at its own decoded registration bounds', () => {
  assert.deepEqual(getTutorialUnitJugMarker({ isJug: true }, { x: 400, y: 300 }), {
    assetSrc: './public/assets/original-swf/unit-jug-marker-686.png',
    symbolId: 686,
    x: 382.55,
    y: 198.15,
    width: 38.25,
    height: 12.75,
  });
});

test('ordinary Unit frame one never substitutes a Juggernaut marker', () => {
  assert.equal(getTutorialUnitJugMarker({ isJug: false }, { x: 400, y: 300 }), null);
});
