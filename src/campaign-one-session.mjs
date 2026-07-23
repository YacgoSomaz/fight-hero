import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { SOURCE_DEFAULT_CLASS_SAVES } from './sd-default-profile-source.mjs';
import { SOURCE_GUNS } from './gun-source.mjs';
import { applyCampaignOneBulletEnvironmentHit, applyCampaignOneGunSwap, applyCampaignOneScore, applyCampaignOneSurfaceContact, createCampaignOneRuntime, runCampaignOneFrame } from './campaign-one-runtime.mjs';
import { advanceTutorialAi, compileTutorialAiArena, createTutorialAiState, setTutorialAiDifficulty } from './tutorial-ai-runtime.mjs';
import { advanceTutorialAiGunRuntime, advanceTutorialGunRuntime, createTutorialGunRuntime, tutorialAiGunShoot, tutorialGunEnterFrame, tutorialGunShoot, tutorialPlayerMouseDown, tutorialPlayerMouseUp } from './tutorial-gun-runtime.mjs';
import { beginTutorialMovementJump, createTutorialMovementState, stepTutorialMovement } from './tutorial-movement.mjs';
import { createTutorialPlayerProfile } from './tutorial-player-profile.mjs';
import { advanceTutorialCorpseFrame, createTutorialCorpse } from './tutorial-corpse-runtime.mjs';
import { advanceTutorialStatusFrame, applyTutorialStatusDamage, createTutorialStatus, healTutorialStatus } from './tutorial-status-damage-runtime.mjs';
import { createTutorialUnitProfile, getTutorialAiLevel } from './tutorial-unit-profile.mjs';

const GUN_BY_ID = new Map(SOURCE_GUNS.map((gun) => [gun.id, gun]));

function sourceGun(id) {
  const gun = GUN_BY_ID.get(id);
  if (!gun) throw new Error(`Campaign source gun is unavailable: ${id}`);
  return gun;
}

function cloneSourceClassSaves() {
  return SOURCE_DEFAULT_CLASS_SAVES.map((save) => (save === 0 ? 0 : { ...save }));
}

function createSourceScore() {
  // Score.as declares these fields on every Unit, including constructor-held
  // `extra.noSpawn` units. Keep the source names so later ScoreBar, feeds and
  // stats consumers do not need an invented score schema.
  return {
    headshots: 0,
    killed1: 0,
    killed2: 0,
    killed3: 0,
    killed4: 0,
    bulletsFired: 0,
    bulletsHit: 0,
    flagCap: 0,
    domCap: 0,
    jugKill: 0,
    lives: 0,
    kills: 0,
    deaths: 0,
    suicides: 0,
    betrayals: 0,
    killtimer: 0,
    multikill: 0,
    spree: 0,
    streak: 0,
  };
}

function updateSourcePscore(session, actor) {
  // Score.updateScore() only assigns pscore for dm/tdm/jug/zom. Campaign 1
  // is the decoded `tdm` path, so preserve the original formula rather than
  // deriving a bespoke team total from raw kill counts.
  if (['dm', 'tdm', 'jug', 'zom'].includes(session.match.mode)) {
    actor.pscore = actor.score.kills - actor.score.suicides - actor.score.betrayals;
  }
}

function updateSourceTeamScores(session) {
  if (session.match.mode !== 'tdm') return;
  session.match.team1score = session.actors
    .filter((actor) => actor.team === 1)
    .reduce((total, actor) => total + actor.pscore, 0);
  session.match.team2score = session.actors
    .filter((actor) => actor.team === 2)
    .reduce((total, actor) => total + actor.pscore, 0);
  if (session.match.team1score >= session.match.scoreLimit) {
    session.match.team1score = session.match.scoreLimit;
    session.match.ended = true;
  } else if (session.match.team2score >= session.match.scoreLimit) {
    session.match.team2score = session.match.scoreLimit;
    session.match.ended = true;
  }
}

