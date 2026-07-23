import assert from 'node:assert/strict';
import test from 'node:test';
import { drawSourceTintedImage } from '../src/source-tinted-image-renderer.mjs';

function context(calls) {
  return {
    globalCompositeOperation: 'source-over', globalAlpha: 1, fillStyle: '',
    drawImage(...args) { calls.push(['drawImage', ...args]); },
    fillRect(...args) { calls.push(['fillRect', ...args]); },
  };
}

// Canvas source-in affects every existing pixel on its target. Source HUD
// tints therefore need a private buffer: applying it to the world canvas
// makes the map disappear outside the tiny hp/experience mask.
test('source tint masks inside an isolated canvas and preserves the world compositor', () => {
  const worldCalls = [];
  const bufferCalls = [];
  const world = context(worldCalls);
  const image = { naturalWidth: 47, naturalHeight: 5 };
  const createCanvas = () => ({ getContext: () => context(bufferCalls) });

  drawSourceTintedImage(world, {
    image, source: { x: 0, y: 0, width: 47, height: 5 },
    destination: { x: 258, y: 244, width: 48.5, height: 3.1 },
    colour: '#47aef2', alpha: 0.7, createCanvas,
  });

  assert.equal(world.globalCompositeOperation, 'source-over');
  assert.equal(worldCalls.filter(([kind]) => kind === 'fillRect').length, 0);
  assert.equal(worldCalls.filter(([kind]) => kind === 'drawImage').length, 1);
  assert.deepEqual(bufferCalls.map(([kind]) => kind), ['drawImage', 'fillRect']);
  assert.equal(bufferCalls[1][0], 'fillRect');
});
