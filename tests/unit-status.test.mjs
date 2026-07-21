import test from 'node:test';
import assert from 'node:assert/strict';
import { getUnitOverheadHud } from '../src/unit-status.mjs';

test('each living unit receives a source-style name and health bar above its head', () => {
  assert.deepEqual(
    getUnitOverheadHud({ isBot: true, hp: 3, maxHp: 5 }, { x: 400, y: 300 }, 76),
    {
      label: 'AI', labelX: 400, labelY: 204,
      outline: { x: 383, y: 210, width: 34, height: 6 },
      fill: { x: 384, y: 211, width: 19.2, height: 4, color: '#8df05b' },
    },
  );
});

test('overhead health clamps invalid health values to the visible bar bounds', () => {
  const hud = getUnitOverheadHud({ isBot: false, hp: 99, maxHp: 5 }, { x: 50, y: 80 }, 76);
  assert.equal(hud.label, 'P1');
  assert.equal(hud.fill.width, 32);
});
