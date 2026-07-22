import { SOURCE_UNITMC_SKIN_TARGETS } from './tutorial-skin-source.mjs';

// Guns.as keeps the selected M4 in arm1.gun frame 20, while UnitMC.setSkin()
// separately calls gotoAndStop(skinFrame) on these nested limb clips.
const ARM_SKIN_CHILDREN = SOURCE_UNITMC_SKIN_TARGETS
  .filter(({ path }) => path.startsWith('arm'))
  .map(({ path, frames }) => ({ name: path.split('.').at(-1), frames }));

const MAX_ARM_SKIN_FRAME = Math.min(...ARM_SKIN_CHILDREN.map(({ frames }) => frames));

export function m4SkinChildFrames(skinFrame) {
  if (!Number.isInteger(skinFrame) || skinFrame < 1 || skinFrame > MAX_ARM_SKIN_FRAME) {
    throw new Error(`Skin frame ${skinFrame} is outside the original UnitMC skin child range 1-${MAX_ARM_SKIN_FRAME}`);
  }
  return Object.fromEntries([
    ['gun', 20],
    ...ARM_SKIN_CHILDREN.map(({ name }) => [name, skinFrame]),
  ]);
}
