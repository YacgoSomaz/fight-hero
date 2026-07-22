import assert from 'node:assert/strict';
import test from 'node:test';

import { loadSourceWallMask } from '../src/source-wall-loader.mjs';

test('wall loader decodes the requested original map wall frame rather than a Foundry singleton', async () => {
  const made = [];
  const decoded = [];
  const result = await loadSourceWallMask('plane2', {
    makeImage: async (file) => {
      made.push(file);
      return { file };
    },
    decodeWallImage: (image) => {
      decoded.push(image.file);
      return { authority: image.file };
    },
  });

  assert.deepEqual({ characterId: result.source.characterId, frame: result.frame, mask: result.mask, made, decoded }, {
    characterId: 1323,
    frame: 1,
    mask: { authority: './public/assets/original-swf/wall-plane-1323/1.png' },
    made: ['./public/assets/original-swf/wall-plane-1323/1.png'],
    decoded: ['./public/assets/original-swf/wall-plane-1323/1.png'],
  });
});

test('wall loader keeps the selected source frame attached to its decoded mask', async () => {
  const result = await loadSourceWallMask('foundry', {
    frame: 2,
    makeImage: async (file) => ({ file }),
    decodeWallImage: (image) => ({ decoded: image.file }),
  });

  assert.deepEqual({ characterId: result.source.characterId, frame: result.frame, mask: result.mask }, {
    characterId: 1261,
    frame: 2,
    mask: { decoded: './public/assets/original-swf/wall-foundry-1261/2.png' },
  });
});

test('wall loader refuses a nonexistent source frame instead of silently falling back', async () => {
  await assert.rejects(
    loadSourceWallMask('plane', { frame: 2, makeImage: async () => ({}) }),
    /frame 2 is unavailable/,
  );
});
