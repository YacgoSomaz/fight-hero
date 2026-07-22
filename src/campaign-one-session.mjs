import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { SOURCE_GUNS } from './gun-source.mjs';
import { applyCampaignOneBulletEnvironmentHit, applyCampaignOneSurfaceContact, createCampaignOneRuntime, runCampaignOneFrame } from './campaign-one-runtime.mjs';
import { createTutorialPlayerProfile } from './tutorial-player-profile.mjs';
import { advanceTutorialStatusFrame, createTutorialStatus } from './tutorial-status-damage-runtime.mjs';
import { createTutorialUnitProfile, getTutorialAiLevel } from './tutorial-unit-profile.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceGun(id) {
  const gun = GUN_BY_ID.get(id);
  if (!gun) throw new Error(`Campaign source gun is unavailable: ${id}`);
  return gun;
}

function activateSourceActor(actor) {
  actor.unitInfo = createTutorialUnitProfile({
    soldier: actor.soldier,
    level: actor.level,
    skin: actor.skin,
    skill: actor.skill,
    primary: actor.guns.primary,
    secondary: actor.guns.secondary,
    extra: actor.definition.extra,
  });
  actor.status = createTutorialStatus({ hpMax: actor.unitInfo.hp });
  actor.gun = {
    primary: sourceGun(actor.guns.primary),
    secondary: sourceGun(actor.guns.secondary),
    curGun: sourceGun(actor.guns.active),
  };
  // AI.spawn(), unlike Unit.spawn(), explicitly applies this half-second
  // protection after Unit.unitSpawn() has reset Status.
  if (!actor.human) actor.status.sSpawn = 0.5 * 30;
}

function setActorGuns(actor, primary, secondary, active = primary) {
  actor.guns = { primary, secondary, active };
  if (!actor.gun) return;
  actor.gun.primary = sourceGun(primary);
  actor.gun.secondary = sourceGun(secondary);
  actor.gun.curGun = sourceGun(active);
}

function sourceActor(id, definition, { human, random }) {
  const spawn = definition.extra?.spawn ?? null;
  const actor = {
    id: `unit${id}`,
    human,
    team: definition.team,
    name: definition.name,
    soldier: definition.soldier,
    skin: definition.skin,
    primary: definition.primary,
    secondary: definition.secondary,
    skill: definition.skill,
    streak: definition.streak,
    difficulty: definition.difficulty,
    spawned: !definition.extra?.noSpawn,
    spawn: spawn ? { ...spawn } : null,
    // Unit's `extra.noSpawn` constructor path explicitly parks the object at
    // -4000,-4000; retaining that position lets Bullet.hitTestAll include the
    // same unit array without treating an absent position as a synthetic skip.
    position: spawn ? { ...spawn } : definition.extra?.noSpawn ? { x: -4000, y: -4000 } : null,
    noAim: Boolean(definition.extra?.noAim),
    noJump: false,
    // Unit/AI instances begin alive and standing. AI.spawn() is the one
    // source path that flips an initial UnitMC for Campaign aimReverse.
    dead: false,
    blurred: false,
    crouching: false,
    scaleX: definition.extra?.aimReverse ? -1 : 1,
    guns: { primary: definition.primary, secondary: definition.secondary, active: definition.primary },
    definition,
  };
  // Unit.setClass() runs only from Unit.unitSpawn().  `extra.noSpawn` actors
  // are constructed but remain uninitialised until their authored spawn event.
  actor.level = human ? createTutorialPlayerProfile(actor).level : getTutorialAiLevel(definition.difficulty, random);
  actor.unitInfo = null;
  actor.status = null;
  actor.gun = null;
  if (actor.spawned) activateSourceActor(actor);
  return actor;
}

function actorFor(session, target) {
  return session.actors.find((actor) => actor.id === (target === 'player' ? 'unit0' : target));
}

function applySourceEffects(session, effects) {
  for (const effect of effects) {
    const actor = effect.target ? actorFor(session, effect.target) : null;
    if (effect.type === 'changeWallFrame') session.map.wallFrame = effect.frameLabel;
    else if (effect.type === 'spawn' && actor) {
      actor.spawned = true;
      actor.position = { x: effect.x, y: effect.y, node: effect.node };
      activateSourceActor(actor);
    }
    else if (effect.type === 'setDiffStats' && actor) actor.difficulty = effect.difficulty;
    else if (effect.type === 'setNoAim' && actor) actor.noAim = effect.value;
    else if (effect.type === 'setNoJump' && actor) actor.noJump = effect.value;
    else if (effect.type === 'setGuns' && actor) setActorGuns(actor, effect.primary, effect.secondary);
    else if (effect.type === 'swapGuns' && actor) setActorGuns(actor, actor.guns.primary, actor.guns.secondary, actor.guns.secondary);
    else if (effect.type === 'setAmmo' && actor) actor.ammo = { clip: effect.clip, spare: effect.spare };
    else if (effect.type === 'doorFrame') session.environment.doorFrame = effect.frameLabel;
    else if (effect.type === 'elevatorFrame') session.environment.elevatorFrame = effect.frameLabel;
  }
  session.effects.push(...effects.map((effect) => ({ ...effect })));
}

// This is intentionally a source session model, not a quick-match World.
// It carries the exact Stats_Campaign actor records forward until Tutorial's
// own wall mask, Unit implementation, and HUD/cutscene consumers are ready.
export function createCampaignOneSession({ random = Math.random } = {}) {
  const definition = SOURCE_CAMPAIGN_CATALOG.campaign[0];
  const arena = ARENA_SOURCE_LAYOUTS[definition.map];
  if (!arena) throw new Error(`Campaign 1 Arena source is unavailable: ${definition.map}`);
  return {
    definition,
    map: { id: definition.map, wallCharacter: arena.wallCharacter, wallFrame: 1, nodes: arena.nodes },
    runtime: createCampaignOneRuntime(),
    actors: [sourceActor(0, definition.player, { human: true, random }), ...definition.bots.map((actor, index) => sourceActor(index + 1, actor, { human: false, random }))],
    environment: { doorFrame: 'idle', elevatorFrame: 'idle' },
    effects: [],
  };
}

export function applyCampaignOneSessionSurfaceContact(session, contact) {
  const effects = applyCampaignOneSurfaceContact(session.runtime, contact);
  applySourceEffects(session, effects);
  return effects;
}

// Stats_Campaign.runScripts() is evaluated on every source frame, and its
// effects mutate the same actor records that later surface/input transitions
// use.  Keeping this in the session prevents a browser preview from merely
// logging dialogue/equipment events while continuing with stale actor flags.
export function applyCampaignOneSessionFrame(session) {
  const effects = runCampaignOneFrame(session.runtime);
  applySourceEffects(session, effects);
  return effects;
}

// Game.EnterFrame() evaluates Campaign.runScripts before it walks Game.units;
// Unit.EnterFrame() then calls Status.EnterFrame before Guns and Movement.
// This adapter preserves that distinct phase and skips constructor-held
// extra.noSpawn units which have not yet reached Unit.unitSpawn().
export function advanceCampaignOneSessionUnits(session) {
  return session.actors
    .filter((actor) => actor.spawned && actor.status)
    .map((actor) => ({ id: actor.id, ...advanceTutorialStatusFrame(actor) }));
}

export function applyCampaignOneSessionBulletEnvironmentHit(session, hitObject) {
  const effects = applyCampaignOneBulletEnvironmentHit(session.runtime, hitObject);
  applySourceEffects(session, effects);
  return effects;
}
