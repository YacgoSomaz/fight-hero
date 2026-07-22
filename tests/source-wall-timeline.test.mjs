import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceSourceWallTimeline, createSourceWallTimeline } from '../src/source-wall-timeline.mjs';

test('Foundry pot_203 changes Arena wallMC only on its original frame 32 and 54 callbacks', () => {
  let state = createSourceWallTimeline('foundry');
  assert.deepEqual(state, { mapId: 'foundry', timelineFrame: 1, wallFrame: 1 });

  state = advanceSourceWallTimeline(state, 30).state;
  assert.deepEqual(state, { mapId: 'foundry', timelineFrame: 31, wallFrame: 1 });

  const opened = advanceSourceWallTimeline(state, 1);
  assert.deepEqual(opened, {
    state: { mapId: 'foundry', timelineFrame: 32, wallFrame: 2 },
    changes: [{ sourceFrame: 32, wallFrame: 2 }],
  });

  const remainsOpen = advanceSourceWallTimeline(opened.state, 21);
  assert.deepEqual(remainsOpen.state, { mapId: 'foundry', timelineFrame: 53, wallFrame: 2 });

  const closed = advanceSourceWallTimeline(remainsOpen.state, 1);
  assert.deepEqual(closed, {
    state: { mapId: 'foundry', timelineFrame: 54, wallFrame: 1 },
    changes: [{ sourceFrame: 54, wallFrame: 1 }],
  });
});

test('Foundry pot_203 wraps at its original 306-frame MovieClip boundary without inventing another wall change', () => {
  const state = { mapId: 'foundry', timelineFrame: 306, wallFrame: 1 };
  assert.deepEqual(advanceSourceWallTimeline(state, 1), {
    state: { mapId: 'foundry', timelineFrame: 1, wallFrame: 1 },
    changes: [],
  });
});

test('maps without an original wall-changing child remain on their first wall frame', () => {
  const state = createSourceWallTimeline('plane2');
  assert.deepEqual(advanceSourceWallTimeline(state, 999), {
    state: { mapId: 'plane2', timelineFrame: null, wallFrame: 1 },
    changes: [],
  });
});
