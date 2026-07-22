function inBox(point, x, y, width, height) {
  return point.x > Math.min(x, x + width) && point.x < Math.max(x, x + width)
    && point.y > Math.min(y, y + height) && point.y < Math.max(y, y + height);
}

function sourcePosition(object, label) {
  if (!Number.isFinite(object?.position?.x) || !Number.isFinite(object?.position?.y)) {
    throw new TypeError(`Tutorial Bullet.hitTestAll requires ${label} source position`);
  }
  return object.position;
}

function result(type, target = null, color = null, extra = {}) {
  return Object.freeze({ type, color, target, extra: Object.freeze(extra) });
}

// Direct narrow port of Bullet.hitTestAll(): opaque Wall_tut pixel first,
// then living eligible units, then Box2D corpses. The source mutates
// `Bullet.extra`; this pure boundary returns that exact delta for its caller.
export function hitTestTutorialBullet({ point, shooter, wall, units = [], corpses = [], ignoreAll = false, ignoreWall = false } = {}) {
  sourcePosition({ position: point }, 'bullet');
  sourcePosition(shooter, 'shooter');
  if (typeof wall?.isSolid !== 'function' || typeof wall?.colorAt !== 'function') {
    throw new TypeError('Tutorial Bullet.hitTestAll requires the decoded original Wall_tut surface');
  }
  if (!ignoreAll && !ignoreWall && wall.isSolid(point.x, point.y)) {
    return result('wall', null, String(wall.colorAt(point.x, point.y)));
  }
  for (const target of units) {
    if (target === shooter || target?.dead || target?.blurred) continue;
    const targetPosition = sourcePosition(target, 'unit');
    if (shooter.team && shooter.team === target.team) continue;
    const crouching = Boolean(target.crouching);
    const fullHeight = crouching ? 44 : 66;
    const bodyHeight = crouching ? 28 : 44;
    if (!inBox(point, targetPosition.x - 13, targetPosition.y - fullHeight, 26, fullHeight)) continue;
    if (inBox(point, targetPosition.x - 13, targetPosition.y - bodyHeight, 26, bodyHeight)) {
      return result('unit', target);
    }
    const extra = { headMult: 1.5 };
    const sourceSign = shooter.position.x - targetPosition.x >= 0 ? 1 : -1;
    if (sourceSign !== target.scaleX) extra.assassin = 1.5;
    return result('unit', target, null, extra);
  }
  for (const corpse of corpses) {
    const corpsePosition = sourcePosition(corpse, 'corpse');
    if (Math.hypot(point.x - corpsePosition.x, point.y - corpsePosition.y) < 30) return result('corpse', corpse);
  }
  return result('', null);
}
