import assert from 'node:assert/strict';
import test from 'node:test';
import { commitStartedGameFrame } from '../src/game-start-render.mjs';

test('starting a map commits one complete frame without waiting for requestAnimationFrame', () => {
  const calls = [];

  commitStartedGameFrame(() => calls.push('rendered'));

  assert.deepEqual(calls, ['rendered']);
});
