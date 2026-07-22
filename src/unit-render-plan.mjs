// The complete decoded UnitMC frame is the rendering safety net.  Optional
// body-part playback may add a higher-fidelity pose, but it must never be the
// only visible representation of a living unit.
export function getUnitRenderPlan({ alive, hasTimeline, hasParts }) {
  if (!alive) return [];
  return hasTimeline && hasParts ? ['source-skin', 'timeline-rig'] : ['source-skin'];
}
