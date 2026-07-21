import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRemoveTag } from '../private-assets/swf-display-list.mjs';

test('RemoveObject2 removes exactly its depth from a SWF display list', () => {
  const placed = new Map([
    [4, { depth: 4, character: 501, name: 'arm1' }],
    [9, { depth: 9, character: 668, name: 'arm2' }],
  ]);
  const body = Buffer.alloc(2);
  body.writeUInt16LE(4);

  assert.equal(applyRemoveTag(placed, { code: 28, body: 0 }, body), true);
  assert.deepEqual([...placed.keys()], [9]);
});

test('RemoveObject consumes its character id before its depth', () => {
  const placed = new Map([
    [4, { depth: 4, character: 501 }],
    [9, { depth: 9, character: 668 }],
  ]);
  const body = Buffer.alloc(4);
  body.writeUInt16LE(501, 0);
  body.writeUInt16LE(9, 2);

  assert.equal(applyRemoveTag(placed, { code: 5, body: 0 }, body), true);
  assert.deepEqual([...placed.keys()], [4]);
});
