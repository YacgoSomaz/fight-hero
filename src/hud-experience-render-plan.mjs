import { getHudExperience } from './hud-experience.mjs';

const SOURCE_BAR = Object.freeze({
  source: './public/assets/original-swf/hud-exp-fill-699-source.svg',
  sourceBounds: Object.freeze({ width: 123.2, height: 12.2 }),
  matrix: Object.freeze({ a: 3.1491546630859375, b: 0, c: 0.6520538330078125, d: -0.5157470703125, x: -1.4, y: 8.4 }),
  color: Object.freeze({ red: 255, green: 255, blue: 0, alpha: 77 / 256 }),
});

function sourceBarWidth() {
  return SOURCE_BAR.matrix.a * SOURCE_BAR.sourceBounds.width + SOURCE_BAR.matrix.c * SOURCE_BAR.sourceBounds.height;
}

// Hud.addExp changes bar_exp.width, which changes the source MovieClip's
// horizontal display width.  Keep the nested 699 matrix and color transform;
// the renderer applies scaleX before that matrix rather than clipping a flat
// screenshot of expholder 1477.
export function getHudExperienceRenderPlan(state) {
  const experience = getHudExperience(state);
  return Object.freeze({
    holder: Object.freeze({ x: 200.55, y: 588.45 }),
    base: Object.freeze({ source: './public/assets/original-swf/hud-exp-base-1474.svg', x: 0, y: 0 }),
    green: Object.freeze({ source: './public/assets/original-swf/hud-exp-green-1475.svg', x: 0, y: 0 }),
    bar: Object.freeze({
      ...SOURCE_BAR,
      width: experience.width,
      scaleX: experience.width / sourceBarWidth(),
    }),
    text: Object.freeze({ text: experience.text, x: 78, y: -2, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10 }),
  });
}
