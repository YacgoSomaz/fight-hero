// The extracted Foundry artwork is already cropped to Arena's playable root.
// Adding the old laboratory offset here caused most camera samples to point
// outside the source bitmap, which was the black lower part of the screen.
export const MAP_CROP = Object.freeze({ x: 0, y: 0, width: 2874, height: 863 });

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getFollowCamera(player, config, viewportWidth = 1280, viewportHeight = 720) {
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;
  return {
    x: clamp(player.x, halfWidth, config.width - halfWidth),
    y: clamp(player.y - 160, halfHeight, config.height - halfHeight),
    zoom: 1,
  };
}

export function smoothCamera(camera, target, dt) {
  const alpha = 1 - Math.exp(-9 * Math.max(0, dt));
  return {
    x: camera.x + (target.x - camera.x) * alpha,
    y: camera.y + (target.y - camera.y) * alpha,
    zoom: target.zoom,
  };
}

export function getMapSourceRect(camera, viewportWidth, viewportHeight) {
  const worldViewWidth = viewportWidth / camera.zoom;
  const worldViewHeight = viewportHeight / camera.zoom;
  return {
    x: MAP_CROP.x + camera.x - worldViewWidth / 2,
    y: MAP_CROP.y + camera.y - worldViewHeight / 2,
    width: worldViewWidth,
    height: worldViewHeight,
  };
}

export function worldToScreen(point, camera, viewportWidth, viewportHeight) {
  return {
    x: (point.x - camera.x) * camera.zoom + viewportWidth / 2,
    y: (point.y - camera.y) * camera.zoom + viewportHeight / 2,
  };
}

export function screenToWorld(point, camera, viewportWidth, viewportHeight) {
  return {
    x: (point.x - viewportWidth / 2) / camera.zoom + camera.x,
    y: (point.y - viewportHeight / 2) / camera.zoom + camera.y,
  };
}
