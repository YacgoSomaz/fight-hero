import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceCampaignOneSessionAi, advanceCampaignOneSessionAiGuns, advanceCampaignOneSessionAiMovement, advanceCampaignOneSessionUnits, applyCampaignOneSessionDeath, applyCampaignOneSessionFrame, applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from '../src/campaign-one-session.mjs';

// User journey: starting Under Siege must create its authored Tutorial map
// session, not a generic quick-match.  The player and all four source units
// keep their original identity, spawn state and tutorial restrictions.
test('Campaign 1 session retains source tutorial arena and setMatch actors', () => {
  const session = createCampaignOneSession();

  assert.deepEqual(
    { mapId: session.map.id, wallCharacter: session.map.wallCharacter, state: session.runtime },
    { mapId: 'tut', wallCharacter: 1378, state: { state: 1, frame: 0 } },
  );
  assert.deepEqual(session.actors.map(({ id, team, name, soldier, skin, spawned, spawn, noAim }) => ({ id, team, name, soldier, skin, spawned, spawn, noAim })), [
    { id: 'unit0', team: 1, name: 'Scientist', soldier: 'medic', skin: 7, spawned: true, spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
    { id: 'unit1', team: 2, name: 'Unknown', soldier: 'tank', skin: 5, spawned: true, spawn: { x: 1530, y: 695, node: 'a' }, noAim: false },
    { id: 'unit2', team: 2, name: 'Unknown', soldier: 'soldier', skin: 5, spawned: true, spawn: { x: 1760, y: 695, node: 'a' }, noAim: false },
    { id: 'unit3', team: 2, name: 'Unknown', soldier: 'medic', skin: 5, spawned: true, spawn: { x: 1790, y: 695, node: 'a' }, noAim: false },
    { id: 'unit4', team: 1, name: 'Soldier', soldier: 'soldier', skin: 1, spawned: false, spawn: null, noAim: false },
  ]);
});

// User journey: when the original state-13 floor trigger is reached, it must
// mutate the Tutorial session's source wall frame and re-spawn the authored
// enemy units at the exact source coordinates—not merely return a log entry.
test('Campaign 1 session consumes source effects into actors and wall state', () => {
  const session = createCampaignOneSession();
  session.runtime.state = 13;

  const effects = applyCampaignOneSessionSurfaceContact(session, { surface: 'ff00ff', human: true });

  assert.equal(effects.at(-1).type, 'changeWallFrame');
  assert.equal(session.map.wallFrame, 14);
  assert.deepEqual(session.actors.slice(1, 4).map(({ id, spawned, spawn, position, difficulty }) => ({ id, spawned, spawn, position, difficulty })), [
    { id: 'unit1', spawned: true, spawn: { x: 1530, y: 695, node: 'a' }, position: { x: 300, y: 1200, node: 'i' }, difficulty: 1 },
    { id: 'unit2', spawned: true, spawn: { x: 1760, y: 695, node: 'a' }, position: { x: 750, y: 1130, node: 'h' }, difficulty: 1 },
    { id: 'unit3', spawned: true, spawn: { x: 1790, y: 695, node: 'a' }, position: { x: 270, y: 1470, node: 'a' }, difficulty: 1 },
  ]);
});

test('Campaign 1 session consumes the original frame-zero tutorial equipment effect instead of only logging it', () => {
  const session = createCampaignOneSession();

  const effects = applyCampaignOneSessionFrame(session);

  assert.deepEqual(effects, [{ type: 'setGuns', target: 'player', primary: 'none', secondary: 'none' }]);
  assert.deepEqual(session.actors[0].guns, { primary: 'none', secondary: 'none', active: 'none' });
  assert.deepEqual(session.runtime, { state: 1, frame: 1 });
});

test('Campaign 1 creates source Unit.setClass/Status state only for actors whose original constructor spawned', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const snapshot = session.actors.map((actor) => ({
    id: actor.id,
    level: actor.level,
    unitInfo: actor.unitInfo && { id: actor.unitInfo.id, hp: actor.unitInfo.hp, crit: actor.unitInfo.crit, aim: actor.unitInfo.aim, skill: actor.unitInfo.skill },
    status: actor.status && { hpCur: actor.status.hpCur, hpMax: actor.status.hpMax, sSpawn: actor.status.sSpawn },
    currentGun: actor.gun?.curGun?.id ?? null,
  }));

  assert.deepEqual(snapshot, [
    { id: 'unit0', level: 1, unitInfo: { id: 'medic', hp: 85, crit: 0.06, aim: 0.7000000000000001, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 85, hpMax: 85, sSpawn: 75 }, currentGun: 'M4' },
    { id: 'unit1', level: 1, unitInfo: { id: 'tank', hp: 130, crit: 0.02, aim: 0.55, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 130, hpMax: 130, sSpawn: 15 }, currentGun: 'Beretta' },
    { id: 'unit2', level: 1, unitInfo: { id: 'soldier', hp: 100, crit: 0.04, aim: 0.6, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 100, hpMax: 100, sSpawn: 15 }, currentGun: 'Socom' },
    { id: 'unit3', level: 1, unitInfo: { id: 'medic', hp: 85, crit: 0.06, aim: 0.7000000000000001, skill: { id: 'none', sprite: 'none', value: -1 } }, status: { hpCur: 85, hpMax: 85, sSpawn: 15 }, currentGun: 'USP' },
    { id: 'unit4', level: 18, unitInfo: null, status: null, currentGun: null },
  ]);
});

