import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractCampaignOneScript } from '../private-assets/parse-campaign-one-script.mjs';
import { SOURCE_CAMPAIGN_ONE_SCRIPT } from '../src/campaign-one-script-source.mjs';

const source = {
  campaign: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url), 'utf8'),
  unit: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Unit.as', import.meta.url), 'utf8'),
  bullet: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Bullet.as', import.meta.url), 'utf8'),
  player: fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Player.as', import.meta.url), 'utf8'),
};

// User journey: code shipped to the browser must be generated from the
// decoded SWF script, not a second hand-maintained copy of its state machine.
test('the browser campaign one source module exactly matches the decoded script extractor', () => {
  assert.deepEqual(SOURCE_CAMPAIGN_ONE_SCRIPT, extractCampaignOneScript(source));
});
