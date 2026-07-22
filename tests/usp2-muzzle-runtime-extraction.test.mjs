import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractUsp2MuzzleRuntime } from '../tools/extract-usp2-muzzle-runtime.mjs';

test('extracts the original USP2 MuzzleFlash_317 Display List from the source SWF', () => {
  const source = readFileSync(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
  const runtime = extractUsp2MuzzleRuntime(source);

  assert.equal(runtime.symbolId, 394);
  assert.equal(runtime.frameCount, 8);
  assert.deepEqual(runtime.frames.map(({ items }) => items.map(({ character }) => character)), [[386], [387], [388], [389], [390], [391], [392], [393]]);
  assert.deepEqual(Object.keys(runtime.shapes).map(Number).sort((a, b) => a - b), [386, 387, 388, 389, 390, 391, 392, 393]);
  assert.ok(Object.values(runtime.shapes).every(({ fills }) => fills.length > 0));
});
