import test from 'node:test';
import assert from 'node:assert/strict';
import { SOURCE_GUNS } from '../src/gun-source.mjs';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialCorpse } from '../src/tutorial-corpse-runtime.mjs';
import { applyTutorialLineBulletHit } from '../src/tutorial-bullet-hit-effects.mjs';

test('Bullet_Line_Basic applies the original Stats_Guns damage through Status.damage after a unit hit', () => {
  const [shooter, target] = createCampaignOneSession({ random: () => 0 }).actors;
  const usp2 = SOURCE_GUNS.find(({ id }) => id === 'USP2');
  shooter.gun.curGun = usp2;
  target.status.sSpawn = 0;
  const result = applyTutorialLineBulletHit({
    trace: { gunId: 'USP2', hit: { type: 'unit', target, extra: {} } },
    shooter,
    random: () => 1,
  });

  assert.deepEqual(result, {
    applied: true,
    reason: null,
    damage: 15,
    died: false,
    events: [],
    extra: {},
  });
  assert.equal(target.status.hpCur, 115);
});

test('Bullet_Line_Basic preserves Bullet.doHitEffect source guards for non-unit hits and reflect status', () => {
  const [shooter, target] = createCampaignOneSession({ random: () => 0 }).actors;
  const usp2 = SOURCE_GUNS.find(({ id }) => id === 'USP2');
  shooter.gun.curGun = usp2;
  target.status.sReflect = 10;

  assert.deepEqual(applyTutorialLineBulletHit({ trace: { gunId: 'USP2', hit: null }, shooter }), {
    applied: false, reason: 'non-unit', damage: 0, died: false, events: [], extra: {},
  });
  assert.deepEqual(applyTutorialLineBulletHit({ trace: { gunId: 'USP2', hit: { type: 'unit', target, extra: {} } }, shooter }), {
    applied: false, reason: 'reflect', damage: 0, died: false, events: [], extra: {},
  });
  assert.equal(target.status.hpCur, 130);
  assert.throws(() => applyTutorialLineBulletHit({ trace: { gunId: 'USP2', hit: { type: 'unit', target, extra: {} } }, shooter: {} }), /current gun/);
  shooter.gun.curGun = { ...usp2, extra: { bounceShots: 1 } };
  assert.throws(() => applyTutorialLineBulletHit({ trace: { gunId: 'USP2', hit: { type: 'unit', target, extra: {} } }, shooter }), /bounceShots/);
});

test('Bullet_Line_Basic sends a source corpse hit to PhysWorld.hitCorpse instead of treating it as non-unit', () => {
  const [shooter, target] = createCampaignOneSession({ random: () => 0.5 }).actors;
  const usp2 = SOURCE_GUNS.find(({ id }) => id === 'USP2');
  shooter.gun.curGun = usp2;
  const corpse = createTutorialCorpse({ target, attacker: shooter, gun: usp2, extra: {}, random: () => 0.5 });

  const result = applyTutorialLineBulletHit({
    trace: { gunId: 'USP2', hit: { type: 'corpse', target: corpse } }, shooter, random: () => 0.5,
  });

  assert.deepEqual(result, {
    applied: true, reason: 'corpse', damage: 0, died: false, events: [{ type: 'hitCorpse', force: 3 }], extra: {},
  });
  assert.deepEqual(corpse.parts[0].impulses.at(-1), { x: 0, y: 0 });
});
