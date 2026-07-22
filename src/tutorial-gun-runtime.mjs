import { SOURCE_GUNS } from './gun-source.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceGun(gunId) {
  const gun = GUN_BY_ID.get(gunId);
  if (!gun) throw new Error(`original Tutorial gun is unavailable: ${gunId}`);
  return gun;
}

// Guns.shootDelay is a uint.  The source assignments relevant here are
// non-negative finite values, so AS3's uint coercion is truncation.
function as3Uint(value) {
  return Math.trunc(value);
}

function cloneAmmo(ammo) { return { ...ammo }; }

// Exact Guns.setGuns ammo initialization for the ordinary (non "clip" skill)
// path.  `none` retains Flash's clipMax=1 fallback, while its noShoot flag
// still prevents it from firing.
export function createTutorialGunRuntime({ gunId, ammoMultiplier = 1 } = {}) {
  const gun = sourceGun(gunId);
  const clipMax = gun.clipSize || 1;
  const total = Math.ceil(gun.clipSize * (gun.clipSpare + 1) * ammoMultiplier);
  return {
    gunId,
    mDown: false,
    shotPressed: false,
    reloading: false,
    shootDelay: 0,
    ammo: {
      clipCur: clipMax,
      clipMax,
      spareCur: total - gun.clipSize,
      spareMax: total - gun.clipSize,
      total,
    },
  };
}

// Player.MouseDown() only records mDown; Player.EnterFrame() owns the later
// call to Guns.shoot().  Keeping them separate prevents a pointer event from
// inventing an immediate source shot.
export function tutorialPlayerMouseDown(state, { gameStarted, noShoot } = {}) {
  if (!gameStarted || noShoot) return state;
  return { ...state, mDown: true };
}

// Player.MouseUp() clears Player.mDown then calls Guns.releaseMouse(), which
// clears shotPressed even while the uint shootDelay remains active.
export function tutorialPlayerMouseUp(state) {
  return { ...state, mDown: false, shotPressed: false };
}

function sourceShoot(state, { human }) {
  const gun = sourceGun(state.gunId);
  if (state.shootDelay || state.shotPressed || state.reloading) return { state, fired: false };
  if (!state.ammo.clipCur || gun.extra?.noShoot) return { state, fired: false };
  const ammo = cloneAmmo(state.ammo);
  if (!gun.extra?.noAmmo) ammo.clipCur -= 1;
  return {
    fired: true,
    state: {
      ...state,
      shotPressed: !gun.autoFire && human,
      shootDelay: as3Uint(gun.shootDelay * 30),
      ammo,
    },
  };
}

// One Player.EnterFrame followed by Unit.UnitEnterFrame's Guns.EnterFrame.
// Guns.shoot occurs first; its just-written delay is decremented by the same
// source tick afterwards.
export function advanceTutorialGunRuntime(state, { human = true } = {}) {
  let result = state.mDown ? sourceShoot(state, { human }) : { state, fired: false };
  if (result.state.shootDelay) result = { ...result, state: { ...result.state, shootDelay: result.state.shootDelay - 1 } };
  return { state: result.state, fired: result.fired, action: result.fired ? 'fire' : null };
}
