import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceTutorialStatusFrame, applyTutorialStatusDamage, createTutorialStatus } from '../src/tutorial-status-damage-runtime.mjs';

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
  assert.equal(target.status.barHpWidth, 42.936764705882354);
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
  assert.equal(target.status.hpCur, 40);
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

test('Status.damage layers the original campaign-bot, juggernaut, will and surge multipliers', () => {
  const target = unit({
    human: false,
    team: 2,
    hp: 200,
    isJug: true,
    skill: { id: 'will', value: 2 },
  });
  target.matchIsCampaign = true;
  target.status.sSurge = 1;
  const attacker = unit({ human: false, team: 1, diff: 5 });
  attacker.status.sSurge = 1;
  const result = applyTutorialStatusDamage(target, attacker, { typeName: 'Rifle', extra: {} }, {}, 100, { random: () => 1 });

  assert.equal(result.damage, 10.510499999999999);
  assert.equal(target.status.hpCur, 189.4895);
  assert.deepEqual(result.events, ['ironwill']);
  assert.equal(target.status.bigSkillCooldown, 40);
});

test('Status.damage carries teamkill and critical flags when allied damage is allowed', () => {
  const target = unit({ human: true, team: 1, hp: 100 });
  const primary = { typeName: 'Rifle', extra: { critical: 0.1, criticalDmg: 0.2 } };
  const attacker = unit({ human: false, team: 1, diff: 10, crit: 0.2, primary });
  const extra = {};
  const result = applyTutorialStatusDamage(target, attacker, primary, extra, 10, { random: () => 0 });

  assert.equal(result.damage, 4.65);
  assert.deepEqual(result.events, ['critical']);
  assert.deepEqual(extra, { teamkill: true, critMult: true });
  assert.equal(target.status.hpCur, 95.35);
});

test('Status.damage keeps bypassed spawn protection and shield out of explosive resistance math', () => {
  const targetPrimary = { typeName: 'Rifle', extra: { resist: 0.8, reduce: 0.25 } };
  const target = unit({ human: true, hp: 100, shield: 20, skill: { id: 'resist', value: 0.5 }, primary: targetPrimary });
  target.status.sSpawn = 5;
  const explosive = { typeName: 'Explosive', extra: {} };
  const attacker = unit({ human: false, diff: 10, primary: explosive, currentGun: explosive });
  const result = applyTutorialStatusDamage(target, attacker, explosive, { splashMult: 0.5, shielded: true }, 100, { bypassProtection: true, random: () => 1 });

  assert.equal(result.damage, 15);
  assert.equal(target.status.hpCur, 85);
  assert.equal(target.status.shCur, 20);
});

test('Status.damage triggers blur after surviving low health and reports death only for Unit.die to consume', () => {
  const blurTarget = unit({ human: true, hp: 100, skill: { id: 'blur', value: 2 } });
  blurTarget.status.hpCur = 40;
  const attacker = unit({ human: false, diff: 10 });
  const blurResult = applyTutorialStatusDamage(blurTarget, attacker, { typeName: 'Rifle', extra: {} }, {}, 20, { random: () => 1 });
  assert.deepEqual(blurResult, { applied: true, reason: null, damage: 20, died: false, events: ['blur'] });
  assert.equal(blurTarget.status.sBlur, 60);
  assert.equal(blurTarget.status.bigSkillCooldown, 60);

  const deathTarget = unit({ human: true, hp: 10 });
  deathTarget.status.sReflect = 5;
  const deathResult = applyTutorialStatusDamage(deathTarget, attacker, { typeName: 'Rifle', extra: {} }, {}, 15, { bypassProtection: true, random: () => 1 });
  assert.deepEqual(deathResult, { applied: true, reason: null, damage: 15, died: true, events: ['die'] });
  assert.equal(deathTarget.status.hpCur, 0);
  assert.equal(deathTarget.dead, false);
});

test('Status.damage applies the self-hit noAllyDmg reduction instead of the teamkill return', () => {
  const self = unit({ human: true, team: 1, hp: 100 });
  const gun = { typeName: 'Rifle', extra: { noAllyDmg: true } };
  self.gun.primary = gun;
  self.gun.curGun = gun;
  const result = applyTutorialStatusDamage(self, self, gun, {}, 10, { random: () => 1 });

  assert.equal(result.damage, 4);
  assert.equal(self.status.hpCur, 96);
});

test('Status.EnterFrame advances source spawn protection, cooldown, hurt-bar easing, delayed regen and normal regen', () => {
  const target = unit({ hp: 100 });
  target.status.hpCur = 90;
  target.status.regenDelay = 2;
  target.status.sSpawn = 2;
  target.status.bigSkillCooldown = 2;
  target.status.barHurtWidth = 10;
  target.unitInfo.regen = 0.1;

  assert.deepEqual(advanceTutorialStatusFrame(target), { events: [], bloodAlpha: null });
  assert.deepEqual({ spawn: target.status.sSpawn, cooldown: target.status.bigSkillCooldown, regenDelay: target.status.regenDelay, hurt: target.status.barHurtWidth, hp: target.status.hpCur }, { spawn: 1, cooldown: 1, regenDelay: 1, hurt: 9, hp: 90 });
  advanceTutorialStatusFrame(target);
  assert.deepEqual({ spawn: target.status.sSpawn, cooldown: target.status.bigSkillCooldown, regenDelay: target.status.regenDelay, hurt: target.status.barHurtWidth, hp: target.status.hpCur }, { spawn: 0, cooldown: 0, regenDelay: 0, hurt: 8.1, hp: 90 });
  advanceTutorialStatusFrame(target);
  assert.equal(target.status.hpCur, 90.1);
});

test('Status.EnterFrame reproduces Shadow Blend delay and opacity progression without a renderer substitute', () => {
  const target = unit({ hp: 100, skill: { id: 'shadow2', value: 0.5 } });
  target.status.stealthDelay = 1;
  target.status.sInvis = 0.2;
  target.crouching = true;
  target.hasFlag = false;

  const first = advanceTutorialStatusFrame(target);
  assert.deepEqual(first, { events: [], bloodAlpha: null });
  assert.equal(target.status.stealthDelay, 0);
  assert.equal(target.status.sInvis, 0.1);
  advanceTutorialStatusFrame(target);
  assert.equal(target.status.sInvis, 0.2);
});
