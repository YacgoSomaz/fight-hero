import { SOURCE_CLASS_PROFILES } from './class-source.mjs';
import { SOURCE_DEFAULT_CLASS_SAVES } from './sd-default-profile-source.mjs';

const CLASS_BY_ID = new Map(SOURCE_CLASS_PROFILES.map((profile) => [profile.id, profile]));

function sourceAtLevel(profile, level) {
  const atLevel = (range) => range.min + (range.max - range.min) / 49 * (level - 1);
  return {
    hp: atLevel(profile.stats.hp),
    crit: atLevel(profile.stats.crit) * 0.01,
    aim: atLevel(profile.stats.aim) * 0.01,
    ammo: atLevel(profile.stats.ammo) * 0.01,
  };
}

// Port of Campaign MatchSettings.updatePlayer(), followed by the numeric
// class fields Unit.setClass() writes to `unitInfo`.  The caller may provide
// decoded original save data; absent that, SD.Init's deterministic new-save
// records are the only permitted default.
export function createTutorialPlayerProfile(actor, { classSaves = SOURCE_DEFAULT_CLASS_SAVES } = {}) {
  const profile = CLASS_BY_ID.get(actor.soldier);
  if (!profile) throw new Error(`Campaign player has no decoded source class: ${actor.soldier}`);
  const save = classSaves[profile.number];
  if (!save) throw new Error(`Campaign player save is unavailable for original class ${profile.number}`);
  const extra = actor.definition?.extra ?? actor.extra;
  const level = extra?.level || save.level;
  return {
    name: actor.name || 'Player',
    soldier: actor.soldier,
    skin: actor.skin || save.skin,
    team: actor.team,
    skill: actor.skill || save.skill,
    streak: actor.streak || save.streak,
    primary: actor.guns?.primary || save.primary,
    secondary: actor.guns?.secondary || save.secondary,
    level,
    extra,
    diff: 10,
    ...sourceAtLevel(profile, level),
  };
}
