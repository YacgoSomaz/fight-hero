import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCSkinGraph } from '../private-assets/parse-unitmc-skin-graph.mjs';

test('UnitMC.setSkin targets nested child MovieClips instead of root animation frames', () => {
  const graph = extractUnitMCSkinGraph();

  assert.deepEqual(graph.targets, [
    ['head', 666, 200],
    ['body', 631, 201],
    ['arm1.arm2up', 298, 201],
    ['arm1.arm2low', 266, 201],
    ['arm1.hand2', 385, 201],
    ['arm2.arm1up', 298, 201],
    ['arm2.arm1low', 266, 201],
    ['arm2.hand1', 385, 201],
    ['legup1', 598, 201],
    ['legup2', 598, 201],
    ['leglow1', 568, 201],
    ['leglow2', 568, 201],
    ['foot1', 538, 201],
    ['foot2', 538, 201],
  ]);

  assert.equal(graph.rootAnimation, 669);
  assert.equal(graph.rootAnimationFrames, 449);
  assert.ok(graph.targets.every(([, , frames]) => frames >= 155));
});
