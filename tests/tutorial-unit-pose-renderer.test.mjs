import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createTutorialUnitPosePlan } from '../src/tutorial-unit-pose-plan.mjs';
import { drawTutorialUnitPose } from '../src/tutorial-unit-pose-renderer.mjs';

const timeline = JSON.parse(fs.readFileSync(new URL('../public/assets/unitmc-timeline.json', import.meta.url), 'utf8'));
const m4 = JSON.parse(fs.readFileSync(new URL('../public/assets/m4-vector-runtime.local.json', import.meta.url), 'utf8'));

function recordingContext() {
  const calls = [];
  return { calls, save: () => calls.push(['save']), restore: () => calls.push(['restore']), translate: (x, y) => calls.push(['translate', x, y]), transform: (a, b, c, d, e, f) => calls.push(['transform', a, b, c, d, e, f]), drawImage: (image, x, y) => calls.push(['drawImage', image.source, x, y]) };
}

function riflePose() {
  return createTutorialUnitPosePlan({ rootFrame: timeline.frames[0], rearAction: m4.actions.rifle.rear[0].items, frontAction: m4.actions.rifle.front[0].items, skinFrame: 57 });
}

test('Tutorial Shape renderer paints each original crop at its own root or nested action matrix', () => {
  const context = recordingContext();
  const guns = [];
  drawTutorialUnitPose(context, riflePose(), { imageFor: (source) => ({ source }), drawGun: (_context, gun) => guns.push(gun) });
  assert.deepEqual(context.calls.slice(0, 5), [
    ['save'], ['translate', 0.6, -11.2], ['transform', 0.97003173828125, -0.0035400390625, 0.093658447265625, 0.969696044921875, 0, 0], ['drawImage', './public/assets/original-swf/unit-skin-shapes/518.png', 1.5, 0], ['restore'],
  ]);
  const rearUpperStart = context.calls.findIndex((call, index) => call[0] === 'drawImage' && call[1] === './public/assets/original-swf/unit-skin-shapes/279.png' && index > 30);
  assert.deepEqual(context.calls.slice(rearUpperStart - 5, rearUpperStart + 1), [
    ['save'], ['translate', 0.3, -42], ['transform', 1, 0, 0, 1, 0, 0], ['translate', 4.55, -0.15], ['transform', 0.314422607421875, 0.887176513671875, -0.887176513671875, 0.314422607421875, 0, 0], ['drawImage', './public/assets/original-swf/unit-skin-shapes/279.png', -7.5, -4.6],
  ]);
  assert.deepEqual(guns.map(({ rootId, character, frame }) => ({ rootId, character, frame })), [{ rootId: 'arm1', character: 375, frame: 20 }]);
});

test('Tutorial Shape renderer rejects a missing direct source image instead of drawing a substitute', () => {
  assert.throws(() => drawTutorialUnitPose(recordingContext(), riflePose(), { imageFor: () => null, drawGun: () => {} }), /original Tutorial Shape asset is unavailable/);
});