function addSourceExperience(session, attacker, target) {
  // Unit.die() awards only human normal kills. Its two getUnitExp calls are
  // `4 + level * 1.4`, followed by Math.ceil; Hud.addExp() then owns the
  // persistent class save and the zero-remainder level-up behavior.
  const award = Math.ceil(Math.min(
    4 + (attacker.unitInfo.level + 3) * 1.4,
    4 + target.unitInfo.level * 1.4,
  ));
  const save = session.classSaves[attacker.unitInfo.number];
  if (!save) throw new Error(`Campaign source class save is unavailable: ${attacker.unitInfo.number}`);
  save.funds += award;
  if (save.level === 50) return award;
  save.exp += award;
  const nextExp = save.level * save.level * 3 + 40;
  if (save.exp >= nextExp) {
    save.exp = 0;
    save.level += 1;
  }
  return award;
}

function applySourceDeathScore(session, { target, attacker, extra }) {
  // This is the non-visual section of Unit.die() guarded by `!gameEnded`.
  // Corpse creation deliberately remains outside that guard, matching source.
  if (session.match.ended) return;
  target.score.spree = 0;
  target.score.deaths += 1;
  target.score.lives -= 1;
  target.score.streak = 0;
  if (target === attacker) {
    target.score.suicides += 1;
    updateSourcePscore(session, target);
  } else if (extra.teamkill) {
    // Unit.die() is now bytecode-confirmed against the original ASASM:
    // getlocal0 (the dead target) → score → addBetrayal(). Do not substitute
    // the conventional attacker penalty merely because it appears intuitive.
    target.score.betrayals += 1;
    updateSourcePscore(session, target);
  } else {
    attacker.score.multikill += 1;
    attacker.score.spree += 1;
    attacker.score.kills += 1;
    attacker.score.killtimer = 3.5 * 30;
    if (extra.headMult) attacker.score.headshots += 1;
    attacker.score[`killed${target.unitInfo.number}`] += 1;
    updateSourcePscore(session, attacker);
    if (attacker.human) addSourceExperience(session, attacker, target);
  }
  updateSourceTeamScores(session);
}

function activateSourceActor(actor, aiArena, random, classSaves) {
  // Unit.unitSpawn() resets Movement and restores the Unit's visible/alive
  // state before it invokes setClass() and Status.reset().
  actor.movement = { xVelocity: 0, yVelocity: 0 };
  actor.movementState = createTutorialMovementState({ noJump: actor.noJump });
  actor.skinFrame = actor.skin;
  actor.dead = null;
  actor.visible = true;
  actor.respawnTimer = 0;
  actor.canUseStreak = false;
  if (actor.human) actor.level = createTutorialPlayerProfile(actor, { classSaves }).level;
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
  actor.gunSlot = actor.gunSlot ?? 'primary';
  actor.gunRuntimes = {
    primary: createTutorialGunRuntime({ gunId: actor.guns.primary, ammoMultiplier: actor.unitInfo.amm }),
    secondary: createTutorialGunRuntime({ gunId: actor.guns.secondary, ammoMultiplier: actor.unitInfo.amm }),
  };
  actor.gunRuntime = actor.gunRuntimes[actor.gunSlot];
  // Player.spawn() applies 2.5 seconds after Unit.unitSpawn(); AI.spawn()
  // applies its own half-second protection after the same reset.  Keep this
  // in the shared activation path so initial construction and a later source
  // respawn cannot disagree about a live actor's Status state.
  actor.status.sSpawn = (actor.human ? 2.5 : 0.5) * 30;
  if (!actor.human) {
    actor.ai = createTutorialAiState({ actor, arena: aiArena, random });
    actor.aiKeys = 0;
    actor.aiJumpRequested = false;
    actor.aiShouldShoot = false;
    actor.aim = { x: actor.ai.aimX, y: actor.ai.aimY };
  }
}

