import { applyCampaignOneSessionBulletEnvironmentHit, applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from './campaign-one-session.mjs';

function replaceSourceWall(world) {
  const frame = world.session.map.wallFrame;
  const wall = world.wallSet.at(frame);
  if (!wall?.isSolid || !wall?.colorAt) throw new TypeError(`Tutorial source wall frame ${frame} is not a decoded ARGB surface`);
  world.wall = wall;
}

// This is deliberately not the generic quick-match engine.  It owns the
// original Campaign 1 session and Wall_tut frame sequence until original unit,
// cutscene and HUD behavior are migrated into the same world.
export function createTutorialWorld({ wallSet, session = createCampaignOneSession() } = {}) {
  if (!wallSet?.at) throw new TypeError('Tutorial requires a complete original Wall_tut frame set');
  const world = { session, wallSet, wall: null };
  replaceSourceWall(world);
  return world;
}

export function applyTutorialBulletEnvironmentHit(world, { x, y }) {
  const hitObject = world.wall.colorAt(x, y);
  const effects = applyCampaignOneSessionBulletEnvironmentHit(world.session, hitObject);
  if (effects.some((effect) => effect.type === 'changeWallFrame')) replaceSourceWall(world);
  return effects;
}

export function applyTutorialFootContact(world, { x, y, human }) {
  const surface = world.wall.colorAt(x, y);
  const effects = applyCampaignOneSessionSurfaceContact(world.session, { surface, human });
  if (effects.some((effect) => effect.type === 'changeWallFrame')) replaceSourceWall(world);
  return effects;
}
