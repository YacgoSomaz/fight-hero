import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTutorialWorld } from '../src/tutorial-world-loader.mjs';
import { TUTORIAL_WALL_SOURCE } from '../src/tutorial-wall-source.mjs';

function createFakeImages() {
  const images = [];
  return {
    images,
    makeImage() {
      const image = { complete: false, naturalWidth: 0, naturalHeight: 0, source: '' };
      Object.defineProperty(image, 'src', { set(source) { image.source = source; }, get() { return image.source; } });
      images.push(image);
      return image;
    },
  };
}

// User journey: browser-side Tutorial creation must load every public original
// Wall_tut PNG before it can expose a collision/trigger world.  It may not use
// a NodePhysBox, a generic Arena image, or a hand-written colour map.
test('browser Tutorial loader creates its world from all original decoded Wall_tut frames', async () => {
  const fake = createFakeImages();
  const pending = loadTutorialWorld({
    makeImage: fake.makeImage,
    decode(image) {
      return { isSolid: () => true, colorAt: () => image === fake.images[0] ? 'ff00ff' : '' };
    },
  });
  assert.deepEqual(fake.images.map((image) => image.src), TUTORIAL_WALL_SOURCE.frames.map(({ file }) => file));
  fake.images.forEach((image) => { image.complete = true; image.naturalWidth = 2757; image.naturalHeight = 1541; image.onload(); });
  const world = await pending;
  assert.equal(world.session.map.id, 'tut');
  assert.equal(world.session.map.wallFrame, 1);
  assert.equal(world.wall.colorAt(285, 706), 'ff00ff');
});