test('Campaign 1 advances spawned Unit Status after its source runScripts frame and leaves noSpawn actors untouched', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const results = advanceCampaignOneSessionUnits(session);

  assert.deepEqual(results, [
    { id: 'unit0', events: [], bloodAlpha: 0 },
    { id: 'unit1', events: [], bloodAlpha: null },
    { id: 'unit2', events: [], bloodAlpha: null },
    { id: 'unit3', events: [], bloodAlpha: null },
  ]);
  assert.deepEqual(session.actors.map(({ id, status }) => ({ id, statusFrame: status?.fc ?? null, spawn: status?.sSpawn ?? null })), [
    { id: 'unit0', statusFrame: 1, spawn: 74 },
    { id: 'unit1', statusFrame: 1, spawn: 14 },
    { id: 'unit2', statusFrame: 1, spawn: 14 },
    { id: 'unit3', statusFrame: 1, spawn: 14 },
    { id: 'unit4', statusFrame: null, spawn: null },
  ]);
});

test('Campaign 1 records live original AI target/aim decisions on its spawned bot actors', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const [player, bot] = session.actors;
  player.position = { x: 1480, y: 695, node: 'a' };
  player.status.sSpawn = 0;
  for (const actor of session.actors.slice(1, 4)) actor.status.sSpawn = 0;
  bot.ai = { ...bot.ai, getTargetEvent: 1, aimX: 0, aimY: 0 };

  const results = advanceCampaignOneSessionAi(session, { wall: { isSolid: () => false }, gameStarted: true, random: () => 0.999 });

  assert.deepEqual(results.map(({ id, keys, jumpRequested, shouldShoot, targetId, aim }) => ({ id, keys, jumpRequested, shouldShoot, targetId, aim })), [
    { id: 'unit1', keys: 0, jumpRequested: false, shouldShoot: false, targetId: 'unit0', aim: { x: 44.4, y: 19.65 } },
    { id: 'unit2', keys: 0, jumpRequested: false, shouldShoot: false, targetId: 'unit0', aim: { x: 621.55, y: 645.3 } },
    { id: 'unit3', keys: 0, jumpRequested: false, shouldShoot: false, targetId: 'unit0', aim: { x: 621.55, y: 645.3 } },
  ]);
  assert.equal(bot.ai.targetId, 'unit0');
  assert.deepEqual(bot.aim, { x: 44.4, y: 19.65 });
});

// User journey: when an authored AI ActionBox asks a live bot to move and
// jump, the bot must enter the same Movement.as state machine as the player.
// It cannot be moved by a separate custom steering loop, and a persistent
// AI jump bit must not restart the source jump every frame.
test('Campaign 1 consumes source AI keys and jump requests through original NPC Movement state', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const bot = session.actors[1];
  bot.aiKeys = 8; // AI.as KEY.RIGHT
  bot.aiJumpRequested = true;
  const wall = {
    // Exact test floor only at the original post-horizontal foot probe.
    isSolid(x, y) {
      return Math.floor(x) === 1531 && Math.floor(y) === 696;
    },
  };

  const first = advanceCampaignOneSessionAiMovement(session, { wall });

  assert.deepEqual(first, [{
    id: 'unit1',
    jumped: true,
    nextAnim: 'fall',
    position: { x: 1531.4, y: 676, node: 'a' },
  }, {
    id: 'unit2',
    jumped: false,
    nextAnim: 'fall',
    position: { x: 1760, y: 695, node: 'a' },
  }, {
    id: 'unit3',
    jumped: false,
    nextAnim: 'fall',
    position: { x: 1790, y: 695, node: 'a' },
  }]);
  assert.equal(bot.movementState.jumping, true);
  assert.equal(bot.movement.yVelocity, -12.2);

  const second = advanceCampaignOneSessionAiMovement(session, { wall });

  assert.equal(second[0].jumped, false);
  assert.equal(bot.position.y, 663.8);
  assert.ok(Math.abs(bot.movementState.yVel + 11.4) < 1e-9);
});

// User journey: a source AI decision that passed AI.as's probability gate
// must call the bot's actual Guns.shoot runtime, preserving its selected
// Beretta and its independent delay/ammunition state.
test('Campaign 1 consumes an AI shoot decision through the original bot gun state', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const bot = session.actors[1];
  bot.aiShouldShoot = true;

  const results = advanceCampaignOneSessionAiGuns(session);

  assert.deepEqual(results, [
    { id: 'unit1', fired: true, action: 'fire', bullet: { gunId: 'Beretta', dynRecoil: 3, dynRecoilMod: 0 } },
    { id: 'unit2', fired: false, action: null, bullet: null },
    { id: 'unit3', fired: false, action: null, bullet: null },
  ]);
  assert.deepEqual({ gunId: bot.gunRuntime.gunId, delay: bot.gunRuntime.shootDelay, clip: bot.gunRuntime.ammo.clipCur }, {
    gunId: 'Beretta', delay: 6, clip: 11,
  });
});

