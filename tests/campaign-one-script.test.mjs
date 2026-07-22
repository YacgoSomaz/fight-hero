import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractCampaignOneScript } from '../private-assets/parse-campaign-one-script.mjs';

const scripts = {
  campaign: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url), 'utf8'),
  unit: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Unit.as', import.meta.url), 'utf8'),
  bullet: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Bullet.as', import.meta.url), 'utf8'),
  player: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Player.as', import.meta.url), 'utf8'),
};

// User journey: Campaign 1 cannot be reconstructed from its setMatch record
// alone. Its tutorial progression is split between frame timing, coloured
// world-contact pixels, a bullet/environment hit, and the gun-swap input.
test('extracts the complete source-owned Campaign 1 transition surface', () => {
  const script = extractCampaignOneScript(scripts);

  assert.deepEqual(script.timed, [
    { state: 1, frame: 0, type: 'setGuns', target: 'player', primary: 'none', secondary: 'none' },
    { state: 1, frame: 20, type: 'message', target: 'player', text: "They're here! I have to escape!", seconds: 4, force: true, voice: 'V_Ca1_1' },
    { state: 1, frame: 90, type: 'hudFrame', frameLabel: 'tutmove' },
    { state: 14, frame: 150, type: 'message', target: 'player', text: 'Oh dear...', seconds: 3, force: true, voice: 'V_Ca1_11' },
    { state: 14, frame: 360, type: 'spawn', target: 'unit4', x: 770, y: 870, node: 'z' },
    { state: 14, frame: 360, type: 'message', target: 'unit4', text: "Sorry I'm late.", seconds: 4, force: true, voice: 'V_Ca1_12' },
    { state: 14, frame: 360, type: 'playMusic', sound: 'M_Theme' },
    { state: 14, frame: 450, type: 'message', target: 'player', text: "What? I don't know who you are, but help me!", seconds: 5, force: true, voice: 'V_Ca1_13' },
    { state: 14, frame: 600, type: 'message', target: 'unit4', text: "Don't worry I've got you.", seconds: 4, force: true, voice: 'V_Ca1_14' },
  ]);

  assert.deepEqual(script.scoreTransitions, [
    { state: 14, score: 6, nextState: 15, type: 'message', target: 'unit4', text: 'Hehehah, take some of this!', seconds: 5, force: true, voice: 'V_Ca1_15' },
    { state: 15, score: 9, nextState: 16, type: 'message', target: 'player', text: "I'm very sorry for killing you!", seconds: 4, force: true, voice: 'V_Ca1_16' },
    { state: 16, score: 12, nextState: 17, type: 'message', target: 'unit1', text: 'Their firepower is too strong... Aeuughh!', seconds: 5, force: true, voice: 'V_Ca1_17' },
    { state: 17, score: 14, nextState: 18, type: 'message', target: 'unit4', text: 'These guys are smalltime!', seconds: 5, force: true, voice: 'V_Ca1_18' },
  ]);

  assert.equal(script.surfaceTrigger.surface, 'ff00ff');
  assert.equal(script.surfaceTrigger.kind, 'human-foot-contact');
  assert.equal(script.bulletTrigger.hitObject, '9900ff');
  assert.equal(script.bulletTrigger.requiredState, 9);
  assert.equal(script.inputTrigger.key, 'swapGuns');
  assert.equal(script.inputTrigger.requiredState, 12);

  assert.deepEqual(script.surfaceTransitions.find(({ state }) => state === 8), {
    state: 8,
    effects: [
      { type: 'hudFrame', frameLabel: 'tutshoot' },
      { type: 'message', target: 'player', text: "Oh, a pistol... I'm a little rusty.", seconds: 4, force: true, voice: 'V_Ca1_6' },
      { type: 'setGuns', target: 'player', primary: 'USP2', secondary: 'none' },
      { type: 'setNoAim', target: 'player', value: false },
    ],
    showDownArrowsState: 8, nextState: 9, resetFrame: true, wallFrame: 9,
  });
  assert.deepEqual(script.surfaceTransitions.find(({ state }) => state === 13), {
    state: 13,
    effects: [
      { type: 'message', target: 'unit1', text: "There's one more. We can't let him escape, eliminate him!", seconds: 6, force: true, voice: 'V_Ca1_10' },
      { type: 'setDiffStats', target: 'unit1', difficulty: 1, reset: true },
      { type: 'setDiffStats', target: 'unit2', difficulty: 1, reset: true },
      { type: 'setDiffStats', target: 'unit3', difficulty: 1, reset: true },
      { type: 'spawn', target: 'unit1', x: 300, y: 1200, node: 'i' },
      { type: 'spawn', target: 'unit2', x: 750, y: 1130, node: 'h' },
      { type: 'spawn', target: 'unit3', x: 270, y: 1470, node: 'a' },
      { type: 'doorFrame', frameLabel: 'close' },
    ],
    showDownArrowsState: 13, nextState: 14, resetFrame: true, wallFrame: 14,
  });
  assert.deepEqual(script.surfaceTransitions.find(({ state }) => state === 10), {
    state: 10,
    effects: [
      { type: 'hudFrame', frameLabel: 'tutclimb' },
      { type: 'message', target: 'player', text: "Ahhh, my legs! I... I can't jump...", seconds: 5, force: true, voice: 'V_Ca1_8' },
      { type: 'healToMax', target: 'player', show: false, force: true },
      { type: 'damageCurrentHealthFraction', target: 'player', fraction: 0.8, source: 'env', extra: {}, force: true },
      { type: 'setNoJump', target: 'player', value: true },
      { type: 'playSound', sound: 'S_Mine1' },
      { type: 'playSound', sound: 'S_Pan' },
    ],
    showDownArrowsState: 10, nextState: 11, resetFrame: true, wallFrame: 11,
  });
  assert.deepEqual(script.surfaceTransitions.find(({ state }) => state === 11), {
    state: 11,
    effects: [
      { type: 'playSound', sound: 'S_Equip' },
      { type: 'message', target: 'player', text: 'Nice, some more ammo and a new weapon.', seconds: 5, force: true, voice: 'V_Ca1_9' },
      { type: 'setGuns', target: 'player', primary: 'M4', secondary: 'USP' },
      { type: 'swapGuns', target: 'player' },
      { type: 'hudFrame', frameLabel: 'tutswitch' },
      { type: 'setNoJump', target: 'player', value: false },
    ],
    showDownArrowsState: 11, nextState: 12, resetFrame: true, wallFrame: 12,
  });
  assert.deepEqual(script.bulletTransition, {
    hitObject: '9900ff', requiredState: 9, nextState: 10, wallFrame: 10,
    effects: [
      { type: 'hudFrame', frameLabel: 'idle' },
      { type: 'message', target: 'player', text: "It looks like the elevator's out.. I'll have to jump.", seconds: 5, force: true, voice: 'V_Ca1_7' },
      { type: 'setAmmo', target: 'player', clip: 0, spare: 0 },
      { type: 'elevatorFrame', frameLabel: 'play' },
      { type: 'hideDownArrows' },
    ],
  });
  assert.deepEqual(script.inputTransition, {
    key: 'swapGuns', requiredState: 12, nextState: 13, wallFrame: 13,
    effects: [
      { type: 'hudFrame', frameLabel: 'idle' },
      { type: 'showDownArrows', state: 12 },
      { type: 'doorFrame', frameLabel: 'open' },
    ],
  });
});
