import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TUTORIAL_WALL_SOURCE } from '../src/tutorial-wall-source.mjs';

// User journey: Tutorial collision and progression must consume Wall_tut
// symbol 1378's own sixteen frames, never a generic source-map rectangle or
// Foundry wall mask.  Frame nine carries the sole source 9900ff elevator hit.
test('ships each original Wall_tut frame with its source dimensions and colour audit', () => {
  assert.equal(TUTORIAL_WALL_SOURCE.characterId, 1378);
  assert.equal(TUTORIAL_WALL_SOURCE.frames.length, 16);
  assert.deepEqual(TUTORIAL_WALL_SOURCE.frames[0], {
    frame: 1, width: 2757, height: 1541,
    file: './public/assets/original-swf/wall-tut-1378/1.png',
    colourAudit: { ff00ff: [115, 392, 1681, 1500, 174759], '9900ff': null },
  });
  assert.deepEqual(TUTORIAL_WALL_SOURCE.frames[8], {
    frame: 9, width: 2757, height: 1541,
    file: './public/assets/original-swf/wall-tut-1378/9.png',
    colourAudit: { ff00ff: null, '9900ff': [2547, 575, 2572, 698, 3224] },
  });
  for (const frame of TUTORIAL_WALL_SOURCE.frames) {
    assert.ok(fs.statSync(new URL(`../${frame.file.slice(2)}`, import.meta.url)).size > 0, `missing original Wall_tut frame ${frame.frame}`);
  }
});
