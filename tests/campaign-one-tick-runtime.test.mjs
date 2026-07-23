import test from 'node:test';
import assert from 'node:assert/strict';
import {
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

  assert.deepEqual({ state: runtime.session.runtime.state, wall: runtime.session.map.wallFrame, activeGun: player.guns.active, gunRuntime: player.gunRuntime.gunId, door: runtime.session.environment.doorFrame }, {
    state: 13,
    wall: 13,
    activeGun: 'M4',
    gunRuntime: 'M4',
    door: 'open',
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

  assert.deepEqual({ state: runtime.session.runtime.state, wall: runtime.session.map.wallFrame, clip: player.gunRuntime.ammo.clipCur, spare: player.gunRuntime.ammo.spareCur, elevator: runtime.session.environment.elevatorFrame }, {
    state: 10,
    wall: 10,
    clip: 0,
    spare: 0,
    elevator: 'play',
  });
  assert.deepEqual(tick.bulletEvents, [{ wallColor: '9900ff' }]);
});
