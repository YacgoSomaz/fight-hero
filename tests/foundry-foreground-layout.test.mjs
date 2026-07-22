import test from 'node:test';
import assert from 'node:assert/strict';
import { getFoundryForegroundLayout } from '../src/foundry-foreground-layout.mjs';

test('Foundry foreground maps direct base and SVG child registrations into the same moving camera coordinates', () => {
  const plan = getFoundryForegroundLayout({
    source: { x: 1000, y: 100, width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
    waterFrame: 76,
    potFrame: 32,
  });

  assert.deepEqual(plan, [
    {
      depth: 1, character: 1242, frame: 1, type: 'png', source: './public/assets/original-swf/foundry-foreground-1242/1.png',
      left: -1154.6, top: -168, width: 3102, height: 947,
    },
    {
      depth: 2, character: 1252, frame: 76, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1252-svg/76.svg',
      left: 158.02333374023438, top: 563.6, width: 301.979248046875, height: 97.35,
    },
    {
      depth: 7, character: 1258, frame: 32, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1258-svg/32.svg',
      left: 31, top: -220.05, width: 550.95, height: 904.35,
    },
  ]);
});

test('Foundry foreground rejects a frame outside the original child timeline rather than silently wrapping it', () => {
  assert.throws(() => getFoundryForegroundLayout({
    source: { x: 0, y: 0, width: 800, height: 600 }, viewport: { width: 800, height: 600 }, waterFrame: 77, potFrame: 1,
  }), /1252 frame 77/);
});
