import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceCampaignOneGameTick,
  advanceCampaignOneSourceTick,
  createCampaignOneSourceTickRuntime,
  enqueueCampaignOneSourceInput,
} from '../src/campaign-one-tick-runtime.mjs';

// User journey: after collecting the original M4/USP pickup, pressing the
// original swap control must use the same Guns state that owns the player's
// ammunition, then open Tutorial's authored door in the original order.
test('Campaign 1 source tick performs state-twelve gun swap and door transition in one authoritative session', () => {
  const runtime = createCampaignOneSourceTickRuntime({ random: () => 0 });
  const player = runtime.session.actors[0];
  runtime.session.runtime.state = 11;

  advanceCampaignOneSourceTick(runtime, { humanSurface: 'ff00ff' });
  assert.deepEqual({ state: runtime.session.runtime.state, wall: runtime.session.map.wallFrame, activeGun: player.guns.active, gunRuntime: player.gunRuntime.gunId }, {
    state: 12,
    wall: 12,
    activeGun: 'USP',
    gunRuntime: 'USP',
  });

  enqueueCampaignOneSourceInput(runtime, { type: 'swapGuns' });
  const tick = advanceCampaignOneSourceTick(runtime);

  assert.deepEqual({ state: runtime.session.runtime.state, wall: runtime.session.map.wallFrame, activeGun: player.guns.active, gunRuntime: player.gunRuntime.gunId, doorFrame: runtime.session.environment.door.frame, doorPlaying: runtime.session.environment.door.playing }, {
    state: 13,
    wall: 13,
    activeGun: 'M4',
    gunRuntime: 'M4',
    doorFrame: 1,
    doorPlaying: 'open',
  });
  assert.deepEqual(tick.inputs, [{ type: 'swapGuns' }]);
});

// User journey: the elevator trigger writes ammunition into the one active
// original gun record, not a disconnected Campaign-session field. That makes
// the later weapon swap and reload path reproducible from source state.
test('Campaign 1 source tick applies the state-nine elevator ammo clear to the active gun runtime', () => {
  const runtime = createCampaignOneSourceTickRuntime({ random: () => 0 });
  const player = runtime.session.actors[0];
  runtime.session.runtime.state = 9;
  player.guns = { primary: 'USP2', secondary: 'none', active: 'USP2' };

  const tick = advanceCampaignOneSourceTick(runtime, { bulletWallColor: '9900ff' });

  assert.deepEqual({ state: runtime.session.runtime.state, wall: runtime.session.map.wallFrame, clip: player.gunRuntime.ammo.clipCur, spare: player.gunRuntime.ammo.spareCur, elevatorFrame: runtime.session.environment.elevator.frame, elevatorPlaying: runtime.session.environment.elevator.playing }, {
    state: 10,
    wall: 10,
    clip: 0,
    spare: 0,
    elevatorFrame: 1,
    elevatorPlaying: true,
  });
  assert.deepEqual(tick.bulletEvents, [{ wallColor: '9900ff' }]);
});

// Game.EnterFrame does not batch every bot's AI, then every bot's gun and
// then every Unit tail.  It walks Game.units once: Player.shoot -> player
// UnitEnterFrame, then each AI decision/shoot -> that AI UnitEnterFrame.
// Bullet_Line_Basic resolves its line hit synchronously inside shoot(), before
// the firing Unit reaches its inherited tail.  This trace is the first guard
// against a page loop silently reintroducing the old batch ordering.
test('Campaign 1 Game tick keeps source actor, line-bullet and Unit-tail order', () => {
  const runtime = createCampaignOneSourceTickRuntime({ random: () => 0.999 });
  const player = runtime.session.actors[0];
  runtime.session.runtime.state = 99; // avoid the authored frame-zero gun reset
  for (const actor of runtime.session.actors) {
    if (actor.status) actor.status.sSpawn = 0;
  }
  player.gunRuntime.mDown = true;

  const trace = [];
  const result = advanceCampaignOneGameTick(runtime, {
    wall: { isSolid: () => false },
    onLineBullet(event) { trace.push(`line:${event.actorId}:${event.bullet.gunId}`); },
  });

  assert.deepEqual(trace, ['line:unit0:M4']);
  assert.deepEqual(result.trace.map(({ phase, actorId = null }) => `${phase}:${actorId ?? ''}`), [
    'hud:',
    'campaign:',
    'playerGun:unit0',
    'lineBullet:unit0',
    'unitTail:unit0',
    'ai:unit1',
    'aiGun:unit1',
    'unitTail:unit1',
    'ai:unit2',
    'aiGun:unit2',
    'unitTail:unit2',
    'ai:unit3',
    'aiGun:unit3',
    'unitTail:unit3',
    'bullets:',
    'match:',
  ]);
  assert.equal(runtime.session.actors[4].status, null);
});
