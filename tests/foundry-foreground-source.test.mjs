import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArenaFrameDisplayList, extractArenaFrameVisualBounds, extractFoundryForegroundDisplayList, extractSymbolFrameDisplayList, extractSymbolFrameVisualBounds } from '../tools/parse-foundry-foreground.mjs';

test('extracts the original Foundry foreground children from Arena frame 2 without flattening them', () => {
  const source = extractFoundryForegroundDisplayList();

  assert.deepEqual(source, {
    arenaCharacter: 1413,
    frame: 2,
    label: 'foundry',
    layers: [
      {
        depth: 1,
        character: 1242,
        frameCount: 1,
        matrix: { a: 1, b: 0, c: 0, d: 1, x: 0, y: 0 },
      },
      {
        depth: 2,
        character: 1252,
        frameCount: 76,
        matrix: { a: 0.9674072265625, b: 0, c: 0, d: 1, x: 1160.2, y: 722.95 },
      },
      {
        depth: 7,
        character: 1258,
        frameCount: 306,
        matrix: { a: 1, b: 0, c: 0, d: 1, x: 1046.4, y: -65.05 },
      },
    ],
  });
});

test('the extracted Foundry foreground contains only drawable original child symbols, not wallMC or authoring nodes', () => {
  const { layers } = extractFoundryForegroundDisplayList();

  assert.deepEqual(layers.map(({ character }) => character), [1242, 1252, 1258]);
});

// Tutorial must be recovered from Arena's own labelled frame before any PNG
// registration is changed.  The flattened image's transparent border is not
// evidence of the original child placement.
test('extracts the complete original Tutorial Arena display list by its source label', () => {
  const source = extractArenaFrameDisplayList({ label: 'tut' });

  assert.equal(source.arenaCharacter, 1413);
  assert.equal(source.label, 'tut');
  assert.ok(source.frame > 0);
  assert.ok(source.layers.length > 0);
  assert.ok(source.layers.every(({ character, matrix }) => Number.isInteger(character)
    && Number.isFinite(matrix.x) && Number.isFinite(matrix.y)));
});

test('recovers Tutorial visible-child bounds from the original Arena display list', () => {
  const source = extractArenaFrameVisualBounds({ label: 'tut', characters: [1353, 1358] });

  assert.equal(source.label, 'tut');
  assert.deepEqual(source.layers.map(({ character }) => character), [1353, 1358]);
  assert.ok(source.layers.every(({ bounds }) => Number.isFinite(bounds.xMin)
    && Number.isFinite(bounds.yMin) && bounds.xMax > bounds.xMin && bounds.yMax > bounds.yMin));
});

test('recovers Tutorial Bg and BgSky bounds from their original source frames', () => {
  const background = extractSymbolFrameVisualBounds({ character: 1210, frame: 18 });
  const sky = extractSymbolFrameVisualBounds({ character: 1187, frame: 5 });

  assert.equal(background.character, 1210);
  assert.equal(background.frame, 18);
  assert.equal(sky.character, 1187);
  assert.equal(sky.frame, 5);
  for (const source of [background, sky]) {
    assert.ok(Number.isFinite(source.bounds.xMin) && Number.isFinite(source.bounds.yMin));
    assert.ok(source.bounds.xMax > source.bounds.xMin && source.bounds.yMax > source.bounds.yMin);
  }
});

test('recovers the original Tutorial visible sprite child lists before flattening', () => {
  const base = extractSymbolFrameDisplayList({ character: 1353, frame: 1 });
  const overlay = extractSymbolFrameDisplayList({ character: 1358, frame: 1 });

  assert.equal(base.character, 1353);
  assert.equal(overlay.character, 1358);
  assert.ok(base.layers.length > 0);
  assert.ok(overlay.layers.length > 0);
  assert.ok(base.layers.every(({ character, matrix }) => Number.isInteger(character)
    && Number.isFinite(matrix.x) && Number.isFinite(matrix.y)));
});
