import {
  applyCampaignOneSessionBulletEnvironmentHit,
  applyCampaignOneSessionFrame,
  advanceCampaignOneSessionActorUnitTail,
  advanceCampaignOneSessionAiActor,
  advanceCampaignOneSessionAiActorShoot,
  advanceCampaignOneSessionPlayerShoot,
  applyCampaignOneSessionPlayerGunSwap,
  applyCampaignOneSessionSurfaceContact,
  createCampaignOneSession,
} from './campaign-one-session.mjs';
import { createTutorialGunRuntime } from './tutorial-gun-runtime.mjs';

function playerFor(runtime) {
  return runtime.session.actors.find((actor) => actor.id === 'unit0');
}

// The session model is deliberately the sole owner of the source actor and
// gun records.  This narrow synchronizer handles only consumers that have not
// yet been routed through the complete Game.EnterFrame port, so a browser
// adapter cannot silently create a separate "currently equipped" gun.
function synchronizePlayerGunRuntime(runtime) {
  const player = playerFor(runtime);
  if (!player?.spawned || !player.unitInfo || !player.guns.active) return;
  const slot = player.gunSlot ?? 'primary';
  if (!player.gunRuntimes) player.gunRuntimes = {};
  if (!player.gunRuntimes[slot] || player.gunRuntimes[slot].gunId !== player.guns.active) {
    player.gunRuntimes[slot] = createTutorialGunRuntime({
      gunId: player.guns.active,
      ammoMultiplier: player.unitInfo.amm,
    });
  }
  player.gunRuntime = player.gunRuntimes[slot];
}

function assertRuntime(runtime) {
  if (!runtime?.session?.runtime || !Array.isArray(runtime.pendingInputs)) {
    throw new TypeError('Campaign 1 source tick runtime is required');
  }
}

