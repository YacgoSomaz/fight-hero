// Direct FFDec SVG frame exports.  Unlike a raster sprite PNG, each SVG
// preserves its authored viewport and root translation, so x/y are the
// source registration point for its 1:1 Flash-coordinate placement.
export const FOUNDRY_FOREGROUND_SVG_SOURCE = Object.freeze([
  Object.freeze({
    character: 1252,
    frames: 76,
    source: './public/assets/original-swf/foundry-foreground-1252-svg',
    viewport: Object.freeze({ width: 312.15, height: 97.35, x: -2.25, y: -59.35 }),
  }),
  Object.freeze({
    character: 1258,
    frames: 306,
    source: './public/assets/original-swf/foundry-foreground-1258-svg',
    viewport: Object.freeze({ width: 550.95, height: 904.35, x: -15.4, y: -55 }),
  }),
]);
