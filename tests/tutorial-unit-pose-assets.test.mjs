import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTutorialUnitPoseAssets } from '../src/tutorial-unit-pose-assets.mjs';

test('Tutorial pose asset loader accepts only the original Shape corpus and versioned M4 Display List', async () => {
  const loaded = []; const requests = [];
  const assets = await loadTutorialUnitPoseAssets({
    loadImage: async (source) => { loaded.push(source); return { source }; },
    fetchImpl: async (url) => {
      requests.push(url);
      if (url.includes('m4-vector')) return { ok: true, json: async () => ({ roots: [501, 668], actions: { rifle: { rear: [], front: [] } }, sprites: {}, shapes: {} }) };
      return { ok: true, json: async () => ({ symbolId: 394, frameCount: 8, frames: Array.from({ length: 8 }, () => ({ items: [] })), shapes: { 386: { fills: [] } } }) };
    },
  });
  assert.equal(loaded.length, 39);
  assert.equal(new Set(loaded).size, 39);
  assert.ok(loaded.every((source) => source.startsWith('./public/assets/original-swf/unit-skin-shapes/')));
  assert.deepEqual(requests, ['./public/assets/m4-vector-runtime.local.json', './public/assets/usp2-muzzle-flash-runtime.local.json']);
  assert.deepEqual(assets.imageFor(loaded[0]), { source: loaded[0] });
  assert.equal(typeof assets.drawMuzzle, 'function');
});

test('Tutorial pose asset loader rejects a failed original Shape export', async () => {
  await assert.rejects(() => loadTutorialUnitPoseAssets({ loadImage: async () => null, fetchImpl: async () => ({ ok: true, json: async () => ({ roots: [501, 668], actions: { rifle: { rear: [], front: [] } }, sprites: {}, shapes: {} }) }) }), /original Tutorial Shape asset failed to load/);
});
