import { applyCampaignOneSessionBulletEnvironmentHit, applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from './campaign-one-session.mjs';
import { advanceCampaignOneGameTick, createCampaignOneSourceTickRuntime } from './campaign-one-tick-runtime.mjs';

function replaceSourceWall(world) {
  const frame = world.session.map.wallFrame;
  const wall = world.wallSet.at(frame);
  if (!wall?.isSolid || !wall?.colorAt) throw new TypeError(`Tutorial source wall frame ${frame} is not a decoded ARGB surface`);
  world.wall = wall;
}

// This is deliberately not the generic quick-match engine.  It owns the
// original Campaign 1 session and Wall_tut frame sequence until original unit,
// cutscene and HUD behavior are migrated into the same world.
export function createTutorialWorld({ wallSet, session = null, random = Math.random } = {}) {
  if (!wallSet?.at) throw new TypeError('Tutorial requires a complete original Wall_tut frame set');
  const sourceSession = session ?? createCampaignOneSession({ random });
  const tickRuntime = createCampaignOneSourceTickRuntime({ random, session: sourceSession });
  const world = { session: tickRuntime.session, tickRuntime, wallSet, wall: null };
  replaceSourceWall(world);
  return world;
}

// One browser-facing Game.EnterFrame bridge.  It never caches a second wall:
// the facade resolves `world.wall` on every source collision read, so a
// state-nine bullet or a human pink trigger can replace the original wallMC
// bitmap before the next actor in Game.units is processed.
export function advanceTutorialWorldGameTick(world, { onLineBullet = null, playerKeys = 0, playerJumpRequested = false, gameStarted = true } = {}) {
  if (!world?.tickRuntime || !world?.session || !world?.wall) throw new TypeError('Tutorial source world is required');
  const wall = {
    isSolid(x, y) { return world.wall.isSolid(x, y); },
  };
  return advanceCampaignOneGameTick(world.tickRuntime, {
    wall,
    playerKeys,
    playerJumpRequested,
    gameStarted,
    onLineBullet,
    onUnitSurface({ actor, position }) {
      const effects = applyTutorialFootContact(world, {
        x: position.x,
        y: position.y + 1,
        human: actor.human,
      });
      return { surface: world.wall.colorAt(position.x, position.y + 1), effects };
    },
  });
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