function sourceSpawnNode(session) {
  const spawns = session.map.nodes.filter((node) => node.type === 'spawn');
  if (!spawns.length) throw new Error(`Campaign source Arena has no NodeSpawn records: ${session.map.id}`);
  const selected = spawns[Math.floor(session.random() * spawns.length)];
  // Arena names each NodeSpawn as waypoint_team (for example `a_1`).
  // Unit.unitSpawn() passes the NodeSpawn.waypoint into AI.getNextWaypoint(),
  // so retain the authored waypoint name rather than inventing a route.
  const node = selected.name.split('_')[0];
  if (!session.map.aiArena.waypoints[node]) throw new Error(`Campaign source NodeSpawn has no waypoint: ${selected.name}`);
  return { x: selected.x, y: selected.y, node };
}

function respawnSourceActor(session, actor) {
  // Player.spawn()/AI.spawn() call Unit.unitSpawn() without explicit
  // coordinates after a normal death. Unit.setClass() restores the authored
  // primary/secondary guns before Status.reset(), then each subclass applies
  // its own aim and spawn-protection setup.
  actor.position = sourceSpawnNode(session);
  actor.guns = { primary: actor.primary, secondary: actor.secondary, active: actor.primary };
  actor.gunSlot = 'primary';
  activateSourceActor(actor, session.map.aiArena, session.random, session.classSaves);
  actor.aim = actor.human
    ? { x: actor.position.x + 200, y: actor.position.y - 50 }
    : { x: actor.ai.aimX, y: actor.ai.aimY };
}

function setActorGuns(actor, primary, secondary, activeSlot = 'primary') {
  actor.gunSlot = activeSlot;
  actor.guns = { primary, secondary, active: actor.gunSlot === 'secondary' ? secondary : primary };
  if (!actor.gun) return;
  actor.gun.primary = sourceGun(primary);
  actor.gun.secondary = sourceGun(secondary);
  actor.gun.curGun = sourceGun(actor.guns.active);
  if (!actor.unitInfo) return;
  actor.gunRuntimes = {
    primary: createTutorialGunRuntime({ gunId: primary, ammoMultiplier: actor.unitInfo.amm }),
    secondary: createTutorialGunRuntime({ gunId: secondary, ammoMultiplier: actor.unitInfo.amm }),
  };
  actor.gunRuntime = actor.gunRuntimes[actor.gunSlot];
}

function activeGunSlot(actor) {
  return actor.gunSlot ?? 'primary';
}

function ensureActorGunRuntime(actor) {
  if (!actor?.gun || !actor?.unitInfo) return null;
  const active = activeGunSlot(actor);
  if (!actor.gunRuntimes) actor.gunRuntimes = {};
  if (!actor.gunRuntimes[active] || actor.gunRuntimes[active].gunId !== actor.guns.active) {
    actor.gunRuntimes[active] = createTutorialGunRuntime({ gunId: actor.guns.active, ammoMultiplier: actor.unitInfo.amm });
  }
  actor.gunRuntime = actor.gunRuntimes[active];
  actor.gun.curGun = sourceGun(actor.guns.active);
  return actor.gunRuntime;
}

function swapActorGuns(actor) {
  const currentSlot = activeGunSlot(actor);
  const nextSlot = currentSlot === 'primary' ? 'secondary' : 'primary';
  if (actor.gunRuntime) actor.gunRuntimes[currentSlot] = actor.gunRuntime;
  actor.gunSlot = nextSlot;
  actor.guns = { ...actor.guns, active: actor.guns[actor.gunSlot] };
  return ensureActorGunRuntime(actor);
}

function sourceActor(id, definition, { human, random, aiArena, classSaves }) {
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
    gunSlot: 'primary',
    pscore: 0,
    score: createSourceScore(),
    definition,
  };
  // Unit.setClass() runs only from Unit.unitSpawn().  `extra.noSpawn` actors
  // are constructed but remain uninitialised until their authored spawn event.
  actor.level = human ? createTutorialPlayerProfile(actor, { classSaves }).level : getTutorialAiLevel(definition.difficulty, random);
  actor.unitInfo = null;
  actor.status = null;
  actor.gun = null;
  if (actor.spawned) activateSourceActor(actor, aiArena, random, classSaves);
  return actor;
}

