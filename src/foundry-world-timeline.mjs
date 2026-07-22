import { advanceSourceWallTimeline, createSourceWallTimeline } from './source-wall-timeline.mjs';

export function createFoundryWorldTimeline(mapId) {
  const state = createSourceWallTimeline(mapId);
  if (state.timelineFrame == null) throw new RangeError(`Foundry world timeline is unavailable for ${mapId}`);
  return state;
}

export function advanceFoundryWorldTimeline(state, wallFrames, ticks) {
  const next = advanceSourceWallTimeline(state, ticks).state;
  const currentWall = wallFrames?.find((candidate) => candidate.frame === next.wallFrame);
  if (!currentWall) throw new Error(`original Foundry wallMC frame ${next.wallFrame} is unavailable`);
  return Object.freeze({ state: next, wall: currentWall.mask });
}
