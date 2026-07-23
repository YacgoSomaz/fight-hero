import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { TUTORIAL_SPEAK_SOURCE_ASSETS, getTutorialSpeakPortraitSource } from '../src/tutorial-speak-source.mjs';

test('Speak_187 chrome and each original portrait Shape are shipped as direct source SVGs', () => {
  assert.deepEqual(TUTORIAL_SPEAK_SOURCE_ASSETS.chrome, {
    1482: './public/assets/original-swf/tutorial-speak/1482.svg',
    1483: './public/assets/original-swf/tutorial-speak/1483.svg',
    1484: './public/assets/original-swf/tutorial-speak/1484.svg',
  });
  assert.equal(Object.keys(TUTORIAL_SPEAK_SOURCE_ASSETS.portraits).length, 34);
  for (const source of [...Object.values(TUTORIAL_SPEAK_SOURCE_ASSETS.chrome), ...Object.values(TUTORIAL_SPEAK_SOURCE_ASSETS.portraits)]) {
    const absolute = new URL(`..${source.slice(1)}`, import.meta.url);
    assert.equal(existsSync(absolute), true, `original Speak source SVG is missing: ${source}`);
    assert.match(readFileSync(absolute, 'utf8'), /<svg\b/i);
  }
});

test('Campaign 1 Scientist resolves head frame 57 to original portrait Shape 645', () => {
  assert.deepEqual(getTutorialSpeakPortraitSource(57), {
    character: 645,
    source: './public/assets/original-swf/tutorial-speak/head/645.svg',
  });
  assert.throws(() => getTutorialSpeakPortraitSource(201), /frame/i);
});
