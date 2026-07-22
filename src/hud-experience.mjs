// Directly from Stats_Classes.getNextExp() and Hud.addExp(). The caller owns
// gain/level-up events; this module only reproduces Hud's displayed state.
export function getHudExperience({ level, exp }) {
  const currentLevel = Math.max(1, Math.floor(Number(level) || 1));
  const currentExp = Math.max(0, Math.floor(Number(exp) || 0));
  if (currentLevel >= 50) {
    return { level: 50, exp: currentExp, nextExp: null, width: 420, text: 'Level Maxed', maxed: true };
  }
  const nextExp = currentLevel * currentLevel * 3 + 40;
  return {
    level: currentLevel,
    exp: currentExp,
    nextExp,
    width: currentExp / nextExp * 420,
    text: `Exp ${currentExp} / ${nextExp}`,
    maxed: false,
  };
}
