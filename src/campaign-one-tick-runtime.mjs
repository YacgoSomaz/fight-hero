import {
  applyCampaignOneSessionBulletEnvironmentHit,
  applyCampaignOneSessionFrame,
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

export function createCampaignOneSourceTickRuntime({ random = Math.random } = {}) {
  const runtime = {
    session: createCampaignOneSession({ random }),
    pendingInputs: [],
    tick: 0,
  };
  synchronizePlayerGunRuntime(runtime);
  return runtime;
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
  const inputs = runtime.pendingInputs.splice(0);
  const inputEffects = [];
  for (const input of inputs) {
    if (input.type === 'swapGuns') inputEffects.push(...applyCampaignOneSessionPlayerGunSwap(runtime.session));
  }

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
