import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractClassDefinitions } from '../private-assets/parse-stats-classes.mjs';

// Unit.setClass() asks Stats_Classes for the class whose id comes from the
// Campaign actor record.  A Tutorial actor adapter therefore needs the real
// source skin frame and level-one combat values, rather than the quick-match
// Medic constants from engine.mjs.
test('extracts every original Stats_Classes profile and source class identity', () => {
  const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Classes.as', import.meta.url), 'utf8');
  const classes = extractClassDefinitions(source);

  assert.deepEqual(classes.map(({ number, id, name, startFrame, runType }) => ({ number, id, name, startFrame, runType })), [
    { number: 1, id: 'medic', name: 'Medic', startFrame: 50, runType: 1 },
    { number: 2, id: 'sniper', name: 'Assassin', startFrame: 0, runType: 1 },
    { number: 3, id: 'soldier', name: 'Commando', startFrame: 150, runType: 2 },
    { number: 4, id: 'tank', name: 'Tank', startFrame: 100, runType: 2 },
  ]);
  assert.deepEqual(classes.find(({ id }) => id === 'tank').stats, {
    hp: { min: 130, max: 300 }, crit: { min: 2, max: 10 }, aim: { min: 55, max: 80 }, ammo: { min: 100, max: 230 },
  });
});

test('interpolates the exact original class stats by level without quick-match defaults', () => {
  const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Classes.as', import.meta.url), 'utf8');
  const classes = extractClassDefinitions(source);
  const medic = classes.find(({ id }) => id === 'medic');

  assert.deepEqual(medic.atLevel(1), { hp: 85, crit: 6, aim: 70, ammo: 90 });
  assert.deepEqual(medic.atLevel(50), { hp: 190, crit: 30, aim: 110, ammo: 190 });
});
