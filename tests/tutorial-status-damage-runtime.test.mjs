import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTutorialStatusDamage, createTutorialStatus } from '../src/tutorial-status-damage-runtime.mjs';

function unit({
  human = false,
  team = 0,
  diff = 0,
  hp = 100,
  shield = 0,
  dead = false,
  isJug = false,
  skill = { id: 'none', value: 0 },
  crit = 0,
  headBonus = 1.45,
  critBonus = 1.35,
  primary = { typeName: 'Rifle', extra: {} },
  currentGun = primary,
} = {}) {
  return {
    human,
    team,
    diff,
    dead,
    isJug,
    unitInfo: { skill, crit, headBonus, critBonus },
    gun: { primary, curGun: currentGun },
    status: createTutorialStatus({ hpMax: hp, shield }),
  };
}

test('Status.damage rejects spawn protection before changing Status state', () => {
  const target = unit({ human: true, hp: 85 });
  target.status.sSpawn = 15;
  const attacker = unit({ human: false, diff: 10 });
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: {} }, {}, 15, { random: () => 0 });

  assert.deepEqual(result, { applied: false, reason: 'protected', damage: 0, died: false, events: [] });
  assert.equal(target.status.hpCur, 85);
});

test('Status.damage uses the source human difficulty factor before subtracting HP', () => {
  const target = unit({ human: true, hp: 85 });
  const attacker = unit({ human: false, diff: 5 });
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: {} }, {}, 15, { random: () => 1 });

  assert.equal(result.damage, 9.75);
  assert.equal(target.status.hpCur, 75.25);
  assert.equal(target.status.regenDelay, 90);
  assert.equal(target.status.barHpWidth, 42.93676470588235);
});

test('Status.damage gives a bullet head hit its source head bonus instead of rolling critical', () => {
  const target = unit({ human: true, hp: 100 });
  const attacker = unit({ human: false, diff: 10, crit: 1, headBonus: 1.45, critBonus: 9 });
  const extra = { headMult: 1.5, assassin: 1.5 };
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: { headDmg: 0.5 } }, extra, 15, { random: () => 0 });

  assert.equal(result.damage, 21.75);
  assert.equal(target.status.hpCur, 78.25);
  assert.deepEqual(result.events, ['headshot']);
  assert.equal(extra.critMult, undefined);
});

test('Status.damage consumes shield before HP and leaves the source residual damage', () => {
  const target = unit({ human: true, hp: 40, shield: 5 });
  const attacker = unit({ human: false, diff: 10 });
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: {} }, {}, 15, { random: () => 1 });

  assert.equal(result.damage, 10);
  assert.equal(target.status.shCur, 0);
  assert.equal(target.status.hpCur, 30);
});

test('Status.damage lets operation recover from otherwise fatal non-bypass damage', () => {
  const target = unit({ human: true, hp: 100, skill: { id: 'operation', value: 1 } });
  target.status.hpCur = 20;
  const attacker = unit({ human: false, diff: 10 });
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: {} }, {}, 30, { random: () => 1 });

  assert.deepEqual(result, { applied: true, reason: null, damage: 30, died: false, events: ['operation'] });
  assert.equal(target.status.hpCur, 50);
  assert.equal(target.status.bigSkillCooldown, 30);
});

test('Status.damage preserves source teamkill early return for noAllyDmg', () => {
  const target = unit({ human: true, team: 1, hp: 85 });
  const attacker = unit({ human: false, team: 1, diff: 10 });
  const extra = {};
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: { noAllyDmg: true } }, extra, 15, { random: () => 1 });

  assert.deepEqual(result, { applied: false, reason: 'noAllyDmg', damage: 0, died: false, events: [] });
  assert.equal(extra.teamkill, true);
  assert.equal(target.status.hpCur, 85);
});
