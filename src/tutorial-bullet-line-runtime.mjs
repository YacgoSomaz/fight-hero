import { SOURCE_GUNS } from './gun-source.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceGun(gunId) {
  const gun = GUN_BY_ID.get(gunId);
  if (!gun || gun.bulletClass !== 'Bullet_Line_Basic') throw new Error(`original Tutorial line bullet is unavailable: ${gunId}`);
  return gun;
}

function xMoveToRot(rotation, distance) {
  return rotation === 0 || rotation === 180 || rotation === -180
    ? 0
    : Math.sin(rotation * Math.PI / 180) * distance;
}

function yMoveToRot(rotation, distance) {
  return rotation === 90 || rotation === -90
    ? 0
    : Math.cos(rotation * Math.PI / 180) * -distance;
}

function rand(random, minimum, maximum) {
  return random() * (maximum - minimum) + minimum;
}

function irand(random, minimum, maximum) {
  return Math.trunc(random() * (maximum - minimum + 1)) + minimum;
}

function requireInputs(shooter, wall) {
  if (![shooter?.position?.x, shooter?.position?.y, shooter?.aimRotation, shooter?.mcRotation, shooter?.armY, shooter?.scaleX, shooter?.dynRecoil, shooter?.dynRecoilMod].every(Number.isFinite)) {
    throw new TypeError('Tutorial Bullet_Line_Basic requires resolved source shooter position, aim, arm, scale, dynRecoil, and dynRecoilMod');
  }
  if (typeof wall?.isSolid !== 'function' || typeof wall?.colorAt !== 'function') {
    throw new TypeError('Tutorial Bullet_Line_Basic requires the decoded original Wall_tut surface');
  }
}

function wallHit(wall, x, y) {
  if (!wall.isSolid(x, y)) return null;
  return { type: 'wall', color: String(wall.colorAt(x, y)) };
}

// Direct narrow port of Guns.makeBullet → Bullet constructor →
// Bullet_Line_Basic constructor for the source's wall-only path. Unit/corpse
// hit branches deliberately remain outside this module until their original
// status/physics records are brought into the Tutorial session.
export function traceTutorialLineBullet({ gunId, shooter, wall, random = Math.random } = {}) {
  const gun = sourceGun(gunId);
  requireInputs(shooter, wall);
  if (typeof random !== 'function') throw new TypeError('Tutorial Bullet_Line_Basic requires an original random source');

  const rotation = shooter.aimRotation + rand(random, -shooter.dynRecoil, shooter.dynRecoilMod);
  const xVelocity = xMoveToRot(rotation, 10);
  const yVelocity = yMoveToRot(rotation, 10);
  let x = shooter.position.x + shooter.mcRotation * 1.2 + xMoveToRot(rotation + 90 * shooter.scaleX, gun.yOffset);
  let y = shooter.position.y + shooter.armY + yMoveToRot(rotation + 90 * shooter.scaleX, gun.yOffset);
  let hit = null;

  // Bullet's `while (_loc10_ <= param6)`: xOffset is the source xOff and is
  // intentionally a count of inclusive half steps, not a pixel coordinate.
  for (let offset = 0; offset <= gun.xOffset; offset += 1) {
    x += xVelocity * 0.5;
    y += yVelocity * 0.5;
    hit = wallHit(wall, x, y);
    if (hit) break;
  }
  const origin = { x, y };
  const maxDistance = (gun.range + irand(random, -3, 3)) * 10;

  // Bullet_Line_Basic advances in full 10-unit steps after Bullet's muzzle
  // offset pass. It does not persist as a moving projectile.
  for (let step = 0; step < Math.trunc(maxDistance / 10); step += 1) {
    x += xVelocity;
    y += yVelocity;
    hit = wallHit(wall, x, y);
    if (hit) break;
  }
  const impact = { x, y };
  const distance = Math.round(Math.hypot(origin.x - impact.x, origin.y - impact.y));
  const linePath = [];
  if (gun.parameters[0]) {
    for (let pointDistance = irand(random, 0, 100); pointDistance < distance; pointDistance += irand(random, 50, 250)) {
      linePath.push({
        x: origin.x + xMoveToRot(rotation, pointDistance),
        y: origin.y + yMoveToRot(rotation, pointDistance),
      });
    }
  } else {
    linePath.push({ ...origin });
  }
  return Object.freeze({ gunId, rotation, origin, impact, distance, hit, linePath });
}
