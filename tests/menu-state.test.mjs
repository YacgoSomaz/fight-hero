import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS, ORIGINAL_MAPS, ORIGINAL_MODES, createMatchSelection, getQuickMatchStatus, isPlayableSelection, updateMatchSelection } from '../src/menu-state.mjs';

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

test('only the migrated Foundry deathmatch selection can currently launch', () => {
  assert.equal(isPlayableSelection(createMatchSelection()), true);
  assert.equal(isPlayableSelection(createMatchSelection({ mode: 'ctf' })), false);
  assert.equal(isPlayableSelection(createMatchSelection({ map: 'train' })), false);
});

test('quick-match view keeps score choices sourced from the selected original mode', () => {
  const selection = updateMatchSelection(createMatchSelection(), { mode: 'ctf' });
  assert.equal(selection.score, 3);
  assert.deepEqual(selection.scoreOptions, [3, 5, 7, 15]);
  assert.deepEqual(getQuickMatchStatus(selection), {
    canLaunch: false,
    message: '该地图或模式尚未完成原版地图、碰撞与规则迁移。',
  });
});
