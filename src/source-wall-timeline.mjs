// Direct source relation: MBFZ_fla.pot_203 (symbol 1258) is a 306-frame
// Foundry child MovieClip. Its addFrameScript(31, frame32, 53, frame54) calls
// Arena.changeWallFrame(2) and Arena.changeWallFrame(1), respectively.
// FrameScript indices are zero-based; the observable Flash frames are 32/54.
const SOURCE_TIMELINES = Object.freeze({
  foundry: Object.freeze({
    frameCount: 306,
    wallChanges: Object.freeze({ 32: 2, 54: 1 }),
  }),
  foundry2: Object.freeze({
    frameCount: 306,
    wallChanges: Object.freeze({ 32: 2, 54: 1 }),
  }),
});

export function createSourceWallTimeline(mapId) {
  const timeline = SOURCE_TIMELINES[mapId];
  return Object.freeze({
    mapId,
    timelineFrame: timeline ? 1 : null,
    wallFrame: 1,
  });
}

export function advanceSourceWallTimeline(state, ticks = 1) {
  if (!Number.isInteger(ticks) || ticks < 0) throw new TypeError('source wall timeline ticks must be a non-negative integer');
  const timeline = SOURCE_TIMELINES[state?.mapId];
  if (!timeline) return Object.freeze({ state: Object.freeze({ ...state }), changes: Object.freeze([]) });
  if (!Number.isInteger(state.timelineFrame) || state.timelineFrame < 1 || state.timelineFrame > timeline.frameCount) {
    throw new RangeError(`invalid source wall timeline frame for ${state.mapId}`);
  }
  let timelineFrame = state.timelineFrame;
  let wallFrame = state.wallFrame;
  const changes = [];
  for (let tick = 0; tick < ticks; tick += 1) {
    timelineFrame = timelineFrame === timeline.frameCount ? 1 : timelineFrame + 1;
    const nextWallFrame = timeline.wallChanges[timelineFrame];
    if (nextWallFrame && nextWallFrame !== wallFrame) {
      wallFrame = nextWallFrame;
      changes.push(Object.freeze({ sourceFrame: timelineFrame, wallFrame }));
    }
  }
  return Object.freeze({
    state: Object.freeze({ mapId: state.mapId, timelineFrame, wallFrame }),
    changes: Object.freeze(changes),
  });
}

export { SOURCE_TIMELINES };
