import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_MENU_SCREEN, MENU_CHINESE_COPY, getMenuHitAreas } from '../src/menu-ui.mjs';

test('only source-menu actions with a real local outcome receive a hit area', () => {
  assert.deepEqual(getMenuHitAreas('home').map(({ id, action }) => ({ id, action })), [
    { id: 'home-campaign', action: 'preview:campaign' },
    { id: 'home-challenges', action: 'preview:challenges' },
    { id: 'home-quickmatch', action: 'show:quickmatch' },
  ]);
  assert.deepEqual(getMenuHitAreas('quickmatch').map(({ id, action }) => ({ id, action })), [
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
