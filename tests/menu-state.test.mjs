import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS, ORIGINAL_MAPS, ORIGINAL_MODES, cycleQuickMatchSelection, createMatchSelection, formatQuickMatchSummary, getQuickMatchStatus, isPlayableSelection, updateMatchSelection } from '../src/menu-state.mjs';

test('menu exposes the original quick-match modes and source map order', () => {
  assert.deepEqual(ORIGINAL_MODES.map((mode) => mode.id), ['dm', 'jug', 'tdm', 'ctf', 'dom']);
  assert.deepEqual(ORIGINAL_MAPS.map((map) => map.id), ['tut', 'foundry', 'foundry2', 'train', 'train2', 'plane', 'plane2', 'swamp', 'swamp2', 'cave', 'cave2']);
});

test('menu preserves all extracted campaign and challenge mission entries', () => {
  assert.equal(CAMPAIGN_MISSIONS.length, 15);
  assert.equal(CHALLENGE_MISSIONS.length, 15);
  assert.deepEqual(CAMPAIGN_MISSIONS[6], { stage: 7, title: 'Intelligence', map: 'foundry', mode: 'ctf', score: 3, difficulty: 4 });
  assert.deepEqual(CHALLENGE_MISSIONS[4], { stage: 5, title: 'Prepared', map: 'foundry', mode: 'dm', score: 15, difficulty: 10 });
});

test('selecting an extracted mission keeps its authored score instead of replacing it with quick-match defaults', () => {
  const selected = updateMatchSelection(createMatchSelection(), CAMPAIGN_MISSIONS[1]);
  assert.deepEqual(
    { map: selected.map, mode: selected.mode, score: selected.score, difficulty: selected.difficulty },
    { map: 'swamp', mode: 'tdm', score: 20, difficulty: 2 },
  );
});

test('every source Arena map can launch the migrated local deathmatch and team deathmatch rules', () => {
  assert.equal(isPlayableSelection(createMatchSelection()), true);
  assert.equal(isPlayableSelection(createMatchSelection({ mode: 'tdm' })), true);
  assert.equal(isPlayableSelection(createMatchSelection({ map: 'train' })), true);
  assert.equal(isPlayableSelection(createMatchSelection({ map: 'cave2' })), true);
});

test('quick-match exposes every source rule that has a migrated match runtime', () => {
  const selection = updateMatchSelection(createMatchSelection(), { mode: 'ctf' });
  assert.equal(selection.score, 3);
  assert.deepEqual(selection.scoreOptions, [3, 5, 7, 15]);
  assert.deepEqual(getQuickMatchStatus(selection), {
    canLaunch: true,
    message: '原场景地图、碰撞、导航与本地夺旗规则已接入。',
  });
  assert.equal(isPlayableSelection(updateMatchSelection(createMatchSelection(), { mode: 'dom' })), true);
  assert.equal(isPlayableSelection(updateMatchSelection(createMatchSelection(), { mode: 'jug' })), true);
  assert.deepEqual(getQuickMatchStatus(updateMatchSelection(createMatchSelection(), { mode: 'jug' })), {
    canLaunch: true,
    message: '原场景地图、碰撞、导航与本地Juggernaut规则已接入。',
  });
});

test('quick-match controls follow the original Menu.as cyclic state changes', () => {
  let selection = createMatchSelection({ soldiers: 0 });
  selection = cycleQuickMatchSelection(selection, 'mode', 1);
  assert.deepEqual({ mode: selection.mode, score: selection.score }, { mode: 'jug', score: 10 });
  selection = cycleQuickMatchSelection(selection, 'soldiers', -1);
  assert.equal(selection.soldiers, 4);
  selection = cycleQuickMatchSelection(selection, 'skills');
  assert.equal(selection.skills, false);
  selection = cycleQuickMatchSelection(selection, 'difficulty', -1);
  assert.equal(selection.difficulty, 9);
  selection = cycleQuickMatchSelection(selection, 'modifier', 1);
  assert.equal(selection.modifier, 'clips');
  selection = cycleQuickMatchSelection(selection, 'map', 1);
  assert.equal(selection.map, 'foundry2');
});

test('changed quick-match settings report a compact English source-style summary outside the original panel', () => {
  const selection = createMatchSelection({ map: 'foundry2', mode: 'jug', score: 10, soldiers: 0, skills: true, streaks: true, modifier: 'none', difficulty: 1 });
  assert.equal(formatQuickMatchSummary(selection), 'Foundry (Night) · Juggernaut · Score 10 · All · Very Easy');
});
