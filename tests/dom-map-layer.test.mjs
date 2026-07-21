import assert from 'node:assert/strict';
import test from 'node:test';
import { getDomMapLayerLayout } from '../src/dom-map-layer.mjs';

test('a foreground source crop follows the same camera window as the canvas terrain renderer', () => {
  const layout = getDomMapLayerLayout({
    naturalWidth: 2000, naturalHeight: 1000,
    crop: { x: 100, y: 50, width: 1000, height: 500 },
    source: { x: 250, y: 125, width: 500, height: 250 },
    world: { width: 1000, height: 500 },
    viewport: { width: 500, height: 250 },
    followsCamera: true,
  });

  assert.deepEqual(layout, { width: 1000, height: 500, left: -175, top: -87.5 });
});

test('a source background uses its authored crop as one fixed viewport image', () => {
  const layout = getDomMapLayerLayout({
    naturalWidth: 1200, naturalHeight: 600,
    crop: { x: 100, y: 50, width: 600, height: 300 },
    source: { x: 0, y: 0, width: 500, height: 250 },
    world: { width: 1000, height: 500 },
    viewport: { width: 500, height: 250 },
    followsCamera: false,
  });

  assert.deepEqual(layout, { width: 1000, height: 500, left: -83.33333333333333, top: -41.666666666666664 });
});
