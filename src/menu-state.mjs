// Source: Stats_Maps.as, Stats_Misc.as, MatchSettings.as and Stats_Campaign.as
// from the locally decoded SWF. These are data records, not newly invented modes.
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { getSourceMissionLaunch } from './source-mission-launch.mjs';
export const ORIGINAL_MAPS = Object.freeze([
  ['tut', 'Facility'], ['foundry', 'Foundry'], ['foundry2', 'Foundry (Night)'],
  ['train', 'Speeding Train'], ['train2', 'Dormant Train'], ['plane', 'Hijack'],
  ['plane2', 'Hijack (Dawn)'], ['swamp', 'Village'], ['swamp2', 'Village (Night)'],
  ['cave', 'Caverns'], ['cave2', 'Caverns (Dusk)'],
].map(([id, name]) => Object.freeze({ id, name })));

export const ORIGINAL_MODES = Object.freeze([
  ['dm', 'Deathmatch', 'Kills to win', [5, 10, 15, 25, 50], 1, 10],
  ['jug', 'Juggernaut', 'Kills to win', [5, 10, 25, 50, 100], 1, 10],
  ['tdm', 'Team Deathmatch', 'Kills to win', [10, 15, 25, 50, 100], 2, 25],
  ['ctf', 'Capture the Flag', 'Flags to win', [3, 5, 7, 15], 2, 3],
  ['dom', 'Domination', 'Points to win', [50, 75, 100, 150, 200], 2, 50],
].map(([id, name, scoreType, scores, teams, startScore]) => Object.freeze({ id, name, scoreType, scores, teams, startScore })));

export const QUICKMATCH_MODIFIERS = Object.freeze(['none', 'clips']);
export const QUICKMATCH_DIFFICULTIES = Object.freeze([1, 3, 5, 7, 9]);
const QUICKMATCH_SOLDIER_NAMES = Object.freeze(['All', 'Medics Only', 'Assault Only', 'Snipers Only', 'Gunners Only']);
const QUICKMATCH_DIFFICULTY_NAMES = Object.freeze({ 1: 'Very Easy', 3: 'Easy', 5: 'Normal', 7: 'Hard', 9: 'Insane' });

const toMissions = (items) => Object.freeze(items.map((definition) => Object.freeze({
  stage: definition.stage,
  title: definition.title,
  map: definition.map,
  mode: definition.mode,
  score: definition.score,
  difficulty: definition.difficulty,
  definition,
})));
export const CAMPAIGN_MISSIONS = toMissions(SOURCE_CAMPAIGN_CATALOG.campaign);
export const CHALLENGE_MISSIONS = toMissions(SOURCE_CAMPAIGN_CATALOG.challenges);

export function createMatchSelection(overrides = {}) {
  return { map: 'foundry', mode: 'dm', score: 10, difficulty: 1, bots: 1, soldiers: 0, skills: true, streaks: true, modifier: 'none', ...overrides };
}

export function updateMatchSelection(selection, changes) {
  const next = { ...selection, ...changes };
  const mode = ORIGINAL_MODES.find((entry) => entry.id === next.mode) ?? ORIGINAL_MODES[0];
  const scoreOptions = [...mode.scores];
  // Mission data may use a score that is not selectable in the quick-match
  // arrows (for example Rebellion's authored 20 TDM kills).
  if (!scoreOptions.includes(next.score) && !Object.hasOwn(changes, 'score')) next.score = mode.startScore;
  // A source campaign/challenge record changes mode and score together.
  // Preserve that authored score; only a standalone quick-match mode click
  // should reset to the mode's regular default.
  if (Object.hasOwn(changes, 'mode') && !Object.hasOwn(changes, 'score')) next.score = mode.startScore;
  return { ...next, scoreOptions };
}

function nextSourceValue(current, values, direction) {
  const index = values.indexOf(current);
  return values[(index + (direction < 0 ? -1 : 1) + values.length) % values.length];
}

