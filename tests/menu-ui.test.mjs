import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MENU_SCREEN, MENU_CHINESE_COPY, MENU_PRESENTATION_MODE, MENU_TRANSLATION_TOP, getMenuHitAreas } from '../src/menu-ui.mjs';

test('only source-menu actions with a real local outcome receive a hit area', () => {
  assert.deepEqual(getMenuHitAreas('home').map(({ id, action }) => ({ id, action })), [
    { id: 'home-campaign', action: 'preview:campaign' },
    { id: 'home-challenges', action: 'preview:challenges' },
    { id: 'home-quickmatch', action: 'show:quickmatch' },
  ]);
  assert.deepEqual(getMenuHitAreas('quickmatch').map(({ id, action }) => ({ id, action })), [
    { id: 'quick-mode-dm', action: 'quick:mode:dm' },
    { id: 'quick-mode-jug', action: 'quick:mode:jug' },
    { id: 'quick-mode-tdm', action: 'quick:mode:tdm' },
    { id: 'quick-mode-ctf', action: 'quick:mode:ctf' },
    { id: 'quick-mode-dom', action: 'quick:mode:dom' },
    { id: 'quick-map-prev', action: 'quick:map:-1' },
    { id: 'quick-map-next', action: 'quick:map:1' },
    { id: 'quick-score-prev', action: 'quick:score:-1' },
    { id: 'quick-score-next', action: 'quick:score:1' },
    { id: 'quick-soldiers-prev', action: 'quick:soldiers:-1' },
    { id: 'quick-soldiers-next', action: 'quick:soldiers:1' },
    { id: 'quick-skills-prev', action: 'quick:skills:-1' },
    { id: 'quick-skills-next', action: 'quick:skills:1' },
    { id: 'quick-streaks-prev', action: 'quick:streaks:-1' },
    { id: 'quick-streaks-next', action: 'quick:streaks:1' },
    { id: 'quick-modifier-prev', action: 'quick:modifier:-1' },
    { id: 'quick-modifier-next', action: 'quick:modifier:1' },
    { id: 'quick-difficulty-prev', action: 'quick:difficulty:-1' },
    { id: 'quick-difficulty-next', action: 'quick:difficulty:1' },
    { id: 'quick-back', action: 'show:home' },
    { id: 'quick-start', action: 'start:foundry-deathmatch' },
  ]);
  assert.deepEqual(getMenuHitAreas('campaign').map(({ id }) => id), ['campaign-back']);
  assert.deepEqual(getMenuHitAreas('challenges').map(({ id }) => id), ['challenges-back']);
});

test('visible Chinese copy marks preview-only screens instead of promising unported gameplay', () => {
  assert.equal(MENU_CHINESE_COPY.home.quickmatch, '快速对战');
  assert.equal(MENU_CHINESE_COPY.campaign.availability, '战役任务尚未迁移：仅可查看原始菜单。');
  assert.equal(MENU_CHINESE_COPY.challenges.availability, '挑战任务尚未迁移：仅可查看原始菜单。');
  assert.equal(MENU_CHINESE_COPY.quickmatch.availability, '可开始：铸造厂 · 死亡竞赛。');
});

test('the first visible menu is the source home screen with real menu controls', () => {
  assert.equal(DEFAULT_MENU_SCREEN, 'home');
  assert.equal(getMenuHitAreas(DEFAULT_MENU_SCREEN).length, 3);
});

test('Chinese availability copy stays below the original bottom navigation art', () => {
  assert.equal(MENU_TRANSLATION_TOP, 74);
});

test('the source art stays visually unmodified while Chinese remains available to assistive controls', () => {
  assert.equal(MENU_PRESENTATION_MODE, 'source-art-only');
  assert.equal(getMenuHitAreas('home')[2].label, '快速对战');
});
