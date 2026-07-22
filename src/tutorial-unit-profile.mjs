import { SOURCE_CLASS_PROFILES } from './class-source.mjs';
import { SOURCE_SKILLS } from './skill-source.mjs';

const CLASS_BY_ID = new Map(SOURCE_CLASS_PROFILES.map((profile) => [profile.id, profile]));
const SKILL_BY_ID = new Map(SOURCE_SKILLS.map((skill) => [skill.id, skill]));

function atLevel(range, level) {
  // Direct Stats_Classes.getClass() formula (Stats_Classes.as:99-102).
  return range.min + (range.max - range.min) / 49 * (level - 1);
}

// Direct Stats_Classes.getAiLevel(): UT.irand(-3,4) uses an inclusive range.
// A supplied RNG makes a captured original replay reproducible; no made-up
// fixed bot level is allowed.
export function getTutorialAiLevel(difficulty, random = Math.random) {
  const level = difficulty * 3 + Math.floor(random() * 8) - 3;
  return level > 0 ? level : 1;
}

function sourceSkill(id) {
  const skill = SKILL_BY_ID.get(id);
  if (!skill) throw new Error(`Original Stats_Skills entry is unavailable: ${id}`);
  return { id: skill.id, sprite: skill.sprite, value: skill.value };
}

// Source-only Unit.setClass numeric portion.  It deliberately leaves UnitMC,
// Guns.setGuns, streaks, HUD and AI.setDiffStats as their own consumers.
export function createTutorialUnitProfile({ soldier, level, skin, skill, primary, secondary, extra = {} }) {
  const classProfile = CLASS_BY_ID.get(soldier);
  if (!classProfile) throw new Error(`Original Stats_Classes entry is unavailable: ${soldier}`);
  const resolvedSkill = sourceSkill(skill);
  let hp = atLevel(classProfile.stats.hp, level);
  let crit = atLevel(classProfile.stats.crit, level) * 0.01;
  let aim = atLevel(classProfile.stats.aim, level) * 0.01;
  let ammo = atLevel(classProfile.stats.ammo, level) * 0.01;
  let headBonus = 1.45;
  let critBonus = 1.35;

  // Unit.setClass():222 only overrides hp when AS3 receives a truthy extra.hp.
  if (extra.hp) hp = extra.hp;
  if (resolvedSkill.id === 'health') hp += resolvedSkill.value;
  if (resolvedSkill.id === 'ammo') ammo += resolvedSkill.value;
  if (resolvedSkill.id === 'critical') {
    aim += resolvedSkill.value;
    crit += resolvedSkill.value;
  }
  if (resolvedSkill.id === 'combat') {
    hp += 10;
    ammo += 0.1;
    aim += 0.03;
    crit += 0.03;
  }
  if (resolvedSkill.id === 'vital') {
    headBonus += resolvedSkill.value;
    critBonus += resolvedSkill.value;
  }

  let regen = hp * 0.001;
  if (resolvedSkill.id === 'adren') regen = hp * 0.001 * resolvedSkill.value;
  return {
    level,
    number: classProfile.number,
    id: classProfile.id,
    // Stats_Classes.getClass() assigns `id = icon` in every playable class.
    icon: classProfile.id,
    name: classProfile.name,
    startFrame: classProfile.startFrame,
    runType: classProfile.runType,
    skinFrame: classProfile.startFrame + skin,
    hp,
    crit,
    aim,
    ammo,
    headBonus,
    critBonus,
    regen,
    skill: resolvedSkill,
    primary,
    secondary,
  };
}