export function createCampaignOneSourceTickRuntime({ random = Math.random, session = null } = {}) {
  const runtime = {
    session: session ?? createCampaignOneSession({ random }),
    pendingInputs: [],
    tick: 0,
    gameFrame: 0,
  };
  synchronizePlayerGunRuntime(runtime);
  return runtime;
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

function consumeQueuedInputs(runtime) {
  const inputs = runtime.pendingInputs.splice(0);
  const effects = [];
  for (const input of inputs) {
    if (input.type === 'swapGuns') effects.push(...applyCampaignOneSessionPlayerGunSwap(runtime.session));
  }
  return { inputs, effects };
}

// Source-owned Game.EnterFrame slice.  Its essential contract is timing,
// rather than presentation: Campaign scripts execute before the actor walk;
// each Player/AI performs shoot and immediate line-hit before its own inherited
// Unit tail; only then can the next actor run.  This is deliberately separate
// from the old narrow transition helper below until every page consumer has
// moved over to the one runtime.
export function advanceCampaignOneGameTick(runtime, {
  wall,
  playerKeys = 0,
  playerJumpRequested = false,
  gameStarted = true,
  onLineBullet = null,
  onUnitSurface = null,
} = {}) {
  assertRuntime(runtime);
  if (typeof wall?.isSolid !== 'function') throw new TypeError('Campaign 1 Game tick requires decoded source Wall surface');
  if (onLineBullet !== null && typeof onLineBullet !== 'function') throw new TypeError('Campaign 1 line bullet callback must be a function');
  if (onUnitSurface !== null && typeof onUnitSurface !== 'function') throw new TypeError('Campaign 1 unit surface callback must be a function');

  const { inputs, effects: inputEffects } = consumeQueuedInputs(runtime);
  runtime.gameFrame += 1;
  const trace = [];
  const scriptEffects = applyCampaignOneSessionFrame(runtime.session);
  trace.push({ phase: 'campaign', gameFrame: runtime.gameFrame, campaign: { ...runtime.session.runtime } });

  const lineBullets = [];
  const actorResults = [];
  for (const actor of runtime.session.actors) {
    if (!actor.spawned || !actor.status) continue;
    if (actor.human) {
      const shot = advanceCampaignOneSessionPlayerShoot(runtime.session);
      trace.push({ phase: 'playerGun', actorId: actor.id, fired: shot.fired });
      if (shot.fired && shot.bullet) {
        const event = { actorId: actor.id, bullet: shot.bullet, gameFrame: runtime.gameFrame };
        lineBullets.push(event);
        trace.push({ phase: 'lineBullet', actorId: actor.id, gunId: shot.bullet.gunId });
        if (onLineBullet) onLineBullet(event);
      }
      const tail = advanceCampaignOneSessionActorUnitTail(runtime.session, actor.id, {
        wall,
        keys: playerKeys,
        jumpRequested: playerJumpRequested,
      });
      trace.push({ phase: 'unitTail', actorId: actor.id });
      if (onUnitSurface && tail?.movement?.position) {
        const surface = onUnitSurface({ actorId: actor.id, actor, position: { ...tail.movement.position }, gameFrame: runtime.gameFrame });
        trace.push({ phase: 'surface', actorId: actor.id, surface });
      }
      actorResults.push({ id: actor.id, shot, tail });
      continue;
    }

    const ai = advanceCampaignOneSessionAiActor(runtime.session, actor.id, { wall, gameStarted, random: runtime.session.random });
    trace.push({ phase: 'ai', actorId: actor.id, shouldShoot: ai?.shouldShoot ?? false });
    const shot = advanceCampaignOneSessionAiActorShoot(runtime.session, actor.id);
    trace.push({ phase: 'aiGun', actorId: actor.id, fired: shot.fired });
    if (shot.fired && shot.bullet) {
      const event = { actorId: actor.id, bullet: shot.bullet, gameFrame: runtime.gameFrame };
      lineBullets.push(event);
      trace.push({ phase: 'lineBullet', actorId: actor.id, gunId: shot.bullet.gunId });
      if (onLineBullet) onLineBullet(event);
    }
    const tail = advanceCampaignOneSessionActorUnitTail(runtime.session, actor.id, {
      wall,
      keys: actor.aiKeys ?? 0,
      jumpRequested: Boolean(actor.aiJumpRequested),
    });
    trace.push({ phase: 'unitTail', actorId: actor.id });
    if (onUnitSurface && tail?.movement?.position) {
      const surface = onUnitSurface({ actorId: actor.id, actor, position: { ...tail.movement.position }, gameFrame: runtime.gameFrame });
      trace.push({ phase: 'surface', actorId: actor.id, surface });
    }
    actorResults.push({ id: actor.id, ai, shot, tail });
  }

  // Bullet_Line_Basic instances are already removed by their constructor;
  // this marker reserves the original Game.bullets cleanup position for the
  // remaining moving projectile classes.
  trace.push({ phase: 'bullets' });
  // Campaign 1 is TDM.  Its score update/end-game phase belongs after all
  // actor and projectile processing, even though current source work has no
  // live moving projectile collection yet.
  trace.push({ phase: 'match' });
  synchronizePlayerGunRuntime(runtime);
  runtime.tick += 1;
  return {
    tick: runtime.tick,
    gameFrame: runtime.gameFrame,
    inputs,
    inputEffects,
    scriptEffects,
    lineBullets,
    actorResults,
    trace,
  };
}

export function enqueueCampaignOneSourceInput(runtime, input) {
  assertRuntime(runtime);
  if (!input || input.type !== 'swapGuns') {
    throw new TypeError('Campaign 1 source input must be a swapGuns action');
  }
  runtime.pendingInputs.push({ type: 'swapGuns' });
}

// Small source-faithful tick slice.  It establishes one authoritative order:
// Player keyboard action -> Stats_Campaign.runScripts -> Bullet environment
// contact -> Unit surface contact.  The full Game actor/bullet phase follows
// in the next migration slice, but this makes Campaign One's authored weapon,
// door and elevator transitions executable rather than page-specific flags.
export function advanceCampaignOneSourceTick(runtime, {
  humanSurface = null,
  bulletWallColor = null,
} = {}) {
  assertRuntime(runtime);
  const { inputs, effects: inputEffects } = consumeQueuedInputs(runtime);

  const scriptEffects = applyCampaignOneSessionFrame(runtime.session);
  const bulletEvents = [];
  const bulletEffects = [];
  if (bulletWallColor !== null) {
    bulletEvents.push({ wallColor: bulletWallColor });
    bulletEffects.push(...applyCampaignOneSessionBulletEnvironmentHit(runtime.session, bulletWallColor));
  }

  const surfaceEffects = humanSurface === null
    ? []
    : applyCampaignOneSessionSurfaceContact(runtime.session, { surface: humanSurface, human: true });
  synchronizePlayerGunRuntime(runtime);
  runtime.tick += 1;
  return {
    tick: runtime.tick,
    inputs,
    inputEffects,
    scriptEffects,
    bulletEvents,
    bulletEffects,
    surfaceEffects,
  };
}
