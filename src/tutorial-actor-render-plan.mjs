// The full-frame export is a direct UnitMC source frame selected by
// Unit.setClass(startFrame + skin).  It remains the visible fallback while a
// later Tutorial renderer rebuilds movement/aim from the same display list.
export function getTutorialActorRenderPlan(bindings) {
  return bindings.actors.map((actor) => ({
    id: actor.id,
    unitFrame: actor.unitFrame,
    source: `./public/assets/unit-frames/${actor.unitFrame}.png`,
    visible: actor.spawned,
    position: actor.position ? { ...actor.position } : null,
  }));
}
