import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_SCREEN_ASSETS } from '../src/menu-assets.mjs';

test('the web menu points at frames exported from the original Menu timeline', () => {
  assert.deepEqual(MENU_SCREEN_ASSETS, {
    home: { symbol: 'MBFZ_fla.Timeline_275', frame: 5, file: 'menu-source/home.png' },
    quickmatch: { symbol: 'MBFZ_fla.Timeline_275', frame: 10, file: 'menu-source/quickmatch.png' },
    soldiers: { symbol: 'MBFZ_fla.Timeline_275', frame: 15, file: 'menu-source/soldiers.png' },
    options: { symbol: 'MBFZ_fla.Timeline_275', frame: 40, file: 'menu-source/options.png' },
    medals: { symbol: 'MBFZ_fla.Timeline_275', frame: 45, file: 'menu-source/medals.png' },
    tips: { symbol: 'MBFZ_fla.Timeline_275', frame: 75, file: 'menu-source/tips.png' },
    version: { symbol: 'MBFZ_fla.Timeline_275', frame: 80, file: 'menu-source/version.png' },
    campaign: { symbol: 'MBFZ_fla.Timeline_275', frame: 50, file: 'menu-source/campaign.png' },
    challenges: { symbol: 'MBFZ_fla.Timeline_275', frame: 55, file: 'menu-source/challenges.png' },
  });
});
