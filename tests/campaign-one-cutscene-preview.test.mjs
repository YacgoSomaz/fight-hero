import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// The route selected by the original Campaign menu must render original
// Cutscene 1890 art and forward only its source prev/next state transitions
// to Tutorial. This is intentionally a separate page from the game canvas:
// it preserves Cutscene.as's start-game boundary instead of faking a dialog
// over a running match.
test('Campaign 1 Cutscene preview loads the direct extracted display list and source flow', () => {
  const page = fs.readFileSync(new URL('../campaign-one-cutscene.html', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../src/campaign-one-cutscene-preview.mjs', import.meta.url), 'utf8');
  const source = fs.readFileSync(new URL('../src/campaign-one-cutscene-source.mjs', import.meta.url), 'utf8');

  assert.match(page, /<canvas id="campaignOneCutscene" width="800" height="600"/);
  assert.match(page, /src="src\/campaign-one-cutscene-preview\.mjs"/);
  assert.match(script, /createCampaignOnePreCutscene/);
  assert.match(script, /advanceCampaignOnePreCutscene/);
  assert.match(script, /CAMPAIGN_ONE_CUTSCENE_SOURCE/);
  assert.match(script, /ART_ROOT = '\.\/public\/assets\/original-swf\/cutscene-1890'/);
  assert.match(source, /art: Object\.freeze\(\[3, 1571/);
  assert.match(script, /1576_QTypeSquare-Book_16pt_st\.ttf/);
  assert.match(script, /window\.location\.assign\('\.\/tutorial-scene-preview\.html\?source=campaign-1'\)/);
  assert.doesNotMatch(script, /fillRect\(/);
});
