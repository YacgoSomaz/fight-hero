import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceFoundryWorldTimeline, createFoundryWorldTimeline } from '../src/foundry-world-timeline.mjs';

test('Foundry world replaces collision authority at the same source tick that pot_203 reaches its frame-32 visual state', () => {
  const initial = createFoundryWorldTimeline('foundry');
  const result = advanceFoundryWorldTimeline(initial, [
    { frame: 1, mask: { id: 'wall-one' } },
    { frame: 2, mask: { id: 'wall-two' } },
  ], 31);

  assert.deepEqual(result, {
    state: { mapId: 'foundry', timelineFrame: 32, wallFrame: 2 },
    wall: { id: 'wall-two' },
  });
});

test('a Foundry timeline cannot silently retain stale collision when its original wall frame was not loaded', () => {
  assert.throws(() => advanceFoundryWorldTimeline(
    createFoundryWorldTimeline('foundry'),
    [{ frame: 1, mask: { id: 'wall-one' } }],
    31,
  ), /wallMC frame 2 is unavailable/);
});
