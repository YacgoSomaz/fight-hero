import test from 'node:test';
import assert from 'node:assert/strict';
import { selectM4Action } from '../src/m4-action-selector.mjs';

test('maps live weapon state to original M4 label spans', () => {
  assert.deepEqual(selectM4Action({ weapon: { reloadRemaining: 1 }, fireTimer: 0 }, false), { label: 'rifle_reload', frame: 1 });
  assert.deepEqual(selectM4Action({ weapon: { reloadRemaining: 0 }, fireTimer: .1 }, true), { label: 'rifle_fire', frame: 1 });
  assert.deepEqual(selectM4Action({ weapon: { reloadRemaining: 0 }, fireTimer: 0 }, false), { label: 'rifle', frame: 1 });
});
