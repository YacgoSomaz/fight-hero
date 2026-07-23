import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getTutorialSpeakRenderPlan } from '../src/tutorial-speak-render-plan.mjs';

const timeline = JSON.parse(readFileSync(new URL('../public/assets/tutorial-speak-timeline-runtime.local.json', import.meta.url), 'utf8'));

test('Campaign 1 maps the settled original Speak_187 display list, Scientist portrait and source text fields', () => {
  const plan = getTutorialSpeakRenderPlan({
    hud: {
      message: { text: "Ahhh, my legs! I... I can't jump..." },
      speakTimeline: { frame: 16, playing: null },
    },
    speaker: { name: 'Player', unitInfo: { frame: 57 } },
    timeline,
  });

  assert.deepEqual(plan.holder, { x: 250, y: 15 });
  assert.deepEqual(plan.chrome, [
    { depth: 1, character: 1482, source: './public/assets/original-swf/tutorial-speak/1482.svg', x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
    { depth: 2, character: 1483, source: './public/assets/original-swf/tutorial-speak/1483.svg', clipDepth: 5, x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
    { depth: 6, character: 1484, source: './public/assets/original-swf/tutorial-speak/1484.svg', x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
  ]);
  assert.deepEqual(plan.portrait, {
    depth: 3,
    character: 645,
    source: './public/assets/original-swf/tutorial-speak/head/645.svg',
    x: 20.2,
    y: 67.35,
    scaleX: 2.235107421875,
    scaleY: 2.235107421875,
    rotateSkew0: 0.41375732421875,
    rotateSkew1: -0.41375732421875,
  });
  assert.deepEqual(plan.text, {
    name: { text: 'Player', x: 184.8, y: 21.25, fontFamily: 'QTypeSquare-Medium', fontPx: 13, align: 'center', color: 'rgb(204, 204, 204)' },
    description: { text: "Ahhh, my legs! I... I can't jump...", x: 69.35, y: 39.8, fontFamily: 'QTypeSquare-Book_10pt_st', fontPx: 10, align: 'left', color: 'rgb(255, 255, 255)', glow: { color: '#000000', blurX: 5, blurY: 5, strength: 1 } },
  });
});

test('Campaign 1 does not render a Speak panel while original Hud has no message', () => {
  assert.equal(getTutorialSpeakRenderPlan({ hud: { message: null, speakTimeline: { frame: 1, playing: null } }, speaker: null, timeline }), null);
});
