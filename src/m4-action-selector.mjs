// Action labels and first-frame semantics come directly from arm symbols
// 501/668: rifle=77, rifle_fire=78..80, rifle_reload=81..115.
export function selectM4Action(actor, firedThisFrame) {
  if (actor.weapon.reloadRemaining > 0) return { label: 'rifle_reload', frame: 1 };
  if (firedThisFrame || actor.fireTimer > 0) return { label: 'rifle_fire', frame: 1 };
  return { label: 'rifle', frame: 1 };
}
