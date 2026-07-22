// Evidence: symbol 1431 frame 1 has four placements of character 1424 and
// one placement of character 1428.  Values below are copied from its decoded
// Display List; registration points come from FFDec's SVG export.
const LINE = Object.freeze({
  source: './public/assets/original-swf/aimer-line-1424.png',
  width: 1.5,
  height: 5.95,
  origin: Object.freeze({ x: 0.75, y: 5.2 }),
});
const CIRCLE = Object.freeze({
  source: './public/assets/original-swf/aimer-circle-1428-frame1.png',
  origin: Object.freeze({ x: 20, y: 20 }),
});

function getPlayerAsSpread(arm, pointer, dynRecoilMod) {
  const dx = pointer.x - arm.x;
  const dy = pointer.y - arm.y;
  // Player.as: dist *= dist; dist *= 2;
  // sqrt(dist - dist * cos(gun.dynRecoilMod * PI / 180)).
  const distanceSquaredTwice = (dx * dx + dy * dy) * 2;
  return Math.sqrt(Math.max(0, distanceSquaredTwice - distanceSquaredTwice * Math.cos(dynRecoilMod * Math.PI / 180)));
}

export function getOriginalAimerRig({ pointer, arm, dynRecoilMod }) {
  const spread = getPlayerAsSpread(arm, pointer, dynRecoilMod);
  return {
    spread,
    parts: [
      { name: 'line1', source: LINE.source, x: pointer.x + 0.05, y: pointer.y - 0.1 - spread, width: LINE.width, height: LINE.height, origin: LINE.origin, matrix: [1, 0, 0, 1] },
      { name: 'line2', source: LINE.source, x: pointer.x + 0.1 + spread, y: pointer.y + 0.15, width: LINE.width, height: LINE.height, origin: LINE.origin, matrix: [0, 1, -1, 0] },
      { name: 'line3', source: LINE.source, x: pointer.x - 0.15, y: pointer.y + 0.2 + spread, width: LINE.width, height: LINE.height, origin: LINE.origin, matrix: [-1, 0, 0, -1] },
      { name: 'line4', source: LINE.source, x: pointer.x - 0.2 - spread, y: pointer.y - 0.05, width: LINE.width, height: LINE.height, origin: LINE.origin, matrix: [0, -1, 1, 0] },
      { name: 'circle', source: CIRCLE.source, x: pointer.x + 0.15 - spread, y: pointer.y + 0.05 - spread, width: spread * 2, height: spread * 2, origin: CIRCLE.origin, matrix: [1, 0, 0, 1] },
    ],
  };
}
