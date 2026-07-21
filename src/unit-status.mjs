function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Direct export of DefineSprite 670, placed twice by Unit (symbol 687) as
// bar_hp and bar_hurt.  Status.as changes its width to 40 + hpMax / 10, then
// scales it by hpCur / hpMax.  The source pixels are black alpha shapes and
// Unit.setBarColour applies the team colour transform at runtime.
export const ORIGINAL_UNIT_BAR = Object.freeze({
  assetSrc: './public/assets/original-swf/unit-bar-670.png',
  sourceWidth: 47,
  sourceHeight: 5,
  humanColour: '#33ff33',
  botColour: '#009900',
});

export function getUnitOverheadHud(player, screen, unitHeight) {
  const labelY = screen.y - unitHeight - 20;
  const ratio = clamp(player.hp / Math.max(1, player.maxHp), 0, 1);
  const sourceWidth = 40 + Math.max(1, player.maxHp) / 10;
  return {
    label: player.isBot ? 'AI' : 'P1',
    labelX: screen.x,
    labelY,
    bar: {
      assetSrc: ORIGINAL_UNIT_BAR.assetSrc,
      sourceWidth: ORIGINAL_UNIT_BAR.sourceWidth,
      sourceHeight: ORIGINAL_UNIT_BAR.sourceHeight,
      x: screen.x - 20.5,
      y: labelY + 6,
      width: sourceWidth * ratio,
      colour: player.isBot ? ORIGINAL_UNIT_BAR.botColour : ORIGINAL_UNIT_BAR.humanColour,
    },
  };
}
