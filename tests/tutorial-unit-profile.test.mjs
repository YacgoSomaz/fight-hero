import test from 'node:test';
import assert from 'node:assert/strict';
import { createTutorialUnitProfile, getTutorialAiLevel } from '../src/tutorial-unit-profile.mjs';

test('Stats_Classes.getAiLevel keeps the original inclusive UT.irand range and minimum level one', () => {
  assert.equal(getTutorialAiLevel(0, () => 0), 1);
  assert.equal(getTutorialAiLevel(0, () => 0.999999), 4);
  assert.equal(getTutorialAiLevel(7, () => 0), 18);
});

test('Unit.setClass builds the original level-one Medic numeric profile with the generated None skill', () => {
  const profile = createTutorialUnitProfile({ soldier: 'medic', level: 1, skin: 7, skill: 'none', primary: 'M4', secondary: 'USP', extra: {} });

  assert.deepEqual(profile, {
    level: 1,
    number: 1,
    id: 'medic',
    name: 'Medic',
    startFrame: 50,
    runType: 1,
    skinFrame: 57,
    hp: 85,
    crit: 0.06,
    aim: 0.7000000000000001,
    ammo: 0.9,
    headBonus: 1.45,
    critBonus: 1.35,
    regen: 0.085,
    skill: { id: 'none', sprite: 'none', value: -1 },
    primary: 'M4',
    secondary: 'USP',
  });
});

test('Unit.setClass applies source health and adrenaline skill changes after class interpolation', () => {
  const health = createTutorialUnitProfile({ soldier: 'tank', level: 1, skin: 5, skill: 'health', primary: 'Saw', secondary: 'USP', extra: {} });
  const adrenaline = createTutorialUnitProfile({ soldier: 'tank', level: 1, skin: 5, skill: 'adren', primary: 'Saw', secondary: 'USP', extra: {} });

  assert.deepEqual({ hp: health.hp, regen: health.regen, skill: health.skill }, { hp: 150, regen: 0.15, skill: { id: 'health', sprite: 'mastery', value: 20 } });
  assert.deepEqual({ hp: adrenaline.hp, regen: adrenaline.regen, skill: adrenaline.skill }, { hp: 130, regen: 0.39, skill: { id: 'adren', sprite: 'adren', value: 3 } });
});

test('Unit.setClass honors Campaign extra.hp only when the original truthy override exists', () => {
  const profile = createTutorialUnitProfile({ soldier: 'soldier', level: 20, skin: 7, skill: 'none', primary: 'Mini Gun', secondary: 'Socom', extra: { hp: 240 } });
  assert.equal(profile.hp, 240);
  assert.equal(profile.regen, 0.24);
});

test('Unit.setClass applies every remaining source skill branch without inventing class stats', () => {
  const critical = createTutorialUnitProfile({ soldier: 'sniper', level: 1, skin: 1, skill: 'critical', primary: 'USP', secondary: 'USP', extra: {} });
  const combat = createTutorialUnitProfile({ soldier: 'medic', level: 1, skin: 1, skill: 'combat', primary: 'M4', secondary: 'USP', extra: {} });
  const vital = createTutorialUnitProfile({ soldier: 'sniper', level: 1, skin: 1, skill: 'vital', primary: 'USP', secondary: 'USP', extra: {} });
  const ammo = createTutorialUnitProfile({ soldier: 'soldier', level: 1, skin: 1, skill: 'ammo', primary: 'Saw', secondary: 'USP', extra: {} });

  assert.deepEqual({ crit: critical.crit, aim: critical.aim }, { crit: 0.15000000000000002, aim: 0.8500000000000001 });
  assert.deepEqual({ hp: combat.hp, crit: combat.crit, aim: combat.aim, ammo: combat.ammo }, { hp: 95, crit: 0.09, aim: 0.7300000000000001, ammo: 1 });
  assert.deepEqual({ headBonus: vital.headBonus, critBonus: vital.critBonus }, { headBonus: 1.7, critBonus: 1.6 });
  assert.equal(ammo.ammo, 1.5);
});

test('Unit.setClass refuses missing original class or skill records instead of falling back', () => {
  assert.throws(() => createTutorialUnitProfile({ soldier: 'robot', level: 1, skin: 1, skill: 'none', primary: 'USP', secondary: 'USP' }), /Stats_Classes/);
  assert.throws(() => createTutorialUnitProfile({ soldier: 'medic', level: 1, skin: 1, skill: 'laser', primary: 'USP', secondary: 'USP' }), /Stats_Skills/);
});
