import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceCampaignOneSessionHud, applyCampaignOneSessionSurfaceContact, createCampaignOneSession } from '../src/campaign-one-session.mjs';

// Hud.setMsg() starts Speak_187 at the `open` label (frame 2), while the
// original MovieClip itself stops at frames 1 and 16.  On expiry, Hud enters
// `close` at frame 17; frame 33 then wraps to stopped frame 1.
test('Campaign 1 drives the original 33-frame Speak_187 open and close timeline', () => {
  const session = createCampaignOneSession({ random: () => 0 });
  session.runtime.state = 10;
  applyCampaignOneSessionSurfaceContact(session, { surface: 'ff00ff', human: true });

  assert.deepEqual(session.hud.speakTimeline, { frame: 2, playing: 'open' });

  for (let frame = 0; frame < 14; frame += 1) advanceCampaignOneSessionHud(session);
  assert.deepEqual(session.hud.speakTimeline, { frame: 16, playing: null });

  for (let frame = 0; frame < 135; frame += 1) advanceCampaignOneSessionHud(session);
  assert.equal(session.hud.msgTimer, 1);
  advanceCampaignOneSessionHud(session);
  assert.deepEqual(session.hud.speakTimeline, { frame: 17, playing: 'close' });

  for (let frame = 0; frame < 16; frame += 1) advanceCampaignOneSessionHud(session);
  assert.deepEqual(session.hud.speakTimeline, { frame: 33, playing: 'close' });
  advanceCampaignOneSessionHud(session);
  assert.deepEqual(session.hud.speakTimeline, { frame: 1, playing: null });
});
