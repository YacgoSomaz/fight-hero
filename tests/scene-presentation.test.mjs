import test from 'node:test';
import assert from 'node:assert/strict';
import { SHOW_COLLISION_OVERLAYS, SHOW_PLAYER_PROBES } from '../src/scene-presentation.mjs';

test('the normal Foundry scene never paints editor collision or foot-probe overlays', () => {
  assert.equal(SHOW_COLLISION_OVERLAYS, false);
  assert.equal(SHOW_PLAYER_PROBES, false);
});