// User journey: when Status.damage reaches zero HP, the original Unit.die()
// hides that Unit, gives it the source PhysActor corpse record and stops its
// Unit/Status frame updates.  This is lifecycle data only; Box2D rendering,
// score and respawn UI remain separate source work.
test('Campaign 1 applies the source Unit.die corpse lifecycle and removes the PhysActor at frame 150', () => {
  const session = createCampaignOneSession({ random: () => 0.5 });
  const [attacker, target] = session.actors;
  target.status.sSpawn = 0;
  const corpse = applyCampaignOneSessionDeath(session, { target, attacker, gun: attacker.gun.curGun, extra: { headMult: 1.5 } });

  assert.deepEqual({
    targetDead: target.dead === corpse,
    targetVisible: target.visible,
    respawnTimer: target.respawnTimer,
    canUseStreak: target.canUseStreak,
    corpseId: corpse.id,
    corpseOrigin: corpse.position,
    corpseCount: session.corpses.length,
  }, {
    targetDead: true,
    targetVisible: false,
    respawnTimer: 150,
    canUseStreak: false,
    corpseId: 'corpse-unit1',
    corpseOrigin: { x: 1530, y: 655 },
    corpseCount: 1,
  });
  const unitFrames = advanceCampaignOneSessionUnits(session);
  assert.deepEqual(unitFrames.map(({ id }) => id), ['unit0', 'unit2', 'unit3']);

  for (let frame = 0; frame < 150; frame += 1) advanceCampaignOneSessionUnits(session);
  assert.deepEqual(session.corpses, []);
});

// User journey: in the original Under Siege TDM, a normal player kill does
// not stop at corpse creation. Unit.die() updates both Score instances,
// MatchSettings totals the authored teams and Hud.addExp() writes the
// player's real SD.classSaves entry. This must remain one source-driven
// lifecycle rather than a made-up browser score counter.
test('Campaign 1 normal player kill applies original Score, TDM and experience-save state', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const [player, target] = session.actors;

  applyCampaignOneSessionDeath(session, {
    target,
    attacker: player,
    gun: player.gun.curGun,
    extra: { headMult: 1.5 },
  });

  assert.deepEqual({
    player: {
      pscore: player.pscore,
      kills: player.score.kills,
      headshots: player.score.headshots,
      killedTank: player.score.killed4,
      multikill: player.score.multikill,
      spree: player.score.spree,
      killtimer: player.score.killtimer,
    },
    target: {
      pscore: target.pscore,
      deaths: target.score.deaths,
      lives: target.score.lives,
      spree: target.score.spree,
      streak: target.score.streak,
    },
    tdm: session.match,
    medicSave: session.classSaves[1],
  }, {
    player: { pscore: 1, kills: 1, headshots: 1, killedTank: 1, multikill: 1, spree: 1, killtimer: 105 },
    target: { pscore: 0, deaths: 1, lives: -1, spree: 0, streak: 0 },
    tdm: { mode: 'tdm', scoreLimit: 15, team1score: 1, team2score: 0, ended: false },
    medicSave: { skin: 1, primary: 'M4', secondary: 'USP', skill: 'none', streak: 'none', level: 1, exp: 10, funds: 10 },
  });
});

// Player.as and AI.as both decrement Unit.respawnTimer once per original
// 30fps frame, then call their own spawn() only on the following frame. The
// shared Unit.unitSpawn() selects an authored NodeSpawn; Player applies 75
// source protection frames and AI applies 15. A source session cannot leave
// killed actors hidden forever or reappear at a made-up coordinate.
test('Campaign 1 respawns dead source actors one frame after 150 ticks at an authored Arena spawn', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  const [player, bot] = session.actors;
  const playerProtection = player.status.sSpawn;
  const botProtection = bot.status.sSpawn;
  const corpse = applyCampaignOneSessionDeath(session, { target: bot, attacker: player, gun: player.gun.curGun });

  for (let frame = 0; frame < 150; frame += 1) advanceCampaignOneSessionUnits(session);
  assert.deepEqual({ dead: bot.dead === corpse, visible: bot.visible, timer: bot.respawnTimer }, { dead: true, visible: false, timer: 0 });

  advanceCampaignOneSessionUnits(session);
  assert.deepEqual({
    dead: bot.dead,
    visible: bot.visible,
    position: bot.position,
    hp: bot.status.hpCur,
    spawnProtection: bot.status.sSpawn,
    gun: bot.gun.curGun.id,
    aiWaypoint: bot.ai.nextWaypointId,
    initialPlayerProtection: playerProtection,
    initialBotProtection: botProtection,
  }, {
    dead: null,
    visible: true,
    position: { x: 213.9, y: 1470.25, node: 'a' },
    hp: 130,
    spawnProtection: 15,
    gun: 'Beretta',
    aiWaypoint: 'a',
    initialPlayerProtection: 75,
    initialBotProtection: 15,
  });
});
