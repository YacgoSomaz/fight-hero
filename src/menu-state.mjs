// Source: Stats_Maps.as, Stats_Misc.as, MatchSettings.as and Stats_Campaign.as
// from the locally decoded SWF. These are data records, not newly invented modes.
export const ORIGINAL_MAPS = Object.freeze([
  ['tut', 'Facility'], ['foundry', 'Foundry'], ['foundry2', 'Foundry (Night)'],
  ['train', 'Speeding Train'], ['train2', 'Dormant Train'], ['plane', 'Hijack'],
  ['plane2', 'Hijack (Dawn)'], ['swamp', 'Village'], ['swamp2', 'Village (Night)'],
  ['cave', 'Caverns'], ['cave2', 'Caverns (Dusk)'],
].map(([id, name]) => Object.freeze({ id, name })));

export const ORIGINAL_MODES = Object.freeze([
  ['dm', 'Deathmatch', 'Kills to win', [5, 10, 15, 25, 50], 1],
  ['jug', 'Juggernaut', 'Kills to win', [5, 10, 25, 50, 100], 1],
  ['tdm', 'Team Deathmatch', 'Kills to win', [10, 15, 25, 50, 100], 2],
  ['ctf', 'Capture the Flag', 'Flags to win', [3, 5, 7, 15], 2],
  ['dom', 'Domination', 'Points to win', [50, 75, 100, 150, 200], 2],
].map(([id, name, scoreType, scores, teams]) => Object.freeze({ id, name, scoreType, scores, teams })));

const sourceMissions = [
  ['tdm', 15, 'tut', 1, 'Under Siege'], ['tdm', 20, 'swamp', 2, 'Rebellion'], ['tdm', 25, 'plane', 2, 'Hijacked'],
  ['dm', 15, 'cave', 3, 'Infection'], ['tdm', 15, 'tut', 3, 'Siege Under'], ['dom', 100, 'swamp2', 4, 'The Cure'],
  ['ctf', 3, 'foundry', 4, 'Intelligence'], ['tdm', 20, 'cave2', 5, 'Tropic Thunder'], ['dom', 100, 'tut', 5, 'Hide and Seek'],
  ['tdm', 30, 'foundry2', 6, 'The Return'], ['tdm', 20, 'train2', 6, 'Plan B'], ['dom', 100, 'train', 7, 'On Rails'],
  ['tdm', 15, 'dropship', 7, 'Boarding Action'], ['dom', 100, 'missile', 8, 'One Final Effort'], ['tdm', 15, 'missile2', 8, 'The Final Showdown'],
];
const sourceChallenges = [
  ['tdm', 15, 'cave', 8, 'Double Agent'], ['dm', 30, 'plane', 8, 'Kevlar'], ['tdm', 25, 'tut', 9, 'Man with the Golden Gun'],
  ['dm', 20, 'train', 9, 'Rocket Race'], ['dm', 15, 'foundry', 10, 'Prepared'], ['tdm', 25, 'swamp', 10, 'Norris, Chuck'],
  ['tdm', 20, 'dropship', 11, 'Golf Season'], ['tdm', 25, 'plane2', 11, 'Ninja Assault'], ['jug', 20, 'cave2', 12, 'Poison'],
  ['tdm', 12, 'train', 12, 'Big Brother'], ['ctf', 7, 'tut', 13, 'Self Experiments'], ['tdm', 20, 'swamp', 13, 'Knife to a Gunfight'],
  ['tdm', 15, 'swamp2', 14, 'Hide and Seek'], ['dm', 20, 'swamp', 14, 'Vampire'], ['tdm', 15, 'tut', 15, 'Meet Your Makers'],
];
const toMissions = (items) => Object.freeze(items.map(([mode, score, map, difficulty, title], index) => Object.freeze({
  stage: index + 1, title, map, mode, score, difficulty,
})));
export const CAMPAIGN_MISSIONS = toMissions(sourceMissions);
export const CHALLENGE_MISSIONS = toMissions(sourceChallenges);

export function createMatchSelection(overrides = {}) {
  return { map: 'foundry', mode: 'dm', score: 10, difficulty: 1, bots: 1, skills: true, streaks: true, modifier: 'none', ...overrides };
}

// Only this combination has already had its map art, collision, node graph and
// match rule migrated. The menu must not present unported source data as playable.
export function isPlayableSelection(selection) { return selection.map === 'foundry' && selection.mode === 'dm'; }
