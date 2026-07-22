// Narrow, source-shaped port of Status.as:60-107 and 109-307.  This module
// owns only Status state: Unit.die(), particles, audio, score and HUD remain
// separate source consumers and are deliberately not replaced here.

function setBars(status) {
  const previous = status.barHpWidth;
  status.barHpWidth = status.hpCur / status.hpMax * status.barWidth;
  if (previous - status.barHpWidth <= 0) status.barHurtWidth = 0;
  else status.barHurtWidth += previous - status.barHpWidth;
  status.barHurtX = status.barHpWidth;
}

function heal(status, amount) {
  status.hpCur += amount;
  if (status.hpCur > status.hpMax) status.hpCur = status.hpMax;
  setBars(status);
}

function skillOf(unit) {
  return unit.unitInfo.skill;
}

// Status.reset() derives the bar width as `40 + hpMax / 10` and then calls
// heal(hpMax,false,true), leaving a full hp bar.  The original Status object
// has the listed effect timers even before its first frame tick.
export function createTutorialStatus({ hpMax, shield = 0 }) {
  const status = {
    hpCur: hpMax,
    hpMax,
    shCur: shield,
    barWidth: 40 + hpMax / 10,
    barHpWidth: 0,
    barHurtWidth: 0,
    barHurtX: 0,
    regenDelay: 0,
    stealthDelay: 60,
    sSpawn: 0,
    sInvis: 0,
    sSurge: 0,
    sRapidHeal: 0,
    sReflect: 0,
    sFire: 0,
    sBlur: 0,
    fc: 0,
    bigSkillCooldown: 0,
  };
  heal(status, hpMax);
  return status;
}

// Direct numerical/state port of Status.damage().  `extra` is the original
// Bullet.doHitEffect object, therefore this function intentionally mutates
// `teamkill` and `critMult` exactly as the AS3 method does.  `died` is an
// output signal for Unit.die(): Status.as itself delegates the Unit mutation
// instead of setting `unit.dead` directly.
export function applyTutorialStatusDamage(target, attacker, gun, extra, rawDamage, { bypassProtection = false, random = Math.random } = {}) {
  const status = target.status;
  const targetSkill = skillOf(target);
  const attackerSkill = skillOf(attacker);
  const events = [];

  if (target.dead) return { applied: false, reason: 'dead', damage: 0, died: false, events };
  if ((status.sSpawn || status.sReflect) && !bypassProtection) {
    return { applied: false, reason: 'protected', damage: 0, died: false, events };
  }

  let damage = rawDamage;
  if (target === attacker) {
    if (gun.extra.noAllyDmg) damage *= 0.4;
  } else if (target.human) {
    damage *= 0.3 + attacker.diff * 0.07;
  } else if (target.matchIsCampaign && !target.human && !attacker.human) {
    damage *= 0.4 + attacker.diff * 0.03;
  } else if (!target.human && !attacker.human) {
    damage *= 0.6 + attacker.diff * 0.04;
  }

  if (target.isJug) damage *= 0.7;
  if (targetSkill.id === 'will' && status.bigSkillCooldown === 0) {
    damage *= 0.3;
    status.bigSkillCooldown = targetSkill.value * 20;
    events.push('ironwill');
  }
  if (status.sSurge) damage *= 0.7;
  if (attacker.status.sSurge) damage *= 1.3;

  if (target.team && target.team === attacker.team && target !== attacker) {
    damage *= 0.3;
    extra.teamkill = true;
    if (gun.extra.noAllyDmg) return { applied: false, reason: 'noAllyDmg', damage: 0, died: false, events };
  }

  let critChance = attacker.unitInfo.crit;
  if (attackerSkill.id === 'shadow' && attacker.status.sInvis === 1 && attacker.gun.curGun.typeName === 'Melee') {
    critChance += attackerSkill.value;
  }
  if (attacker.gun.curGun.extra.critical) critChance += attacker.gun.curGun.extra.critical;

  if (extra.headMult && gun.typeName !== 'Explosive' && gun.typeName !== 'Melee' && target !== attacker) {
    // Status.as stores gun.extra.headDmg in an unused local (loc8); source
    // damage is therefore multiplied only by unitInfo.headBonus here.
    damage *= attacker.unitInfo.headBonus;
    events.push('headshot');
  } else if (random() <= critChance && target !== attacker) {
    extra.critMult = true;
    let critMultiplier = attacker.unitInfo.critBonus;
    if (attacker.gun.curGun.extra.criticalDmg) critMultiplier += attacker.gun.curGun.extra.criticalDmg;
    damage *= critMultiplier;
    events.push('critical');
  }

  if (extra.splashMult) damage *= extra.splashMult;
  if (attacker.gun.curGun.typeName === 'Explosive' && targetSkill.id === 'resist') damage *= targetSkill.value;
  if (attacker.gun.curGun.typeName === 'Explosive' && target.gun.primary.extra.resist) damage *= target.gun.primary.extra.resist;
  if (extra.shielded) damage *= 1 - target.gun.primary.extra.reduce;
  else if (target.gun.primary.typeName === 'Shield' && targetSkill.id === 'iron') damage *= targetSkill.value;

  if (status.shCur && !bypassProtection) {
    status.shCur -= damage;
    if (status.shCur <= 0) {
      damage = -status.shCur;
      status.shCur = 0;
    } else {
      damage = 0;
    }
  }

  status.hpCur -= damage;
  if (!bypassProtection && status.hpCur <= 0 && targetSkill.id === 'operation' && !status.bigSkillCooldown) {
    status.bigSkillCooldown = targetSkill.value * 30;
    heal(status, status.hpMax * 0.5);
    events.push('operation');
  }

  let died = false;
  if (status.hpCur <= 0) {
    status.hpCur = 0;
    died = true;
    events.push('die');
  } else if ((targetSkill.id === 'blur' || targetSkill.id === 'blur2') && !status.bigSkillCooldown && status.hpCur < status.hpMax * 0.3) {
    status.bigSkillCooldown = targetSkill.value * 30;
    status.sBlur = 2 * 30;
    events.push('blur');
  }

  status.stealthDelay = targetSkill.id === 'shadow2' ? 10 : 60;
  if (targetSkill.id !== 'regen') status.regenDelay = 30 * 3;
  setBars(status);
  return { applied: true, reason: null, damage, died, events };
}

