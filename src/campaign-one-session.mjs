import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { SOURCE_GUNS } from './gun-source.mjs';
import { applyCampaignOneBulletEnvironmentHit, applyCampaignOneSurfaceContact, createCampaignOneRuntime, runCampaignOneFrame } from './campaign-one-runtime.mjs';
import { advanceTutorialAi, compileTutorialAiArena, createTutorialAiState, setTutorialAiDifficulty } from './tutorial-ai-runtime.mjs';
import { advanceTutorialAiGunRuntime, createTutorialGunRuntime } from './tutorial-gun-runtime.mjs';
import { beginTutorialMovementJump, createTutorialMovementState, stepTutorialMovement } from './tutorial-movement.mjs';
import { createTutorialPlayerProfile } from './tutorial-player-profile.mjs';
import { advanceTutorialCorpseFrame, createTutorialCorpse } from './tutorial-corpse-runtime.mjs';
import { advanceTutorialStatusFrame, createTutorialStatus } from './tutorial-status-damage-runtime.mjs';
import { createTutorialUnitProfile, getTutorialAiLevel } from './tutorial-unit-profile.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceGun(id) {
  const gun = GUN_BY_ID.get(id);
  if (!gun) throw new Error(`Campaign source gun is unavailable: ${id}`);
  return gun;
}

function activateSourceActor(actor, aiArena, random) {
  // Unit.unitSpawn() resets Movement and restores the Unit's visible/alive
  // state before it invokes setClass() and Status.reset().
  actor.movement = { xVelocity: 0, yVelocity: 0 };
  actor.movementState = createTutorialMovementState({ noJump: actor.noJump });
  actor.skinFrame = actor.skin;
  actor.dead = null;
  actor.visible = true;
  actor.respawnTimer = 0;
  actor.canUseStreak = false;
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
  if (!actor.human) actor.gunRuntime = createTutorialGunRuntime({ gunId: actor.guns.active, ammoMultiplier: actor.unitInfo.amm });
  // AI.spawn(), unlike Unit.spawn(), explicitly applies this half-second
  // protection after Unit.unitSpawn() has reset Status.
  if (!actor.human) actor.status.sSpawn = 0.5 * 30;
  if (!actor.human) {
    actor.ai = createTutorialAiState({ actor, arena: aiArena, random });
    actor.aiKeys = 0;
    actor.aiJumpRequested = false;
    actor.aiShouldShoot = false;
    actor.aim = { x: actor.ai.aimX, y: actor.ai.aimY };
  }
}

function setActorGuns(actor, primary, secondary, active = primary) {
  actor.guns = { primary, secondary, active };
  if (!actor.gun) return;
  actor.gun.primary = sourceGun(primary);
  actor.gun.secondary = sourceGun(secondary);
  actor.gun.curGun = sourceGun(active);
  if (!actor.human && actor.unitInfo) actor.gunRuntime = createTutorialGunRuntime({ gunId: active, ammoMultiplier: actor.unitInfo.amm });
}

function sourceActor(id, definition, { human, random, aiArena }) {
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
    dead: null,
    visible: !definition.extra?.noSpawn,
    respawnTimer: 0,
    canUseStreak: false,
    // These are the source Movement.reset() velocities translated to the
    // session record names used by the PhysActor state adapter.
    movement: { xVelocity: 0, yVelocity: 0 },
    skinFrame: definition.skin,
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
  if (actor.spawned) activateSourceActor(actor, aiArena, random);
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
      activateSourceActor(actor, session.map.aiArena, session.random);
    }
    else if (effect.type === 'setDiffStats' && actor) {
      actor.difficulty = effect.difficulty;
      if (!actor.human && actor.ai) actor.ai = setTutorialAiDifficulty(actor.ai, { actor, difficulty: effect.difficulty });
    }
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
  const aiArena = compileTutorialAiArena(arena);
  return {
    definition,
    map: { id: definition.map, wallCharacter: arena.wallCharacter, wallFrame: 1, nodes: arena.nodes, aiArena },
    runtime: createCampaignOneRuntime(),
    actors: [sourceActor(0, definition.player, { human: true, random, aiArena }), ...definition.bots.map((actor, index) => sourceActor(index + 1, actor, { human: false, random, aiArena }))],
    environment: { doorFrame: 'idle', elevatorFrame: 'idle' },
    effects: [],
    corpses: [],
    random,
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
  const units = session.actors
    .filter((actor) => actor.spawned && actor.status && !actor.dead)
    .map((actor) => ({ id: actor.id, ...advanceTutorialStatusFrame(actor) }));
  for (const corpse of session.corpses) advanceTutorialCorpseFrame(corpse);
  session.corpses = session.corpses.filter((corpse) => !corpse.removed);
  return units;
}