// Mirrors the quick-match click cases in Menu.as: score, soldier restriction,
// skills, streaks, modifier, difficulty, map arrows and mode icons.
export function cycleQuickMatchSelection(selection, control, direction = 1) {
  switch (control) {
    case 'mode': return updateMatchSelection(selection, { mode: nextSourceValue(selection.mode, ORIGINAL_MODES.map(({ id }) => id), direction) });
    case 'map': return updateMatchSelection(selection, { map: nextSourceValue(selection.map, ORIGINAL_MAPS.map(({ id }) => id), direction) });
    case 'score': {
      const mode = ORIGINAL_MODES.find(({ id }) => id === selection.mode) ?? ORIGINAL_MODES[0];
      return updateMatchSelection(selection, { score: nextSourceValue(selection.score, mode.scores, direction) });
    }
    case 'soldiers': return updateMatchSelection(selection, { soldiers: nextSourceValue(selection.soldiers, [0, 1, 2, 3, 4], direction) });
    case 'skills': return updateMatchSelection(selection, { skills: !selection.skills });
    case 'streaks': return updateMatchSelection(selection, { streaks: !selection.streaks });
    case 'modifier': return updateMatchSelection(selection, { modifier: nextSourceValue(selection.modifier, QUICKMATCH_MODIFIERS, direction) });
    case 'difficulty': return updateMatchSelection(selection, { difficulty: nextSourceValue(selection.difficulty, QUICKMATCH_DIFFICULTIES, direction) });
    default: return updateMatchSelection(selection, {});
  }
}

export function formatQuickMatchSummary(selection) {
  const map = ORIGINAL_MAPS.find(({ id }) => id === selection.map) ?? ORIGINAL_MAPS[0];
  const mode = ORIGINAL_MODES.find(({ id }) => id === selection.mode) ?? ORIGINAL_MODES[0];
  return `${map.name} · ${mode.name} · Score ${selection.score} · ${QUICKMATCH_SOLDIER_NAMES[selection.soldiers] ?? QUICKMATCH_SOLDIER_NAMES[0]} · ${QUICKMATCH_DIFFICULTY_NAMES[selection.difficulty] ?? QUICKMATCH_DIFFICULTY_NAMES[1]}`;
}

// These rules now consume Arena's decoded spawn/objective nodes in the local
// runtime.  Juggernaut additionally applies the original Unit.setJug role
// transfer, so it is no longer represented by a fake launch button.
const PLAYABLE_SOURCE_MODES = new Set(['dm', 'jug', 'tdm', 'ctf', 'dom']);
// Quick Match exposes only Stats_Maps entries, while Campaign/Challenges
// additionally use the decoded Dropship and Missile Arena timelines.
const PLAYABLE_SOURCE_MAPS = new Set([
  ...ORIGINAL_MAPS.map(({ id }) => id),
  ...CAMPAIGN_MISSIONS.map(({ map }) => map),
  ...CHALLENGE_MISSIONS.map(({ map }) => map),
]);
const PLAYABLE_MODE_NAMES = Object.freeze({ dm: '死亡竞赛', jug: 'Juggernaut', tdm: '团队死斗', ctf: '夺旗', dom: '据点占领' });
export function isPlayableSelection(selection) {
  // A campaign/challenge item carries a complete Stats_Campaign record. Until
  // its actors, script and completion flow are actually migrated, launching
  // its map with quick-match defaults would be a false playable claim.
  if (selection.definition) return Boolean(getSourceMissionLaunch(selection));
  return PLAYABLE_SOURCE_MAPS.has(selection.map) && PLAYABLE_SOURCE_MODES.has(selection.mode);
}

export function getQuickMatchStatus(selection) {
  const sourceMissionLaunch = getSourceMissionLaunch(selection);
  if (sourceMissionLaunch) return {
    canLaunch: true,
    message: `${sourceMissionLaunch.message} 它仍处于逐项原版验证中，不代表战役或游戏已完成。`,
  };
  if (selection.definition) return {
    canLaunch: false,
    message: '该原始任务的角色、脚本、过场或胜负流程尚未完整迁移，不能伪装为快速对战。',
  };
  return isPlayableSelection(selection)
    ? { canLaunch: true, message: `原场景地图、碰撞、导航与本地${PLAYABLE_MODE_NAMES[selection.mode]}规则已接入。` }
    : { canLaunch: false, message: '该地图或模式尚未完成原版地图、碰撞与规则迁移。' };
}
