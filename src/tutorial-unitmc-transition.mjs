// Direct semantic port of UnitMC.as:goto(param1, param2). This is a state
// transition rule only: root frame selection remains owned by the decoded
// DefineSprite 669 FrameLabel timeline.
export function transitionTutorialUnitMC({ current, requested, runType, force = false } = {}) {
  if (typeof current !== 'string' || typeof requested !== 'string') throw new Error('original UnitMC current and requested labels are required');
  if (force) return { changed: current !== requested, animation: requested };
  let next = requested;
  if (current === next) return { changed: false, animation: current };
  if (current === 'climbsmall' || current === 'climbbig' || current === 'landhard') return { changed: false, animation: current };
  if ((current === 'jump' || current === 'tuck') && next === 'fall') return { changed: false, animation: current };
  if (current === 'land' && next === 'idle') return { changed: false, animation: current };
  if (current === `landrun${runType}` && next === `run${runType}`) return { changed: false, animation: current };
  if (current === `landrunback${runType}` && next === `runback${runType}`) return { changed: false, animation: current };
  if (current === 'duckloop' && next === 'duck') return { changed: false, animation: current };
  if ((current === 'duckrun' || current === 'duckrunback' || current === 'slide') && next === 'duck') next = 'duckloop';
  if (current === 'duck' && next === 'idle') next = 'getup';
  if ((current === `run${runType}` || current === `landrun${runType}`) && next === 'duckrun') next = 'slide';
  if (current === `runback${runType}` && next === 'duckrunback') next = 'duck';
  if ((current === 'duckrun' && next === `run${runType}`) || (current === 'duckrunback' && next === `runback${runType}`)) next = 'getup';
  if (current === 'slide') return { changed: false, animation: current };
  if (current === 'duck' && (next === 'duckrun' || next === 'duckrunback')) return { changed: false, animation: current };
  if (current === 'getup' && (next === `run${runType}` || next === `runback${runType}` || next === 'idle')) return { changed: false, animation: current };
  return { changed: current !== next, animation: next };
}
