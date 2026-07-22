// Unit.setJug() calls gotoAndStop(2). Frame two adds shape 686 at depth 10
// with identity matrix. Its source RECT is x=-17.45..20.8 and
// y=-101.85..-89.1; the exported PNG is only an image crop, not its origin.
export function getTutorialUnitJugMarker(unit, screen) {
  if (!unit.isJug) return null;
  return {
    assetSrc: './public/assets/original-swf/unit-jug-marker-686.png',
    symbolId: 686,
    x: screen.x - 17.45,
    y: screen.y - 101.85,
    width: 38.25,
    height: 12.75,
  };
}
