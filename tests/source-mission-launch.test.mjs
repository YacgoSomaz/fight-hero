import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getSourceMissionLaunch } from '../src/source-mission-launch.mjs';
import { CAMPAIGN_MISSIONS, CHALLENGE_MISSIONS, createMatchSelection } from '../src/menu-state.mjs';

// User journey: selecting Under Siege in the original Campaign list opens
// its dedicated source Cutscene first, rather than bypassing the original
// opening pages and disguising it as a generic quick-match launch.
test('Campaign 1 opens its audited source Cutscene while every other mission remains unavailable', () => {
  assert.deepEqual(getSourceMissionLaunch(createMatchSelection(CAMPAIGN_MISSIONS[0])), {
    kind: 'campaign-one-pre-cutscene',
    href: './campaign-one-cutscene.html?source=campaign-1',
    message: '第 1 关将先播放原始开场页面。',
  });
  assert.equal(getSourceMissionLaunch(createMatchSelection(CAMPAIGN_MISSIONS[1])), null);
  assert.equal(getSourceMissionLaunch(createMatchSelection(CHALLENGE_MISSIONS[0])), null);
  assert.equal(getSourceMissionLaunch(createMatchSelection()), null);
});

test('the visible Campaign start consumes the audited source launch before generic match startup', () => {
  const main = readFileSync(new URL('../src/main.mjs', import.meta.url), 'utf8');
  assert.match(main, /import\s*\{\s*getSourceMissionLaunch\s*\}\s*from '.\/source-mission-launch\.mjs';/);
  assert.match(main, /const sourceMissionLaunch = getSourceMissionLaunch\(matchSelection\);[\s\S]*?window\.location\.assign\(sourceMissionLaunch\.href\);[\s\S]*?return;/);
});
