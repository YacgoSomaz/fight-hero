import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUnitMCSkinFrameBounds } from '../private-assets/parse-unitmc-skin-graph.mjs';

test('each original UnitMC skin child exposes its own source registration bounds', () => {
  const bounds = extractUnitMCSkinFrameBounds(57);

  assert.equal(bounds.length, 14);
  assert.deepEqual(bounds.map(({ path, character }) => [path, character]), [
    ['head', 666], ['body', 631], ['arm1.arm2up', 298], ['arm1.arm2low', 266], ['arm1.hand2', 385],
    ['arm2.arm1up', 298], ['arm2.arm1low', 266], ['arm2.hand1', 385], ['legup1', 598], ['legup2', 598],
    ['leglow1', 568], ['leglow2', 568], ['foot1', 538], ['foot2', 538],
  ]);
  for (const { bounds: box } of bounds) {
    assert.ok(box.xMax > box.xMin && box.yMax > box.yMin, 'a source skin component must retain a non-empty local registration box');
  }
  assert.deepEqual(bounds.find(({ path }) => path === 'head').bounds, { xMin: -6.65, xMax: 15.45, yMin: -20.2, yMax: 3.75 });
  assert.deepEqual(bounds.find(({ path }) => path === 'body').bounds, { xMin: -12.3, xMax: 12, yMin: -17.05, yMax: 12.8 });
  assert.notDeepEqual(
    bounds.find(({ path }) => path === 'body').bounds,
    extractUnitMCSkinFrameBounds(55).find(({ path }) => path === 'body').bounds,
    'different source skin frames must not silently reuse a generic Medic crop',
  );
});
