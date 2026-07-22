import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignOneSession } from '../src/campaign-one-session.mjs';
import { createTutorialPlayerProfile } from '../src/tutorial-player-profile.mjs';

test('Campaign 1 player combines original first-run SD save and caPlayer exactly before Unit.setClass stats', () => {
  const actor = createCampaignOneSession().actors[0];

  assert.deepEqual(createTutorialPlayerProfile(actor), {
    name: 'Scientist',
    soldier: 'medic',
    skin: 7,
    team: 1,
    skill: 'none',
    streak: 'none',
    primary: 'M4',
    secondary: 'USP',
    level: 1,
    extra: { spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
    diff: 10,
    hp: 85,
    crit: 0.06,
    aim: 0.7,
    ammo: 0.9,
  });
});

test('Campaign player keeps its source overrides but receives a supplied original saved level', () => {
  const actor = createCampaignOneSession().actors[0];

  const profile = createTutorialPlayerProfile(actor, {
    classSaves: [
      { skin: 1, primary: 'M4', secondary: 'USP', skill: 'none', streak: 'none', level: 1 },
      { skin: 2, primary: 'M16', secondary: 'USP2', skill: 'health', streak: 'uav', level: 50 },
    ],
  });

  assert.deepEqual(profile, {
    name: 'Scientist',
    soldier: 'medic',
    skin: 7,
    team: 1,
    skill: 'none',
    streak: 'none',
    primary: 'M4',
    secondary: 'USP',
    level: 50,
    extra: { spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
    diff: 10,
    hp: 190,
    crit: 0.3,
    aim: 1.1,
    ammo: 1.9,
  });
});
