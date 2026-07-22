// Direct transcription of Hud.as:setAmmoImage() and Hud.as:drawBox().
// Values are in the local coordinate system of Hud 1540.bulletCont (954),
// whose parent placement applies scaleX=-1 and scaleY=-1.
const AMMO_LAYOUTS = Object.freeze({
  pistol: Object.freeze({ gap: 2, width: 2, height: 6 }),
  magnum: Object.freeze({ gap: 3, width: 3, height: 7 }),
  arifle: Object.freeze({ gap: 2, width: 2, height: 10 }),
  sniper: Object.freeze({ gap: 3, width: 20, height: 5 }),
  shotgun: Object.freeze({ gap: 2, width: 5, height: 8 }),
  rocket: Object.freeze({ gap: 3, width: 7, height: 12 }),
});

function drawBoxes(clip, count, layout, rowY = 0) {
  return Array.from({ length: count }, (_, index) => ({
    x: index * (layout.gap + layout.width), y: rowY,
    width: layout.width, height: layout.height, filled: clip > index,
  }));
}

export function getHudAmmoBoxes({ clip, clipMax, type }) {
  const current = Math.max(0, Number(clip) || 0);
  const capacity = Math.max(0, Number(clipMax) || 0);
  const layout = AMMO_LAYOUTS[type];
  if (layout) return drawBoxes(current, capacity, layout);
  if (type !== 'machine') return [];

  // Hud.as handles machine guns as two half-height rows. It removes the
  // rounds assigned to the bottom row before it draws the upper row.
  const rowCount = Math.ceil(capacity / 2);
  const overflow = Math.max(0, current - capacity / 2);
  const topClip = current - overflow;
  const machine = { gap: 2, width: 2, height: 5 };
  return [
    ...drawBoxes(topClip, rowCount, machine),
    ...drawBoxes(overflow, rowCount, machine, 7),
  ];
}
