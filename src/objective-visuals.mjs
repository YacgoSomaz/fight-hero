const CTF_ROOT = './private-assets/objective-export/DefineSprite_1222_NodeCtfFlag';
const HOLDPOINT_ROOT = './private-assets/objective-export/DefineSprite_1240_NodeHoldpoint';

// These are FFDec's direct PNG exports of the original embedded symbols, not
// replacement icon artwork.  NodeCtfFlag.setTeam() goes to frames 1/2;
// NodeHoldpoint goes to curTeam + 1 (neutral/blue/orange).
export function getObjectiveVisual(mode, team = 0) {
  if (mode === 'ctf') return { source: `${CTF_ROOT}/${team === 2 ? 2 : 1}.png`, width: 108, height: 91 };
  if (mode === 'dom') return { source: `${HOLDPOINT_ROOT}/${Math.max(0, Math.min(2, team)) + 1}.png`, width: 114, height: 116 };
  return null;
}