function actorFor(session, target) {
  return session.actors.find((actor) => actor.id === (target === 'player' ? 'unit0' : target));
}

function applySourceEffects(session, effects) {
  for (const effect of effects) {
    const actor = effect.target ? actorFor(session, effect.target) : null;
    if (effect.type === 'changeWallFrame') session.map.wallFrame = effect.frameLabel;
    else if (effect.type === 'hudFrame') session.hud.frame = effect.frameLabel;
    else if (effect.type === 'showDownArrows') session.hud.downArrows = effect.state;
    else if (effect.type === 'hideDownArrows') session.hud.downArrows = null;
    else if (effect.type === 'message') {
      // Hud.setMsg rejects a non-forced line while a forced line is active.
      // Campaign dialogue uses force=true, so it replaces—not appends to—the
      // prior Speak state and restarts the exact seconds*30 timer.
      if (session.hud.msgForce && !effect.force) continue;
      const { type, ...message } = effect;
      session.hud.message = message;
      session.hud.msgForce = Boolean(message.force);
      session.hud.msgTimer = message.seconds * 30;
      session.hud.speak = 'open';
      if (message.voice) session.audio.push({ type: 'playVoice', voice: message.voice });
    }
    else if (effect.type === 'playSound' || effect.type === 'playMusic') session.audio.push({ ...effect });
    else if (effect.type === 'spawn' && actor) {
      actor.spawned = true;
      actor.position = { x: effect.x, y: effect.y, node: effect.node };
      activateSourceActor(actor, session.map.aiArena, session.random, session.classSaves);
    }
    else if (effect.type === 'setDiffStats' && actor) {
      actor.difficulty = effect.difficulty;
      if (!actor.human && actor.ai) actor.ai = setTutorialAiDifficulty(actor.ai, { actor, difficulty: effect.difficulty });
    }
    else if (effect.type === 'setNoAim' && actor) actor.noAim = effect.value;
    else if (effect.type === 'setNoJump' && actor) actor.noJump = effect.value;
    else if (effect.type === 'healToMax' && actor?.status) healTutorialStatus(actor.status, actor.status.hpMax);
    else if (effect.type === 'damageCurrentHealthFraction' && actor?.status) {
      applyTutorialStatusDamage(
        actor,
        actor,
        sourceGun(effect.source),
        { ...effect.extra },
        actor.status.hpCur * effect.fraction,
        { bypassProtection: true, random: session.random },
      );
    }
    else if (effect.type === 'setGuns' && actor) setActorGuns(actor, effect.primary, effect.secondary);
    else if (effect.type === 'swapGuns' && actor) swapActorGuns(actor);
    else if (effect.type === 'setAmmo' && actor) {
      const gunRuntime = ensureActorGunRuntime(actor);
      if (gunRuntime) {
        gunRuntime.ammo.clipCur = effect.clip;
        gunRuntime.ammo.spareCur = effect.spare;
        gunRuntime.ammo.total = effect.clip + effect.spare;
      }
    }
    else if (effect.type === 'doorFrame') session.environment.door.playing = effect.frameLabel;
    else if (effect.type === 'elevatorFrame') session.environment.elevator.playing = effect.frameLabel === 'play';
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
  const classSaves = cloneSourceClassSaves();
  const session = {
    definition,
    map: { id: definition.map, wallCharacter: arena.wallCharacter, wallFrame: 1, nodes: arena.nodes, aiArena },
    runtime: createCampaignOneRuntime(),
    actors: [],
    match: { mode: definition.mode, scoreLimit: definition.score, team1score: 0, team2score: 0, ended: false },
    hud: { frame: 'idle', downArrows: null, message: null, msgForce: false, msgTimer: 0, speak: 'idle' },
    audio: [],
    classSaves,
    environment: { door: { frame: 1, playing: null }, elevator: { frame: 1, playing: false } },
    effects: [],
    corpses: [],
    random,
  };
  session.actors = [
    sourceActor(0, definition.player, { human: true, random, aiArena, classSaves }),
    ...definition.bots.map((actor, index) => sourceActor(index + 1, actor, { human: false, random, aiArena, classSaves })),
  ];
  return session;
}

export function applyCampaignOneSessionSurfaceContact(session, contact) {
  const effects = applyCampaignOneSurfaceContact(session.runtime, contact);
  applySourceEffects(session, effects);
  return effects;
}

// Player.as handles Q / Shift before Unit.EnterFrame.  Its generic Guns swap
// must mutate the same two per-slot runtime records that later shooting and
// reload logic use; only then can Campaign state 12 react by opening the
// authored door.  This replaces the old preview-only active-gun flag.
export function applyCampaignOneSessionPlayerGunSwap(session) {
  const player = actorFor(session, 'player');
  if (!player?.spawned || player.dead || !player.gun) return [];
  swapActorGuns(player);
  const effects = applyCampaignOneGunSwap(session.runtime);
  applySourceEffects(session, effects);
  return effects;
}

function updatePlayerGunSlot(player, gunRuntime) {
  const slot = activeGunSlot(player);
  player.gunRuntimes[slot] = gunRuntime;
  player.gunRuntime = gunRuntime;
  return gunRuntime;
}

// Player.MouseDown/MouseUp only alter Player.mDown and Guns.releaseMouse;
// keeping them on the source actor means an authored Q/Shift swap preserves
// each slot's exact clip, spare, delay and shotPressed values.
export function applyCampaignOneSessionPlayerMouseDown(session, { gameStarted = true } = {}) {
  const player = actorFor(session, 'player');
  if (!player?.spawned || player.dead) return null;
  const gunRuntime = ensureActorGunRuntime(player);
  return updatePlayerGunSlot(player, tutorialPlayerMouseDown(gunRuntime, {
    gameStarted,
    noShoot: Boolean(player.definition?.extra?.noShoot),
  }));
}

export function applyCampaignOneSessionPlayerMouseUp(session) {
  const player = actorFor(session, 'player');
  if (!player?.spawned || player.dead) return null;
  return updatePlayerGunSlot(player, tutorialPlayerMouseUp(ensureActorGunRuntime(player)));
}

// Player.EnterFrame invokes Guns.shoot() before inherited UnitEnterFrame
// invokes Guns.EnterFrame.  The browser must request this one source phase,
// never create an independent weapon object for its canvas loop.
export function advanceCampaignOneSessionPlayerGun(session, { unit } = {}) {
  const player = actorFor(session, 'player');
  if (!player?.spawned || player.dead) return { state: null, fired: false, action: null, bullet: null };
  const tick = advanceTutorialGunRuntime(ensureActorGunRuntime(player), { human: true, unit });
  updatePlayerGunSlot(player, tick.state);
  return tick;
}

// The Game-level port uses this half-step before Unit.UnitEnterFrame.  The
// historical `advanceCampaignOneSessionPlayerGun` remains a compatibility
// wrapper for callers which intentionally need both source calls together.
export function advanceCampaignOneSessionPlayerShoot(session) {
  const player = actorFor(session, 'player');
  if (!player?.spawned || player.dead) return { state: null, fired: false, action: null, bullet: null };
  const tick = tutorialGunShoot(ensureActorGunRuntime(player), { human: true });
  updatePlayerGunSlot(player, tick.state);
  return tick;
}

// Stats_Campaign.runScripts() is evaluated on every source frame, and its
// effects mutate the same actor records that later surface/input transitions
// use.  Keeping this in the session prevents a browser preview from merely
// logging dialogue/equipment events while continuing with stale actor flags.
export function applyCampaignOneSessionFrame(session) {
  const effects = [
    ...runCampaignOneFrame(session.runtime),
    // Stats_Campaign.runScripts() reads MatchSettings.team1score on the next
    // game frame after Score.updateScore() has recomputed the TDM totals.
    ...applyCampaignOneScore(session.runtime, session.match.team1score),
  ];
  applySourceEffects(session, effects);
  return effects;
}

// Game.EnterFrame() evaluates Campaign.runScripts before it walks Game.units;
// Unit.EnterFrame() then calls Status.EnterFrame before Guns and Movement.
// This adapter preserves that distinct phase and skips constructor-held
// extra.noSpawn units which have not yet reached Unit.unitSpawn().
export function advanceCampaignOneSessionUnits(session) {
  const units = [];
  for (const actor of session.actors) {
    if (!actor.spawned || !actor.status) continue;
    // Player.as:55-70 and AI.as:368-381 both decrement the unsigned timer
    // while dead and invoke spawn() only once it is already zero.  A newly
    // spawned Unit returns from this frame; its first Status.EnterFrame is on
    // the next original 30fps tick.
    if (actor.dead) {
      if (actor.respawnTimer) actor.respawnTimer -= 1;
      else respawnSourceActor(session, actor);
      continue;
    }
    units.push({ id: actor.id, ...advanceTutorialStatusFrame(actor) });
  }
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
    const decision = advanceCampaignOneSessionAiActor(session, actor.id, { wall, gameStarted, random });
    if (decision) results.push(decision);
  }
  return results;
}

