import test from 'node:test';
import assert from 'node:assert/strict';
import { MENU_SCREEN_ASSETS } from '../src/menu-assets.mjs';

test('the web menu points at frames exported from the original Menu timeline', () => {
  assert.deepEqual(MENU_SCREEN_ASSETS, {
    home: { symbol: 'MBFZ_fla.Timeline_275', frame: 5, file: 'menu-source/home.png' },
    quickmatch: { symbol: 'MBFZ_fla.Timeline_275', frame: 10, file: 'menu-source/quickmatch.png' },
    campaign: { symbol: 'MBFZ_fla.Timeline_275', frame: 50, file: 'menu-source/campaign.png' },
    challenges: { symbol: 'MBFZ_fla.Timeline_275', frame: 55, file: 'menu-source/challenges.png' },
  });
});
