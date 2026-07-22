// Direct semantic port of Arena.EnterFrame() for the non-aiming Tutorial
// opening. Arena x/y are the scene display object's translation, not a
// generic camera centre.
const STAGE = Object.freeze({ width: 800, height: 600 });

export function advanceTutorialArenaPosition(position, focus, wall, stage = STAGE) {
  if (!position || !focus || !wall || !Number.isFinite(position.x) || !Number.isFinite(position.y) || !Number.isFinite(focus.x) || !Number.isFinite(focus.y) || !(wall.width >= stage.width) || !(wall.height >= stage.height)) {
    throw new Error('original Tutorial Arena position, focus, and wall dimensions are required');
  }
  const targetX = stage.width * 0.5 - focus.x;
  const targetY = stage.height * 0.5 - focus.y + 20;
  let x = position.x + (targetX - position.x) * 0.7;
  let y = position.y + (targetY - position.y) * 0.7;
  if (x > 0) x = 0;
  if (y > 5) y = 0;
  if (x < -wall.width + stage.width) x = -wall.width + stage.width;
  if (y < -wall.height + stage.height) y = -wall.height + stage.height;
  return { x, y };
}

// Background sprites are separate Game children. Arena uses the same ratio
// against wall dimensions for each one, then the export crop is removed only
// at draw time; it must not alter the parallax denominator.
export function getTutorialParallaxLayerPosition(arenaPosition, wall, crop, stage = STAGE) {
  if (!arenaPosition || !wall || !crop || !(crop.width > 0) || !(crop.height > 0)) throw new Error('original Tutorial parallax inputs are required');
  return {
    x: (stage.width - crop.width) * (arenaPosition.x / (stage.width - wall.width)) - crop.x,
    y: (stage.height - crop.height) * (arenaPosition.y / (stage.height - wall.height)) - crop.y,
  };
}

export function worldToTutorialScreen(point, arenaPosition) {
  if (!point || !arenaPosition || !Number.isFinite(point.x) || !Number.isFinite(point.y) || !Number.isFinite(arenaPosition.x) || !Number.isFinite(arenaPosition.y)) throw new Error('original Tutorial world point and Arena position are required');
  return { x: point.x + arenaPosition.x, y: point.y + arenaPosition.y };
}
