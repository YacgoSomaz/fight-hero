import assert from 'node:assert/strict';
import test from 'node:test';

import { getHudScorebarRenderPlan } from '../src/hud-scorebar-render-plan.mjs';

// User journey: when Under Siege reaches a real TDM score, the visible
// scorebar must select its original blue/orange timelines, resize the source
// 1449 MovieClip to Hud.as's 125px rule, and move the original cap with it.
test('Hud.setScoreBar rebuilds the original 1462 child timelines for Campaign 1 TDM state', () => {
  const plan = getHudScorebarRenderPlan({
    mode: 'tdm',
    team1: 1,
    score1: 6,
    team2: 2,
    score2: 3,
    scoreLimit: 15,
  });

  assert.deepEqual({
    holder: plan.holder,
    scorebar1: {
      depth: plan.scorebar1.depth,
      matrix: plan.scorebar1.matrix,
      bar: plan.scorebar1.bar,
      fade: plan.scorebar1.fade,
      cap: plan.scorebar1.cap,
    },
    scorebar2: {
      depth: plan.scorebar2.depth,
      matrix: plan.scorebar2.matrix,
      bar: plan.scorebar2.bar,
      fade: plan.scorebar2.fade,
      cap: plan.scorebar2.cap,
    },
    text: plan.text,
  }, {
    holder: { x: 180, y: 23 },
    scorebar1: {
      depth: 1,
      matrix: { a: 1, b: 0, c: 0, d: 0.56756591796875, x: -149.4, y: -3.1 },
      bar: {
        source: './public/assets/original-swf/hud-scorebar-bar-1449-frame3.png',
        sourceBounds: { x: 0, y: -7.8, width: 6, height: 15.6 },
        x: 17.2,
        y: 8.9,
        width: 50,
        scaleX: 50 / 6,
      },
      fade: {
        source: './public/assets/original-swf/hud-scorebar-fade-1454-frame3.png',
        sourceBounds: { x: 0, y: -7.8, width: 17.2, height: 15.6 },
        x: 0,
        y: 8.9,
      },
      cap: {
        source: './public/assets/original-swf/hud-scorebar-cap-1456.png',
        sourceBounds: { x: -6.2, y: -9.5, width: 12.4, height: 19 },
        x: 67.2,
        y: 8.75,
      },
    },
    scorebar2: {
      depth: 12,
      matrix: { a: 1, b: 0, c: 0, d: -0.56756591796875, x: -149.4, y: 19.8 },
      bar: {
        source: './public/assets/original-swf/hud-scorebar-bar-1449-frame4.png',
        sourceBounds: { x: 0, y: -7.8, width: 6, height: 15.6 },
        x: 17.2,
        y: 8.9,
        width: 25,
        scaleX: 25 / 6,
      },
      fade: {
        source: './public/assets/original-swf/hud-scorebar-fade-1454-frame4.png',
        sourceBounds: { x: 0, y: -7.8, width: 17.2, height: 15.6 },
        x: 0,
        y: 8.9,
      },
      cap: {
        source: './public/assets/original-swf/hud-scorebar-cap-1456.png',
        sourceBounds: { x: -6.2, y: -9.5, width: 12.4, height: 19 },
        x: 42.2,
        y: 8.75,
      },
    },
    text: {
      mode: { text: 'Team Deathmatch', matrix: { x: -277, y: -20 } },
      score1: { text: '> 6', matrix: { x: -311, y: -7 } },
      score2: { text: '3', matrix: { x: -312, y: 6 } },
    },
  });
});

test('Hud.setScoreBar rejects a zero score limit instead of inventing a dynamic bar scale', () => {
  assert.throws(() => getHudScorebarRenderPlan({ mode: 'tdm', team1: 1, score1: 0, team2: 2, score2: 0, scoreLimit: 0 }), /score limit/i);
});
