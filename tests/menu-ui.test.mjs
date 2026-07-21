import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEFAULT_MENU_SCREEN, MENU_CHINESE_COPY, MENU_PRESENTATION_MODE, MENU_QUICK_SUMMARY_TOP, MENU_TRANSLATION_TOP, getMenuHitAreas } from '../src/menu-ui.mjs';

test('only source-menu actions with a real local outcome receive a hit area', () => {
  assert.deepEqual(getMenuHitAreas('home').map(({ id, action }) => ({ id, action })), [
    { id: 'home-campaign', action: 'show:campaign' },
    { id: 'home-challenges', action: 'show:challenges' },
    { id: 'home-quickmatch', action: 'show:quickmatch' },
    { id: 'tab-play', action: 'show:quickmatch' },
    { id: 'tab-soldiers', action: 'show:soldiers' },
    { id: 'tab-options', action: 'show:options' },
    { id: 'tab-medals', action: 'show:medals' },
    { id: 'tab-tips', action: 'show:tips' },
    { id: 'tab-version', action: 'show:version' },
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
    { id: 'quick-start', action: 'start:selected-match' },
  ]);
  for (const kind of ['campaign', 'challenges']) {
    const areas = getMenuHitAreas(kind);
    const stageAreas = areas.filter(({ action }) => action.startsWith(`mission:${kind}:`));
    assert.equal(stageAreas.length, 15);
    assert.deepEqual(stageAreas.slice(0, 2).map(({ id, action }) => ({ id, action })), [
      { id: `${kind}-stage-1`, action: `mission:${kind}:0` },
      { id: `${kind}-stage-2`, action: `mission:${kind}:1` },
    ]);
    assert.ok(areas.some(({ action }) => action === `start:mission:${kind}`));
  }
  for (const screen of ['soldiers', 'options', 'medals', 'tips', 'version']) {
    assert.deepEqual(getMenuHitAreas(screen).map(({ id, action }) => ({ id, action })), [
      { id: 'tab-play', action: 'show:quickmatch' },
      { id: 'tab-soldiers', action: 'show:soldiers' },
      { id: 'tab-options', action: 'show:options' },
      { id: 'tab-medals', action: 'show:medals' },
      { id: 'tab-tips', action: 'show:tips' },
      { id: 'tab-version', action: 'show:version' },
    ]);
  }
});

test('source menu hit areas use the exported 1443×985 image coordinates, with no invisible launch target', () => {
  const home = getMenuHitAreas('home');
  assert.deepEqual(home.slice(0, 4).map(({ id, action, top }) => ({ id, action, top })), [
    { id: 'home-campaign', action: 'show:campaign', top: 60.4 },
    { id: 'home-challenges', action: 'show:challenges', top: 64.3 },
    { id: 'home-quickmatch', action: 'show:quickmatch', top: 68.1 },
    { id: 'tab-play', action: 'show:quickmatch', top: 73.1 },
  ]);
  const quick = getMenuHitAreas('quickmatch');
  assert.equal(quick.find(({ id }) => id === 'quick-start').top, 67.2);
  assert.equal(quick.find(({ id }) => id === 'quick-back').top, 67.2);
});

test('visible Chinese copy describes real selectable source-mission entries', () => {
  assert.equal(MENU_CHINESE_COPY.home.quickmatch, '快速对战');
  assert.equal(MENU_CHINESE_COPY.campaign.availability, '可选择原始战役任务，并以已迁移地图与规则启动。');
  assert.equal(MENU_CHINESE_COPY.challenges.availability, '可选择原始挑战任务，并以已迁移地图与规则启动。');
  assert.equal(MENU_CHINESE_COPY.quickmatch.availability, '可开始：5 种已迁移的原始对战规则。');
});

test('the first visible menu is the source home screen with real menu controls', () => {
  assert.equal(DEFAULT_MENU_SCREEN, 'home');
  assert.equal(getMenuHitAreas(DEFAULT_MENU_SCREEN).length, 9);
});

test('Chinese availability copy stays below the original bottom navigation art', () => {
  assert.equal(MENU_TRANSLATION_TOP, 74);
});

test('the source art stays visually unmodified while Chinese remains available to assistive controls', () => {
  assert.equal(MENU_PRESENTATION_MODE, 'source-art-only');
  assert.equal(getMenuHitAreas('home')[2].label, '快速对战');
});

test('quick-match feedback sits in the source frame black margin, below its navigation strip', () => {
  assert.equal(MENU_QUICK_SUMMARY_TOP, 80);
});

test('starting a match hides the source menu instead of leaving it painted above the canvas', () => {
  const stylesheet = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  assert.match(stylesheet, /#sourceMenu\[hidden\]\s*\{\s*display\s*:\s*none\s*;?\s*\}/);
});

test('menu surface uses the exact exported source frame ratio so visible buttons and hit areas align', () => {
  const stylesheet = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  assert.match(stylesheet, /\.menu-surface\s*\{[^}]*aspect-ratio\s*:\s*1443\s*\/\s*985\s*;/);
  assert.doesNotMatch(stylesheet, /\.menu-surface img\s*\{[^}]*object-fit\s*:\s*contain/);
});
