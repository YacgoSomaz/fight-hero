import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractCampaignDefinitions } from '../private-assets/parse-stats-campaign.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from '../src/campaign-source.mjs';

const originalSource = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url), 'utf8');

// User journey: a browser-visible campaign definition is an audited generated
// artifact from the original setMatch source, never a separately hand-typed
// approximation that can lose actors, cutscenes, or extra rule switches.
test('the shipped campaign catalog exactly matches the local decoded Stats_Campaign source', () => {
  assert.deepEqual(SOURCE_CAMPAIGN_CATALOG, extractCampaignDefinitions(originalSource));
});

test('the shipped catalog retains the non-menu fields needed for future real stage launches', () => {
  const opening = SOURCE_CAMPAIGN_CATALOG.campaign[0];

  assert.deepEqual(
    { player: opening.player, botCount: opening.bots.length, cutscene: opening.cutscene, special: opening.special },
    {
      player: {
        team: 1, name: 'Scientist', soldier: 'medic', skin: 7, primary: 'M4', secondary: 'USP', skill: 'none', streak: 'none', difficulty: 0,
        extra: { spawn: { x: 285, y: 705, node: 'a' }, noAim: true },
      },
      botCount: 4,
      cutscene: { preSong: 'M_Slow', preFrames: [1, 2, 3], postSong: null, postFrames: [4, 5, 35] },
      special: 'Play as Scientist',
    },
  );
});
