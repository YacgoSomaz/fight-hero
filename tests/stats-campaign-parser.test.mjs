import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractCampaignDefinitions } from '../private-assets/parse-stats-campaign.mjs';

const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url), 'utf8');

// User journey: selecting a campaign stage must use the actual setMatch()
// records from the decoded SWF, including actors and special configuration,
// rather than the old hand-reduced map/mode/score menu index.
test('extracts all original campaign and challenge setMatch records', () => {
  const catalog = extractCampaignDefinitions(source);

  assert.equal(catalog.campaign.length, 15);
  assert.equal(catalog.challenges.length, 15);
  assert.equal(catalog.campaign[14].title, 'The Final Showdown');
  assert.equal(catalog.challenges[14].title, 'Meet Your Makers');
});

test('preserves Campaign 1 Under Siege actors, authored spawns, cutscene frames, and tutorial restrictions', () => {
  const [underSiege] = extractCampaignDefinitions(source).campaign;

  assert.deepEqual(underSiege, {
    kind: 'campaign', stage: 1,
    cutscene: { preSong: 'M_Slow', preFrames: [1, 2, 3], postSong: null, postFrames: [4, 5, 35] },
    mode: 'tdm', score: 15, map: 'tut', difficulty: 1, song: null,
    title: 'Under Siege',
    description: 'A research facility is being attacked. You hold very vital information, escape with your life!\n\n[Tutorial Level]',
    special: 'Play as Scientist', extra: {},
    player: {
      team: 1, name: 'Scientist', soldier: 'medic', skin: 7, primary: 'M4', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 0,
      extra: { spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
    },
    bots: [
      { team: 2, name: 'Unknown', soldier: 'tank', skin: 5, primary: 'Beretta', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 0, extra: { spawn: { x: 1530, y: 695, node: 'a' } } },
      { team: 2, name: 'Unknown', soldier: 'soldier', skin: 5, primary: 'Socom', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 0, extra: { spawn: { x: 1760, y: 695, node: 'a' }, aimReverse: true } },
      { team: 2, name: 'Unknown', soldier: 'medic', skin: 5, primary: 'USP', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 0, extra: { spawn: { x: 1790, y: 695, node: 'a' }, aimReverse: true } },
      { team: 1, name: 'Soldier', soldier: 'soldier', skin: 1, primary: 'Saw', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 7, extra: { noSpawn: true } },
    ],
  });
});

test('retains source challenge extra rules instead of flattening them into ordinary quick matches', () => {
  const catalog = extractCampaignDefinitions(source);
  const doubleAgent = catalog.challenges[0];
  const poison = catalog.challenges[8];

  assert.deepEqual(
    { mode: doubleAgent.mode, map: doubleAgent.map, extra: doubleAgent.extra, bots: doubleAgent.bots.length },
    { mode: 'tdm', map: 'cave', extra: { randomTeam: 300 }, bots: 7 },
  );
  assert.deepEqual(
    { title: poison.title, mode: poison.mode, extra: poison.extra },
    { title: 'Poison', mode: 'jug', extra: { jugDrain: true } },
  );
});
