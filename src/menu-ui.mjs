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
    area('quick-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3),
    area('quick-start', 'start:foundry-deathmatch', '开始游戏', 64.0, 60.4, 13.0, 4.3),
  ]),
  campaign: Object.freeze([area('campaign-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3)]),
  challenges: Object.freeze([area('challenges-back', 'show:home', '返回', 45.0, 60.4, 10.0, 4.3)]),
});

export const DEFAULT_MENU_SCREEN = 'home';
export const MENU_TRANSLATION_TOP = 74;
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
