import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getTutorialEnvironmentRenderPlan } from '../src/tutorial-environment-render-plan.mjs';

const runtime = JSON.parse(readFileSync(new URL('../public/assets/tutorial-environment-timeline-runtime.local.json', import.meta.url), 'utf8'));

test('maps source door/elevator frames and Arena transforms into the camera-relative Tutorial canvas', () => {
  const plan = getTutorialEnvironmentRenderPlan({
    door: { frame: 12 },
    elevator: { frame: 18 },
  }, runtime, { x: -100, y: -50 });

  assert.deepEqual(plan.door, {
    symbolId: 1361,
    frame: 12,
    outer: { x: 1558.1, y: 1176.6, scaleX: 1, scaleY: 1.0455322, rotateSkew0: -0.019729614, rotateSkew1: 0 },
    mask: { symbolId: 1359, assetSrc: './public/assets/original-swf/tutorial-environment/1359.svg', x: -2.7, y: -3.75, width: 85.7, height: 132.95 },
    panel: { symbolId: 1360, assetSrc: './public/assets/original-swf/tutorial-environment/1360.svg', x: 41.25, y: -47.9, width: 82.5, height: 129.75, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
  });
  assert.equal(plan.elevator.symbolId, 1388);
  assert.equal(plan.elevator.frame, 18);
  assert.equal(plan.elevator.outer.x, 2417.35);
  assert.equal(plan.elevator.child.y, 879.2);
  assert.equal(plan.elevator.child.assetSrc, './public/assets/original-swf/tutorial-environment/1387.svg');
});

test('honours the original empty nineteenth elevator frame rather than leaving an invented platform onscreen', () => {
  const plan = getTutorialEnvironmentRenderPlan({ door: { frame: 1 }, elevator: { frame: 19 } }, runtime, { x: 0, y: 0 });
  assert.equal(plan.elevator, null);
});
