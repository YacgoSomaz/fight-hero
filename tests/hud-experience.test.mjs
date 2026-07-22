import test from 'node:test';
import assert from 'node:assert/strict';
import { getHudExperience } from '../src/hud-experience.mjs';

// User journey: the original experience bar follows Hud.addExp and
// Stats_Classes.getNextExp, so its visible fill is based on saved class
// progression rather than the static number baked into an FFDec screenshot.
test('Hud.addExp uses the original quadratic next-experience rule and 420px width', () => {
  assert.deepEqual(getHudExperience({ level: 1, exp: 0 }), {
    level: 1, exp: 0, nextExp: 43, width: 0, text: 'Exp 0 / 43', maxed: false,
  });
  assert.deepEqual(getHudExperience({ level: 5, exp: 100 }), {
    level: 5, exp: 100, nextExp: 115, width: 100 / 115 * 420, text: 'Exp 100 / 115', maxed: false,
  });
});

test('Hud.addExp preserves the source level-50 full-width exception', () => {
  assert.deepEqual(getHudExperience({ level: 50, exp: 0 }), {
    level: 50, exp: 0, nextExp: null, width: 420, text: 'Level Maxed', maxed: true,
  });
});
