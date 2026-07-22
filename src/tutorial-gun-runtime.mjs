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
    // Guns.setGuns() assigns dynRecoil immediately. dynRecoilMod is assigned
    // later by Guns.EnterFrame, after Player.EnterFrame has had its shot.
    dynRecoil: gun.recoil,
    // AS3 Number instance fields default to 0. AI can call Guns.shoot()
    // before the first Guns.EnterFrame refreshes this value.
    dynRecoilMod: 0,
    ammo: {
      clipCur: clipMax,
      clipMax,
      spareCur: total - gun.clipSize,
      spareMax: total - gun.clipSize,
      total,
    },
  };
}

function sourceScatter(state, unit) {
  if (!Number.isFinite(unit?.aim) || !Number.isFinite(unit?.xVelocity)
    || typeof unit.crouching !== 'boolean' || typeof unit.jumping !== 'boolean' || typeof unit.reflecting !== 'boolean') {
    throw new TypeError('Tutorial Guns.EnterFrame requires original unit aim and movement state');
  }
  const gun = sourceGun(state.gunId);
  const dynRecoil = state.dynRecoil > gun.recoil ? state.dynRecoil - 0.05 : state.dynRecoil;
  let dynRecoilMod;
  if (unit.reflecting) dynRecoilMod = dynRecoil * 2;
  else if (unit.crouching) dynRecoilMod = dynRecoil * 0.6;
  else if (unit.jumping) dynRecoilMod = dynRecoil * 1.2;
  else if (unit.xVelocity) dynRecoilMod = dynRecoil * 1.1;
  else dynRecoilMod = dynRecoil;
  dynRecoilMod *= unit.reflecting ? 2 - unit.aim * 0.5 : 2 - unit.aim;
  return { ...state, dynRecoil, dynRecoilMod };
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
  const bullet = { gunId: state.gunId, dynRecoil: state.dynRecoil, dynRecoilMod: state.dynRecoilMod };
  // A human Unit creates Guns with a Hud. Guns.shoot() applies its recoil
  // kick only in that branch; the following EnterFrame reduces it by .05.
  const dynRecoil = human && state.dynRecoil < gun.recoil * 1.7 ? state.dynRecoil + 0.3 : state.dynRecoil;
  return {
    fired: true,
    bullet,
    state: {
      ...state,
      shotPressed: !gun.autoFire && human,
      shootDelay: as3Uint(gun.shootDelay * 30),
      dynRecoil,
      ammo,
    },
  };
}

// One Player.EnterFrame followed by Unit.UnitEnterFrame's Guns.EnterFrame.
// Guns.shoot occurs first; its just-written delay is decremented by the same
// source tick afterwards.
export function advanceTutorialGunRuntime(state, { human = true, unit } = {}) {
  let result = state.mDown ? sourceShoot(state, { human }) : { state, fired: false, bullet: null };
  let nextState = result.state;
  if (nextState.shootDelay) nextState = { ...nextState, shootDelay: nextState.shootDelay - 1 };
  nextState = sourceScatter(nextState, unit);
  return { state: nextState, fired: result.fired, action: result.fired ? 'fire' : null, bullet: result.bullet };
}

// AI.EnterFrame calls Guns.shoot() directly after its source probability
// gate. Unlike Player it has no mDown edge or non-auto shotPressed latch;
// UnitEnterFrame still immediately runs Guns.EnterFrame afterwards.
export function advanceTutorialAiGunRuntime(state, { shouldShoot = false, unit } = {}) {
  const result = shouldShoot ? sourceShoot(state, { human: false }) : { state, fired: false, bullet: null };
  let nextState = result.state;
  if (nextState.shootDelay) nextState = { ...nextState, shootDelay: nextState.shootDelay - 1 };
  nextState = sourceScatter(nextState, unit);
  return { state: nextState, fired: result.fired, action: result.fired ? 'fire' : null, bullet: result.bullet };
}