// Game.EnterFrame calls AI.EnterFrame in the same live Game.units pass as
// Unit status. This adapter writes only the original AI decisions; movement
// and Guns remain their own source phases and must consume these exact fields.
export function advanceCampaignOneSessionAi(session, { wall, gameStarted = true, random = session?.random ?? Math.random } = {}) {
  if (!session?.map?.aiArena) throw new TypeError('Campaign AI requires source Arena nodes');
  const results = [];
  for (const actor of session.actors) {
    if (actor.human || !actor.spawned || !actor.status || actor.dead) continue;
    if (!actor.ai) actor.ai = createTutorialAiState({ actor, arena: session.map.aiArena, random });
    const decision = advanceTutorialAi({ state: actor.ai, actor, units: session.actors, arena: session.map.aiArena, wall, gameStarted, random });
    actor.ai = decision.state;
    actor.aiKeys = decision.keys;
    actor.aiJumpRequested = decision.jumpRequested;
    actor.aiShouldShoot = decision.shouldShoot;
    actor.aim = { x: decision.state.aimX, y: decision.state.aimY };
    results.push({ id: actor.id, keys: decision.keys, jumpRequested: decision.jumpRequested, shouldShoot: decision.shouldShoot, targetId: decision.state.targetId, aim: { ...actor.aim } });
  }
  return results;
}

// AI.as calls gun.shoot() after its target/probability branch; its inherited
// UnitEnterFrame then runs Guns.EnterFrame.  Keep the runtime per original
// NPC so pistols do not inherit Player.mDown or share a delay/ammo record.
export function advanceCampaignOneSessionAiGuns(session) {
  if (!session?.actors) throw new TypeError('Campaign AI Guns requires source session actors');
  const results = [];
  for (const actor of session.actors) {
    if (actor.human || !actor.spawned || !actor.status || actor.dead) continue;
    if (!actor.gunRuntime || actor.gunRuntime.gunId !== actor.guns.active) {
      actor.gunRuntime = createTutorialGunRuntime({ gunId: actor.guns.active, ammoMultiplier: actor.unitInfo.amm });
    }
    const tick = advanceTutorialAiGunRuntime(actor.gunRuntime, {
      shouldShoot: actor.aiShouldShoot,
      unit: {
        aim: actor.unitInfo.aim,
        crouching: actor.crouching,
        jumping: Boolean(actor.movementState?.jumping),
        xVelocity: actor.movement.xVelocity,
        reflecting: Boolean(actor.reflecting),
      },
    });
    actor.gunRuntime = tick.state;
    results.push({ id: actor.id, fired: tick.fired, action: tick.action, bullet: tick.bullet });
  }
  return results;
}

// AI.as expresses locomotion exclusively as Key flags plus a one-frame jump
// request.  Feed those fields into the already source-derived Movement.as
// adapter: this deliberately avoids a second NPC steering/collision model.
// The returned UnitMC command is consumed by the scene layer in the same way
// that player Movement.nextAnim is consumed.
export function advanceCampaignOneSessionAiMovement(session, { wall } = {}) {
  if (!session?.actors) throw new TypeError('Campaign AI Movement requires source session actors');
  const results = [];
  for (const actor of session.actors) {
    if (actor.human || !actor.spawned || !actor.status || actor.dead) continue;
    let movementState = createTutorialMovementState({ ...actor.movementState, noJump: actor.noJump });
    let movedActor = { ...actor, position: actor.position && { ...actor.position }, flip: actor.scaleX < 0 };
    if (!movedActor.position) throw new Error(`Campaign AI Movement requires source position for ${actor.id}`);
    const jump = actor.aiJumpRequested
      ? beginTutorialMovementJump({ state: movementState, actor: movedActor })
      : { actor: movedActor, state: movementState, nextAnim: null };
    const movement = stepTutorialMovement({
      state: jump.state,
      actor: jump.actor,
      wall,
      keys: actor.aiKeys ?? 0,
    });
    actor.position = { ...movement.actor.position };
    actor.movementState = movement.state;
    actor.movement = { ...actor.movement, xVelocity: movement.state.xVel, yVelocity: movement.state.yVel };
    actor.crouching = movement.state.crouching;
    results.push({
      id: actor.id,
      jumped: Boolean(jump.nextAnim),
      nextAnim: movement.nextAnim,
      position: { ...actor.position },
    });
  }
  return results;
}

// Narrow lifecycle port of Unit.die().  The source proceeds from
// Status.damage() to PhysWorld.createCorpse(), hides the Unit and starts its
// fixed five-second respawn counter. Score, HUD, killstreak and respawn
// presentation are intentionally not represented until their original
// dependencies are migrated.
export function applyCampaignOneSessionDeath(session, { target, attacker, gun, extra = {}, useMod = '', random = Math.random } = {}) {
  if (!session?.corpses) throw new TypeError('Campaign Unit.die requires a source session corpse collection');
  if (!target?.spawned || !target.status || target.dead) throw new Error('Campaign Unit.die requires a live spawned source target');
  const corpse = createTutorialCorpse({ target, attacker, gun, extra, useMod, random });
  session.corpses.push(corpse);
  target.dead = corpse;
  target.visible = false;
  target.respawnTimer = 30 * 5;
  target.canUseStreak = false;
  return corpse;
}

export function applyCampaignOneSessionBulletEnvironmentHit(session, hitObject) {
  const effects = applyCampaignOneBulletEnvironmentHit(session.runtime, hitObject);
  applySourceEffects(session, effects);
  return effects;
}
