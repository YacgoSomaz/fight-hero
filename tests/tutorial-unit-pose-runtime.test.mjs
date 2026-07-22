import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTutorialM4PoseRuntime } from '../src/tutorial-unit-pose-runtime.mjs';

test('Tutorial pose loader fetches the versioned original M4 vector display list before any actor can use it', async () => {
  const requests = [];
  const runtime = await loadTutorialM4PoseRuntime(async (url) => {
    requests.push(url);
    return { ok: true, json: async () => ({ roots: [501, 668], actions: { rifle: { rear: [], front: [] } } }) };
  });

  assert.deepEqual(requests, ['./public/assets/m4-vector-runtime.local.json']);
  assert.deepEqual(runtime.roots, [501, 668]);
});

test('Tutorial pose loader rejects a missing source runtime instead of silently drawing a substitute arm', async () => {
  await assert.rejects(
    () => loadTutorialM4PoseRuntime(async () => ({ ok: false, status: 404 })),
    /original M4 pose runtime failed to load/,
  );
});
