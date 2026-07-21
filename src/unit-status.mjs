function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Unit labels sit above the head independently of the screen HUD.  Keep the
// visible green health fill inside a one-pixel dark frame, like the source's
// lightweight in-world indicators.
export function getUnitOverheadHud(player, screen, unitHeight) {
  const labelY = screen.y - unitHeight - 20;
  const ratio = clamp(player.hp / Math.max(1, player.maxHp), 0, 1);
  const outline = { x: screen.x - 17, y: labelY + 6, width: 34, height: 6 };
  return {
    label: player.isBot ? 'AI' : 'P1',
    labelX: screen.x,
    labelY,
    outline,
    fill: { x: outline.x + 1, y: outline.y + 1, width: 32 * ratio, height: 4, color: '#8df05b' },
  };
}
