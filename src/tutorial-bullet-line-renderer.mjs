import { SOURCE_GUNS } from './gun-source.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceColour(number, alpha) {
  const value = Number(number);
  if (!Number.isInteger(value) || value < 0 || value > 0xffffff || !Number.isFinite(alpha)) {
    throw new TypeError('Tutorial Bullet_Line_Basic requires source lineStyle colour and alpha');
  }
  return `rgba(${value >> 16},${(value >> 8) & 255},${value & 255},${alpha})`;
}

// Direct Canvas counterpart of Bullet_Line_Basic's graphics loop.  The Flash
// line belongs to Arena.midCont, so the caller supplies Arena's world→screen
// transform; this renderer does not invent camera offsets or tracer art.
export function renderTutorialLineBullet(context, trace, toScreen) {
  const gun = GUN_BY_ID.get(trace?.gunId);
  if (!gun || gun.bulletClass !== 'Bullet_Line_Basic') throw new Error(`original Tutorial line render gun is unavailable: ${trace?.gunId}`);
  if (!Array.isArray(trace.linePath) || !trace.impact || typeof toScreen !== 'function') {
    throw new TypeError('Tutorial Bullet_Line_Basic requires a source trace and Arena transform');
  }
  for (let index = 0; index < (gun.parameters.length - 1) / 3; index += 1) {
    context.lineWidth = gun.parameters[index * 3 + 1];
    context.strokeStyle = sourceColour(gun.parameters[index * 3 + 2], gun.parameters[index * 3 + 3]);
    context.beginPath();
    let newLine = true;
    for (const point of trace.linePath) {
      const screen = toScreen(point);
      if (newLine) context.moveTo(screen.x, screen.y);
      else context.lineTo(screen.x, screen.y);
      newLine = !newLine;
    }
    if (!newLine) {
      const impact = toScreen(trace.impact);
      context.lineTo(impact.x, impact.y);
    }
    context.stroke();
  }
}
