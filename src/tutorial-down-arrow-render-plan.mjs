const TWIPS = 20;
const SOURCE_FRAME_COUNT = 16;

// Arena's named 1395 children retain SWF matrices in twips. This adapter only
// converts those values into the already camera-relative Canvas coordinate
// system; it deliberately does not invent movement, easing, or an arrow art.
export function getTutorialDownArrowRenderPlan(arrows, gameFrame, arenaPosition) {
  if (!Array.isArray(arrows)) throw new TypeError('Tutorial DownArrow records are required');
  if (!Number.isInteger(gameFrame) || gameFrame < 0) throw new TypeError('Tutorial DownArrow game frame must be a non-negative integer');
  if (!arenaPosition || !Number.isFinite(arenaPosition.x) || !Number.isFinite(arenaPosition.y)) {
    throw new TypeError('Tutorial DownArrow Arena position is required');
  }
  const frame = (gameFrame % SOURCE_FRAME_COUNT) + 1;
  return arrows.filter(({ visible }) => visible).map(({ name, matrix }) => ({
    name,
    frame,
    x: arenaPosition.x + matrix.translateX / TWIPS,
    y: arenaPosition.y + matrix.translateY / TWIPS,
    matrix: {
      scaleX: matrix.scaleX,
      scaleY: matrix.scaleY,
      rotateSkew0: matrix.rotateSkew0,
      rotateSkew1: matrix.rotateSkew1,
    },
  }));
}