// Hud.EnterFrame precedes Game.units in every live source tick. Its message
// timing is deliberately a separate phase: close/clear force while timer is
// still 1, then decrement to zero in the same frame.
export function advanceCampaignOneSessionHud(session) {
  if (!session?.hud) throw new TypeError('Campaign source Hud state is required');
  if (session.hud.msgTimer === 1) {
    session.hud.speak = 'close';
    session.hud.msgForce = false;
  }
  if (session.hud.msgTimer) session.hud.msgTimer -= 1;
  return {
    frame: session.hud.frame,
    message: session.hud.message,
    msgForce: session.hud.msgForce,
    msgTimer: session.hud.msgTimer,
    speak: session.hud.speak,
  };
}

// Original embedded MovieClips: door_up_239 stops on frames 1/12/23 and the
// Tutorial elevator stops on 1/19. `gotoAndPlay("open"/"close")` starts from
// the current stop and then advances one Flash frame per Game tick.
export function advanceCampaignOneSessionEnvironment(session) {
  const { door, elevator } = session.environment;
  if (door.playing === 'open') {
    door.frame += 1;
    if (door.frame >= 12) { door.frame = 12; door.playing = null; }
  } else if (door.playing === 'close') {
    door.frame += 1;
    if (door.frame >= 23) { door.frame = 23; door.playing = null; }
  }
  if (elevator.playing) {
    elevator.frame += 1;
    if (elevator.frame >= 19) { elevator.frame = 19; elevator.playing = false; }
  }
  return { door: { ...door }, elevator: { ...elevator } };
}

