// Hud 1540's DefineEditText children. Bounds are converted from the original
// twips to stage pixels and each field's Canvas anchor reflects its original
// Flash alignment (left/right/centre), not a redesigned HUD grid.
const SOURCE_FIELDS = Object.freeze({
  classname: { placement: { x: 2.95, y: 530.6 }, bounds: { xmin: -2, ymin: -2, xmax: 165, ymax: 14 }, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10, alpha: 127 / 255, align: 'left' },
  hp: { placement: { x: 70.6, y: 560.25 }, bounds: { xmin: -2, ymin: -2, xmax: 74.35, ymax: 16.4 }, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'left' },
  level: { placement: { x: 63.15, y: 580.75 }, bounds: { xmin: -2, ymin: -2, xmax: 108.75, ymax: 16.4 }, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'left' },
  curgun: { placement: { x: 633.95, y: 530.6 }, bounds: { xmin: -2, ymin: -2, xmax: 165, ymax: 14 }, fontFamily: 'QTypeSquare-Bold_10pt_st', fontPx: 10, alpha: 127 / 255, align: 'right' },
  ammo: { placement: { x: 667.6, y: 559.25 }, bounds: { xmin: -2, ymin: -2, xmax: 32.85, ymax: 16.4 }, fontFamily: 'QTypeSquare-Bold_12pt_st', fontPx: 12, alpha: 1, align: 'center' },
});

function canvasAnchor(field) {
  const { placement, bounds, align } = field;
  const x = align === 'left'
    ? placement.x + bounds.xmin
    : align === 'right'
      ? placement.x + bounds.xmax
      : placement.x + (bounds.xmin + bounds.xmax) / 2;
  // Original TWIP positions resolve at .05px granularity. Round the JS sum
  // back to that authored precision instead of leaking binary float noise.
  return { x: Number(x.toFixed(3)), y: Number((placement.y + bounds.ymin).toFixed(3)) };
}

function field(id, text) {
  const source = SOURCE_FIELDS[id];
  const anchor = canvasAnchor(source);
  return { id, text, x: anchor.x, y: anchor.y, fontFamily: source.fontFamily, fontPx: source.fontPx, alpha: source.alpha, align: source.align };
}

// Text values are the exact Hud.as/Status.as formatting: Status uses
// Math.ceil(hp) + " Hp", Hud writes "lvl: " + level and coerces spare ammo.
export function getHudTextFields({ className, hp, level, weaponName, spare }) {
  return [
    field('classname', String(className ?? '')),
    field('hp', `${Math.ceil(Number(hp) || 0)} Hp`),
    field('level', `lvl: ${Math.max(1, Math.floor(Number(level) || 1))}`),
    field('curgun', String(weaponName ?? '')),
    field('ammo', String(Math.max(0, Math.floor(Number(spare) || 0)))),
  ];
}
