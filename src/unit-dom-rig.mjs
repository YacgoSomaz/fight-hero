// DOM presentation equivalent of the existing UnitMC Canvas path.  Every
// placement below comes from an already-resolved Place/Remove frame exported
// from symbol 669; this module deliberately does not invent keyframes.
const DOM_PARTS = Object.freeze([
  { id: 'arm1', source: './public/assets/unit-parts/full/rifle_arm_rifle_idle.png', offset: { x: -8, y: -15 }, aimed: 1, recoil: true },
  { id: 'foot2', source: './public/assets/unit-parts/tight/foot.png', offset: { x: 1.5, y: 0 } },
  { id: 'leglow2', source: './public/assets/unit-parts/tight/leg_lower.png', offset: { x: -9.45, y: -3.3 } },
  { id: 'legup2', source: './public/assets/unit-parts/tight/leg_upper.png', offset: { x: -5.5, y: -2.95 } },
  { id: 'foot1', source: './public/assets/unit-parts/tight/foot.png', offset: { x: 1.5, y: 0 } },
  { id: 'leglow1', source: './public/assets/unit-parts/tight/leg_lower.png', offset: { x: -9.45, y: -3.3 } },
  { id: 'legup1', source: './public/assets/unit-parts/tight/leg_upper.png', offset: { x: -5.5, y: -2.95 } },
  { id: 'body', source: './public/assets/unit-parts/tight/body.png', offset: { x: -11.95, y: -15 } },
  { id: 'head', source: './public/assets/unit-parts/tight/head.png', offset: { x: -5.6, y: -18 }, aimed: .6 },
  { id: 'arm2', source: './public/assets/unit-parts/full/front_arm_rifle_idle.png', offset: { x: -2, y: -5 }, aimed: 1 },
]);

function itemMap(frame) {
  return new Map(frame.map(([name, x, y, scaleX, scaleY, skewX, skewY]) => [name, { x, y, scaleX, scaleY, skewX, skewY }]));
}

function localAim(aimAngle, facing) {
  if (facing >= 0) return aimAngle;
  return Math.atan2(Math.sin(Math.PI - aimAngle), Math.cos(Math.PI - aimAngle));
}

function aimedMatrix(item, aimAngle, factor) {
  // This is the exact Canvas operation used by Unit.as's dynamic head/arm
  // replacement: retain the source scale magnitude, then rotate only the
  // holder-controlled limb.  The original source skew is a static matrix;
  // Unit.as overwrites the corresponding orientation every EnterFrame.
  const scaleX = Math.hypot(item.scaleX, item.skewX);
  const scaleY = Math.hypot(item.skewY, item.scaleY);
  const rotation = aimAngle * factor;
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  return [scaleX * cosine, scaleY * sine, -scaleX * sine, scaleY * cosine];
}

function sourceMatrix(item) {
  return [item.scaleX, item.skewX, item.skewY, item.scaleY];
}

/**
 * Returns a paint-order list for one discrete UnitMC frame.  Coordinates are
 * in original symbol-669 units with the actor foot at (0, 0); callers only
 * scale the complete root for CSS pixels and may mirror that root for facing.
 */
export function getUnitDomRigFrame({ frames, frameNumber, aimAngle = 0, facing = 1, recoil = 0 } = {}) {
  const frame = frames?.[Number(frameNumber) - 1];
  if (!Array.isArray(frame)) return [];
  const items = itemMap(frame);
  const headHold = items.get('headhold');
  const armHold = items.get('arm1hold');
  if (!headHold || !armHold) return [];
  const aim = localAim(aimAngle, facing);

  return DOM_PARTS.flatMap((part) => {
    const item = items.get(part.id);
    if (!item) return [];
    const holder = part.id === 'head' ? headHold : (part.id === 'arm1' || part.id === 'arm2' ? armHold : item);
    const offset = {
      x: part.offset.x - (part.recoil ? Math.max(0, Number(recoil) || 0) * 2 : 0),
      y: part.offset.y,
    };
    return [{
      id: part.id,
      source: part.source,
      position: { x: holder.x, y: holder.y },
      offset,
      matrix: part.aimed === undefined ? sourceMatrix(item) : aimedMatrix(item, aim, part.aimed),
    }];
  });
}