// One source AI.EnterFrame outer decision phase.  Game.EnterFrame calls this
// and the following gun/tail phases for a single unit before it advances to
// the next unit in Game.units; the plural adapter above is legacy tooling.
export function advanceCampaignOneSessionAiActor(session, actorId, { wall, gameStarted = true, random = session?.random ?? Math.random } = {}) {
  if (!session?.map?.aiArena) throw new TypeError('Campaign AI requires source Arena nodes');
  const actor = actorFor(session, actorId);
  if (!actor || actor.human || !actor.spawned || !actor.status || actor.dead) return null;
  if (!actor.ai) actor.ai = createTutorialAiState({ actor, arena: session.map.aiArena, random });
  const decision = advanceTutorialAi({ state: actor.ai, actor, units: session.actors, arena: session.map.aiArena, wall, gameStarted, random });
  actor.ai = decision.state;
  actor.aiKeys = decision.keys;
  actor.aiJumpRequested = decision.jumpRequested;
  actor.aiShouldShoot = decision.shouldShoot;
  actor.aim = { x: decision.state.aimX, y: decision.state.aimY };
  return { id: actor.id, keys: decision.keys, jumpRequested: decision.jumpRequested, shouldShoot: decision.shouldShoot, targetId: decision.state.targetId, aim: { ...actor.aim } };
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

// The shoot portion of AI.EnterFrame is intentionally separate from
// Guns.EnterFrame.  Unit.UnitEnterFrame must run Status first and only then
// decrement recoil/delay in its Gun phase.
export function advanceCampaignOneSessionAiActorShoot(session, actorId) {
  const actor = actorFor(session, actorId);
  if (!actor || actor.human || !actor.spawned || !actor.status || actor.dead) return { id: actorId, state: null, fired: false, action: null, bullet: null };
  const tick = tutorialAiGunShoot(ensureActorGunRuntime(actor), { shouldShoot: actor.aiShouldShoot });
  actor.gunRuntime = tick.state;
  actor.gunRuntimes[activeGunSlot(actor)] = tick.state;
  return { id: actor.id, ...tick };
}

function sourceGunUnitState(actor) {
  return {
    aim: actor.unitInfo.aim,
    crouching: Boolean(actor.crouching),
    jumping: Boolean(actor.movementState?.jumping),
    xVelocity: actor.movement?.xVelocity ?? 0,
    reflecting: Boolean(actor.reflecting),
  };
}

function advanceSourceActorMovement(actor, { wall, keys = 0, jumpRequested = false } = {}) {
  if (typeof wall?.isSolid !== 'function') throw new TypeError('Campaign Unit Movement requires decoded Wall surface');
  let movementState = createTutorialMovementState({ ...actor.movementState, noJump: actor.noJump });
  let movedActor = { ...actor, position: actor.position && { ...actor.position }, flip: actor.scaleX < 0 };
  if (!movedActor.position) throw new Error(`Campaign Unit Movement requires source position for ${actor.id}`);
  const jump = jumpRequested
    ? beginTutorialMovementJump({ state: movementState, actor: movedActor })
    : { actor: movedActor, state: movementState, nextAnim: null };
  const movement = stepTutorialMovement({ state: jump.state, actor: jump.actor, wall, keys });
  actor.position = { ...movement.actor.position };
  actor.movementState = movement.state;
  actor.movement = { ...actor.movement, xVelocity: movement.state.xVel, yVelocity: movement.state.yVel };
  actor.crouching = movement.state.crouching;
  return { jumped: Boolean(jump.nextAnim), nextAnim: movement.nextAnim, position: { ...actor.position } };
}

// Migrated numerical Unit.UnitEnterFrame tail.  The remaining visual UnitMC,
// pickups/objectives and wall-pixel surface consumers are represented by
// dedicated source ports, but the call position here is already fixed: every
// unit completes this tail before the next Game.units actor begins.
export function advanceCampaignOneSessionActorUnitTail(session, actorId, { wall, keys = 0, jumpRequested = false } = {}) {
  const actor = actorFor(session, actorId);
  if (!actor?.spawned || !actor.status) return null;
  if (actor.dead) {
    if (actor.respawnTimer) actor.respawnTimer -= 1;
    else respawnSourceActor(session, actor);
    return { id: actor.id, dead: true };
  }
  const status = advanceTutorialStatusFrame(actor);
  const gunRuntime = tutorialGunEnterFrame(ensureActorGunRuntime(actor), { unit: sourceGunUnitState(actor) });
  actor.gunRuntime = gunRuntime;
  actor.gunRuntimes[activeGunSlot(actor)] = gunRuntime;
  const movement = advanceSourceActorMovement(actor, { wall, keys, jumpRequested });
  return { id: actor.id, status, gunRuntime, movement };
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
  applySourceDeathScore(session, { target, attacker, extra });
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