// Numeric/timer port of Status.EnterFrame():309-570. Flash visual effects,
// sound and particle calls are returned as source-named events for their
// dedicated render/audio consumers; this function never invents a visual.
export function advanceTutorialStatusFrame(unit) {
  const status = unit.status;
  const skill = skillOf(unit);
  const events = [];
  let bloodAlpha = null;
  status.fc += 1;
  if (status.bigSkillCooldown) status.bigSkillCooldown -= 1;
  if (unit.unitInfo.extra?.permaSurge) status.sSurge = 99;

  if (status.sSurge) {
    if (status.sSurge === 1) events.push('endSurge');
    status.sSurge -= 1;
  }
  if (status.sReflect) {
    if (status.sReflect === 1) events.push('endReflect');
    status.sReflect -= 1;
  }
  if (status.sBlur) status.sBlur -= 1;
  if (status.sFire) {
    if (status.fc % 10 === 0) events.push('fireBullet');
    if (unit.unitInfo.streak?.id === 'fire' && unit.streakInProgress && status.sFire === 1) events.push('endFire');
    status.sFire -= 1;
  }
  if (status.sSpawn) status.sSpawn -= 1;

  if (status.barHurtWidth > 0) status.barHurtWidth += (0 - status.barHurtWidth) * 0.1;
  else status.barHurtWidth = 0;

  if (skill.id === 'shadow') {
    if (!unit.crouching || unit.hasFlag) status.stealthDelay = 60;
    if (status.stealthDelay) {
      status.stealthDelay -= 1;
      status.sInvis -= 0.1;
      if (status.sInvis < 0) status.sInvis = 0;
    } else {
      status.sInvis += 0.05;
      if (status.sInvis > 1) status.sInvis = 1;
    }
  } else if (skill.id === 'shadow2') {
    if (unit.hasFlag) status.stealthDelay = 60;
    if (status.stealthDelay) {
      status.stealthDelay -= 1;
      status.sInvis -= 0.1;
      if (status.sInvis < 0) status.sInvis = 0;
    } else {
      status.sInvis += 0.1;
      if (status.sInvis > 1) status.sInvis = 1;
    }
  }

  if (status.sRapidHeal) {
    heal(status, status.hpMax * 0.003);
    if (unit.unitInfo.streak?.id === 'rapid' && unit.streakInProgress && status.sRapidHeal === 1) events.push('endRapid');
    status.sRapidHeal -= 1;
  } else if (status.regenDelay) {
    status.regenDelay -= 1;
  } else {
    heal(status, unit.unitInfo.regen);
    if (status.hpCur < status.hpMax) events.push(skill.id === 'adren' ? 'regenRed' : 'regen');
  }

  if (unit.human) {
    const ratio = status.hpCur / status.hpMax;
    bloodAlpha = ratio > 0.5 ? 0 : 1 - ratio * 1.8;
  }
  return { events, bloodAlpha };
}
