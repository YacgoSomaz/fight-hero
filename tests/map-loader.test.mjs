import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMapLayers } from '../src/map-loader.mjs';
import { loadSourceWallFrames } from '../src/map-loader.mjs';
import { TUTORIAL_WALL_SOURCE } from '../src/tutorial-wall-source.mjs';

function createFakeImages() {
  const images = [];
  return {
    images,
    makeImage() {
      const image = { complete: false, naturalWidth: 0, source: '' };
      Object.defineProperty(image, 'src', {
        set(source) { image.source = source; },
        get() { return image.source; },
      });
      images.push(image);
      return image;
    },
  };
}

test('a map swap waits for three fresh successful source layers before adopting them', async () => {
  const fake = createFakeImages();
  const pending = loadMapLayers({ sky: 'sky.png', background: 'background.png', terrain: 'terrain.png' }, fake.makeImage);
  assert.equal(fake.images.length, 3);
  assert.deepEqual(fake.images.map((image) => image.src), ['sky.png', 'background.png', 'terrain.png']);
  fake.images.forEach((image) => { image.complete = true; image.naturalWidth = 100; image.onload(); });
  const layers = await pending;
  assert.equal(layers.sky, fake.images[0]);
  assert.equal(layers.map, fake.images[1]);
  assert.equal(layers.terrain, fake.images[2]);
});

test('a missing source layer rejects launch instead of entering a blank map', async () => {
  const fake = createFakeImages();
  const pending = loadMapLayers({ sky: 'sky.png', background: 'background.png', terrain: 'terrain.png' }, fake.makeImage);
  fake.images[0].onload();
  fake.images[1].onerror(new Error('missing background.png'));
  fake.images[2].onload();
  await assert.rejects(pending, /background\.png/);
});

test('Tutorial waits for every original Wall_tut frame before exposing a swappable wall set', async () => {
  const fake = createFakeImages();
  const pending = loadSourceWallFrames(TUTORIAL_WALL_SOURCE, fake.makeImage);
  assert.equal(fake.images.length, 16);
  assert.deepEqual(fake.images.map((image) => image.src), TUTORIAL_WALL_SOURCE.frames.map(({ file }) => file));
  fake.images.forEach((image) => { image.complete = true; image.naturalWidth = 2757; image.naturalHeight = 1541; image.onload(); });
  const frames = await pending;
  assert.deepEqual(frames.map(({ frame, image }) => [frame, image]), TUTORIAL_WALL_SOURCE.frames.map(({ frame }, index) => [frame, fake.images[index]]));
});
