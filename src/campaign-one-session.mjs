import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { applyCampaignOneBulletEnvironmentHit, applyCampaignOneSurfaceContact, createCampaignOneRuntime } from './campaign-one-runtime.mjs';

function sourceActor(id, definition) {
  const spawn = definition.extra?.spawn ?? null;
  return {
    id: `unit${id}`,
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
    position: spawn ? { ...spawn } : null,
    noAim: Boolean(definition.extra?.noAim),
    noJump: false,
    guns: { primary: definition.primary, secondary: definition.secondary, active: definition.primary },
    definition,
  };
}

function actorFor(session, target) {
  return session.actors.find((actor) => actor.id === (target === 'player' ? 'unit0' : target));
}

function applySourceEffects(session, effects) {
  for (const effect of effects) {
    const actor = effect.target ? actorFor(session, effect.target) : null;
    if (effect.type === 'changeWallFrame') session.map.wallFrame = effect.frameLabel;
    else if (effect.type === 'spawn' && actor) { actor.spawned = true; actor.position = { x: effect.x, y: effect.y, node: effect.node }; }
    else if (effect.type === 'setDiffStats' && actor) actor.difficulty = effect.difficulty;
    else if (effect.type === 'setNoAim' && actor) actor.noAim = effect.value;
    else if (effect.type === 'setNoJump' && actor) actor.noJump = effect.value;
    else if (effect.type === 'setGuns' && actor) actor.guns = { primary: effect.primary, secondary: effect.secondary, active: effect.primary };
    else if (effect.type === 'swapGuns' && actor) actor.guns.active = actor.guns.secondary;
    else if (effect.type === 'setAmmo' && actor) actor.ammo = { clip: effect.clip, spare: effect.spare };
    else if (effect.type === 'doorFrame') session.environment.doorFrame = effect.frameLabel;
    else if (effect.type === 'elevatorFrame') session.environment.elevatorFrame = effect.frameLabel;
  }
  session.effects.push(...effects.map((effect) => ({ ...effect })));
}

// This is intentionally a source session model, not a quick-match World.
// It carries the exact Stats_Campaign actor records forward until Tutorial's
// own wall mask, Unit implementation, and HUD/cutscene consumers are ready.
export function createCampaignOneSession() {
  const definition = SOURCE_CAMPAIGN_CATALOG.campaign[0];
  const arena = ARENA_SOURCE_LAYOUTS[definition.map];
  if (!arena) throw new Error(`Campaign 1 Arena source is unavailable: ${definition.map}`);
  return {
    definition,
    map: { id: definition.map, wallCharacter: arena.wallCharacter, wallFrame: 1, nodes: arena.nodes },
    runtime: createCampaignOneRuntime(),
    actors: [sourceActor(0, definition.player), ...definition.bots.map((actor, index) => sourceActor(index + 1, actor))],
    environment: { doorFrame: 'idle', elevatorFrame: 'idle' },
    effects: [],
  };
}

export function applyCampaignOneSessionSurfaceContact(session, contact) {
  const effects = applyCampaignOneSurfaceContact(session.runtime, contact);
  applySourceEffects(session, effects);
  return effects;
}

export function applyCampaignOneSessionBulletEnvironmentHit(session, hitObject) {
  const effects = applyCampaignOneBulletEnvironmentHit(session.runtime, hitObject);
  applySourceEffects(session, effects);
  return effects;
}
