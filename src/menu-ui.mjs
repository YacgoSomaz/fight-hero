// Coordinates are measured from the locally exported 1440×1080 SWF menu
// frames. We expose only controls which already have an actual local action.
const area = (id, action, label, left, top, width, height) => Object.freeze({ id, action, label, left, top, width, height });

const MENU_HIT_AREAS = Object.freeze({
  home: Object.freeze([
    area('home-campaign', 'preview:campaign', '战役（仅原始菜单预览）', 27.5, 55.0, 13.5, 3.7),
    area('home-challenges', 'preview:challenges', '挑战（仅原始菜单预览）', 27.5, 58.6, 13.5, 3.7),
    area('home-quickmatch', 'show:quickmatch', '快速对战', 27.5, 62.0, 13.5, 3.9),
  ]),
  quickmatch: Object.freeze([
    area('quick-mode-dm', 'quick:mode:dm', 'Deathmatch', 27.6, 30.0, 2.9, 4.5),
    area('quick-mode-jug', 'quick:mode:jug', 'Juggernaut', 30.8, 30.0, 2.9, 4.5),
    area('quick-mode-tdm', 'quick:mode:tdm', 'Team Deathmatch', 34.0, 30.0, 2.9, 4.5),
    area('quick-mode-ctf', 'quick:mode:ctf', 'Capture the Flag', 37.2, 30.0, 2.9, 4.5),
    area('quick-mode-dom', 'quick:mode:dom', 'Domination', 40.4, 30.0, 2.9, 4.5),
    area('quick-map-prev', 'quick:map:-1', 'Previous map', 47.0, 31.0, 4.0, 7.0),
    area('quick-map-next', 'quick:map:1', 'Next map', 71.0, 31.0, 4.0, 7.0),
    area('quick-score-prev', 'quick:score:-1', 'Previous score limit', 33.7, 43.6, 4.0, 3.4),
    area('quick-score-next', 'quick:score:1', 'Next score limit', 41.9, 43.6, 4.0, 3.4),
    area('quick-soldiers-prev', 'quick:soldiers:-1', 'Previous soldier restriction', 33.7, 46.2, 4.0, 3.4),
    area('quick-soldiers-next', 'quick:soldiers:1', 'Next soldier restriction', 41.9, 46.2, 4.0, 3.4),
    area('quick-skills-prev', 'quick:skills:-1', 'Toggle skills', 33.7, 50.0, 4.0, 3.4),
    area('quick-skills-next', 'quick:skills:1', 'Toggle skills', 41.9, 50.0, 3.4, 3.4),
    area('quick-streaks-prev', 'quick:streaks:-1', 'Toggle killstreaks', 33.7, 52.6, 4.0, 3.4),
    area('quick-streaks-next', 'quick:streaks:1', 'Toggle killstreaks', 41.9, 52.6, 3.4, 3.4),
    area('quick-modifier-prev', 'quick:modifier:-1', 'Previous modifier', 33.7, 56.0, 4.0, 3.4),
    area('quick-modifier-next', 'quick:modifier:1', 'Next modifier', 41.9, 56.0, 3.4, 3.4),
    area('quick-difficulty-prev', 'quick:difficulty:-1', 'Previous difficulty', 51.3, 58.4, 4.0, 3.4),
    area('quick-difficulty-next', 'quick:difficulty:1', 'Next difficulty', 59.5, 58.4, 4.0, 3.4),
    area('quick-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3),
    area('quick-start', 'start:foundry-deathmatch', '开始游戏', 64.0, 60.4, 13.0, 4.3),
  ]),
  campaign: Object.freeze([area('campaign-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3)]),
  challenges: Object.freeze([area('challenges-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3)]),
});

export const DEFAULT_MENU_SCREEN = 'home';
export const MENU_TRANSLATION_TOP = 74;
export const MENU_QUICK_SUMMARY_TOP = 80;
export const MENU_PRESENTATION_MODE = 'source-art-only';

export const MENU_CHINESE_COPY = Object.freeze({
  home: Object.freeze({ title: '主菜单', campaign: '战役', challenges: '挑战', quickmatch: '快速对战', availability: '当前已可用：快速对战 → 铸造厂 · 死亡竞赛。' }),
  quickmatch: Object.freeze({ title: '快速对战', back: '返回', start: '开始游戏', availability: '可开始：铸造厂 · 死亡竞赛。' }),
  campaign: Object.freeze({ title: '战役', back: '返回', availability: '战役任务尚未迁移：仅可查看原始菜单。' }),
  challenges: Object.freeze({ title: '挑战', back: '返回', availability: '挑战任务尚未迁移：仅可查看原始菜单。' }),
});

export function getMenuHitAreas(screen) {
  return MENU_HIT_AREAS[screen] ?? [];
}
