import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS } from './menu-state.mjs';

// Coordinates are measured from the locally exported 1443×985 SWF menu
// frames. They intentionally match the image's intrinsic aspect ratio.
const area = (id, action, label, left, top, width, height) => Object.freeze({ id, action, label, left, top, width, height });

// Menu.as: tabbuts = ["play", "soldiers", "options", "medals", "tips", "version"].
// Measured against the FFDec-exported 1443×985 timeline frames.
const TAB_AREAS = Object.freeze([
  area('tab-play', 'show:quickmatch', '开始 / Play', 26.7, 73.1, 8.8, 3.9),
  area('tab-soldiers', 'show:soldiers', '士兵 / Soldiers', 35.7, 73.1, 9.2, 3.9),
  area('tab-options', 'show:options', '选项 / Options', 45.0, 73.1, 9.2, 3.9),
  area('tab-medals', 'show:medals', '勋章 / Medals', 54.3, 73.1, 9.0, 3.9),
  area('tab-tips', 'show:tips', '提示 / Tips', 63.4, 73.1, 8.2, 3.9),
  area('tab-version', 'show:version', '版本说明 / Version', 71.7, 73.1, 5.6, 3.9),
]);

function sourceMissionAreas(kind, missions) {
  // Source timeline frames 50/55 place all fifteen rows in this list panel.
  return Object.freeze(missions.map(({ stage, title }, index) => area(
    `${kind}-stage-${stage}`,
    `mission:${kind}:${index}`,
    `第 ${stage} 关：${title}`,
    25.6,
    33.5 + index * 2.42,
    19.3,
    2.25,
  )));
}

const CAMPAIGN_STAGE_AREAS = sourceMissionAreas('campaign', CAMPAIGN_MISSIONS);
const CHALLENGE_STAGE_AREAS = sourceMissionAreas('challenges', CHALLENGE_MISSIONS);

const MENU_HIT_AREAS = Object.freeze({
  home: Object.freeze([
    area('home-campaign', 'show:campaign', '战役', 27.4, 60.4, 13.5, 3.7),
    area('home-challenges', 'show:challenges', '挑战', 27.4, 64.3, 13.5, 3.7),
    area('home-quickmatch', 'show:quickmatch', '快速对战', 27.4, 68.1, 13.5, 3.9),
    ...TAB_AREAS,
  ]),
  quickmatch: Object.freeze([
    area('quick-mode-dm', 'quick:mode:dm', 'Deathmatch', 27.6, 33.1, 2.9, 4.5),
    area('quick-mode-jug', 'quick:mode:jug', 'Juggernaut', 30.8, 33.1, 2.9, 4.5),
    area('quick-mode-tdm', 'quick:mode:tdm', 'Team Deathmatch', 34.0, 33.1, 2.9, 4.5),
    area('quick-mode-ctf', 'quick:mode:ctf', 'Capture the Flag', 37.2, 33.1, 2.9, 4.5),
    area('quick-mode-dom', 'quick:mode:dom', 'Domination', 40.4, 33.1, 2.9, 4.5),
    area('quick-map-prev', 'quick:map:-1', 'Previous map', 47.0, 33.2, 4.0, 7.0),
    area('quick-map-next', 'quick:map:1', 'Next map', 71.0, 33.2, 4.0, 7.0),
    area('quick-score-prev', 'quick:score:-1', 'Previous score limit', 33.7, 48.4, 4.0, 3.4),
    area('quick-score-next', 'quick:score:1', 'Next score limit', 41.9, 48.4, 4.0, 3.4),
    area('quick-soldiers-prev', 'quick:soldiers:-1', 'Previous soldier restriction', 33.7, 50.7, 4.0, 3.4),
    area('quick-soldiers-next', 'quick:soldiers:1', 'Next soldier restriction', 41.9, 50.7, 4.0, 3.4),
    area('quick-skills-prev', 'quick:skills:-1', 'Toggle skills', 33.7, 54.5, 4.0, 3.4),
    area('quick-skills-next', 'quick:skills:1', 'Toggle skills', 41.9, 54.5, 3.4, 3.4),
    area('quick-streaks-prev', 'quick:streaks:-1', 'Toggle killstreaks', 33.7, 56.6, 4.0, 3.4),
    area('quick-streaks-next', 'quick:streaks:1', 'Toggle killstreaks', 41.9, 56.6, 3.4, 3.4),
    area('quick-modifier-prev', 'quick:modifier:-1', 'Previous modifier', 33.7, 60.5, 4.0, 3.4),
    area('quick-modifier-next', 'quick:modifier:1', 'Next modifier', 41.9, 60.5, 3.4, 3.4),
    area('quick-difficulty-prev', 'quick:difficulty:-1', 'Previous difficulty', 51.3, 63.2, 4.0, 3.4),
    area('quick-difficulty-next', 'quick:difficulty:1', 'Next difficulty', 59.5, 63.2, 4.0, 3.4),
    area('quick-back', 'show:home', '返回', 45.0, 67.2, 10.0, 4.3),
    area('quick-start', 'start:selected-match', '开始游戏', 64.0, 67.2, 13.0, 4.3),
  ]),
  campaign: Object.freeze([...CAMPAIGN_STAGE_AREAS, area('campaign-back', 'show:home', '返回', 45.0, 67.2, 10.0, 4.3), area('campaign-start', 'start:mission:campaign', '开始任务', 64.0, 67.2, 13.0, 4.3), ...TAB_AREAS]),
  challenges: Object.freeze([...CHALLENGE_STAGE_AREAS, area('challenges-back', 'show:home', '返回', 45.0, 67.2, 10.0, 4.3), area('challenges-start', 'start:mission:challenges', '开始任务', 64.0, 67.2, 13.0, 4.3), ...TAB_AREAS]),
  soldiers: TAB_AREAS,
  options: TAB_AREAS,
  medals: TAB_AREAS,
  tips: TAB_AREAS,
  version: TAB_AREAS,
});

export const DEFAULT_MENU_SCREEN = 'home';
export const MENU_TRANSLATION_TOP = 74;
export const MENU_QUICK_SUMMARY_TOP = 80;
export const MENU_PRESENTATION_MODE = 'source-art-only';

export const MENU_CHINESE_COPY = Object.freeze({
  home: Object.freeze({ title: '主菜单', campaign: '战役', challenges: '挑战', quickmatch: '快速对战', availability: '当前可用：战役、挑战与快速对战均可进入。' }),
  quickmatch: Object.freeze({ title: '快速对战', back: '返回', start: '开始游戏', availability: '可开始：5 种已迁移的原始对战规则。' }),
  campaign: Object.freeze({ title: '战役', back: '返回', start: '开始任务', availability: '可浏览原始战役目录；未完整迁移的任务会显示真实缺口。' }),
  challenges: Object.freeze({ title: '挑战', back: '返回', start: '开始任务', availability: '可浏览原始挑战目录；未完整迁移的任务会显示真实缺口。' }),
});

export function getMenuHitAreas(screen) {
  return MENU_HIT_AREAS[screen] ?? [];
}

export function getMissionEntries(screen) {
  if (screen === 'campaign') return CAMPAIGN_MISSIONS;
  if (screen === 'challenges') return CHALLENGE_MISSIONS;
  return [];
}
