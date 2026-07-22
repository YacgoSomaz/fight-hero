import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Tutorial scene preview mounts source map layers, source camera, and source actor without generic quick-match code', () => {
  const page = fs.readFileSync(new URL('../tutorial-scene-preview.html', import.meta.url), 'utf8');
  const script = fs.readFileSync(new URL('../src/tutorial-scene-preview.mjs', import.meta.url), 'utf8');
  assert.match(page, /<canvas id="tutorialScene" width="800" height="600"/);
  assert.match(page, /src="src\/tutorial-scene-preview\.mjs"/);
  assert.match(script, /getMapVisual\('tut'\)/);
  assert.match(script, /loadMapLayers/);
  assert.match(script, /advanceTutorialArenaPosition/);
  assert.match(script, /createTutorialActorPlayback/);
  assert.match(script, /drawTutorialUnitPose/);
  assert.match(script, /canvas\.dataset\.ready = 'true'/);
  assert.doesNotMatch(script, /main\.mjs|engine\.mjs|createWorld|foundry/);
});
