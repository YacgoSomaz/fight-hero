import { getFoundryForegroundLayout } from './foundry-foreground-layout.mjs';
import { advanceSourceWallTimeline, createSourceWallTimeline } from './source-wall-timeline.mjs';

const FOUNDRY_POT_FRAME_COUNT = 306;
const FOUNDRY_WATER_FRAME_COUNT = 76;

function requireFoundryFrame(mapId, timelineFrame) {
  if (mapId !== 'foundry' && mapId !== 'foundry2') throw new RangeError(`Foundry foreground is unavailable for ${mapId}`);
  if (!Number.isInteger(timelineFrame) || timelineFrame < 1 || timelineFrame > FOUNDRY_POT_FRAME_COUNT) {
    throw new RangeError(`invalid Foundry source timeline frame ${timelineFrame}`);
  }
}

// 1252 and 1258 are independent child MovieClips placed in the same Arena
// frame.  Neither child has a stop/goto frame script; Flash advances both once
// per parent stage frame.  The pot's frame scripts are the sole authority for
// the matching wallMC frame, so derive wall state by replaying that source
// timeline instead of duplicating the 32/54 switch here.
export function getFoundryForegroundRuntimePlan({ mapId, timelineFrame, source, viewport }) {
  requireFoundryFrame(mapId, timelineFrame);
  const wallFrame = advanceSourceWallTimeline(
    createSourceWallTimeline(mapId),
    timelineFrame - 1,
  ).state.wallFrame;
  const waterFrame = ((timelineFrame - 1) % FOUNDRY_WATER_FRAME_COUNT) + 1;
  return Object.freeze({
    mapId,
    timelineFrame,
    wallFrame,
    layers: getFoundryForegroundLayout({ source, viewport, waterFrame, potFrame: timelineFrame }),
  });
}

export { FOUNDRY_POT_FRAME_COUNT, FOUNDRY_WATER_FRAME_COUNT };
