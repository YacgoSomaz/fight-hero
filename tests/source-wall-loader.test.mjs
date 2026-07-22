import assert from 'node:assert/strict';
import test from 'node:test';

import { loadSourceWallMask } from '../src/source-wall-loader.mjs';

function loadedImageFactory(made) {
  return () => {
    const image = { complete: false, naturalWidth: 1, naturalHeight: 1, file: '' };
    Object.defineProperty(image, 'src', {
      set(file) {
        image.file = file;
        made.push(file);
        image.onload();
      },
    });
    return image;
  };
}

test('wall loader decodes the requested original map wall frame rather than a Foundry singleton', async () => {
  const made = [];
  const decoded = [];
  const result = await loadSourceWallMask('plane2', {
    makeImage: loadedImageFactory(made),
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
    makeImage: loadedImageFactory([]),
    decodeWallImage: (image) => ({ decoded: image.file }),
  });

  assert.deepEqual({ characterId: result.source.characterId, frame: result.frame, mask: result.mask }, {
    characterId: 1261,
    frame: 2,
    mask: { decoded: './public/assets/original-swf/wall-foundry-1261/2.png' },
  });
});

test('Foundry prepares every original wallMC frame before the pot timeline can switch its visible frame', async () => {
  const decoded = [];
  const result = await loadSourceWallMask('foundry', {
    makeImage: loadedImageFactory([]),
    decodeWallImage: (image) => {
      decoded.push(image.file);
      return { decoded: image.file };
    },
  });

  assert.deepEqual({ decoded, masks: result.masks }, {
    decoded: [
      './public/assets/original-swf/wall-foundry-1261/1.png',
      './public/assets/original-swf/wall-foundry-1261/2.png',
    ],
    masks: [
      { frame: 1, mask: { decoded: './public/assets/original-swf/wall-foundry-1261/1.png' } },
      { frame: 2, mask: { decoded: './public/assets/original-swf/wall-foundry-1261/2.png' } },
    ],
  });
});

test('wall loader refuses a nonexistent source frame instead of silently falling back', async () => {
  const made = [];
  await assert.rejects(
    loadSourceWallMask('plane', { frame: 2, makeImage: loadedImageFactory(made) }),
    /frame 2 is unavailable/,
  );
});
