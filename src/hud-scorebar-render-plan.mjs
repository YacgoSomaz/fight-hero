const SCOREBAR_MODE_NAMES = Object.freeze({
  dm: 'Deathmatch',
  jug: 'Juggernaut',
  tdm: 'Team Deathmatch',
  ctf: 'Capture the Flag',
  dom: 'Domination',
  zom: 'Outbreak',
});

// Directly read from Hud 1540 → ScoreBar 1462 → scorebar1/scorebar2 1458.
// PNG files are direct FFDec exports; the bounds retain the original source
// registration instead of treating FFDec's cropped canvas as Flash local 0,0.
const SOURCE_SCOREBAR = Object.freeze({
  holder: Object.freeze({ x: 180, y: 23 }),
  background: Object.freeze({
    source: './public/assets/original-swf/hud-scorebar-bg-1444.png',
    sourceBounds: Object.freeze({ x: 0, y: 1.25, width: 145.3, height: 15.6 }),
  }),
  mask: Object.freeze({
    source: './public/assets/original-swf/hud-scorebar-mask-1445.png',
    sourceBounds: Object.freeze({ x: 0, y: 1.05, width: 146, height: 15.8 }),
    clipDepth: 9,
  }),
  edge: Object.freeze({
    source: './public/assets/original-swf/hud-scorebar-edge-1457.png',
    sourceBounds: Object.freeze({ x: 139.05, y: -0.75, width: 9.5, height: 19 }),
  }),
  bar: Object.freeze({
    sourceBounds: Object.freeze({ x: 0, y: -7.8, width: 6, height: 15.6 }),
    x: 17.2,
    y: 8.9,
  }),
  fade: Object.freeze({
    sourceBounds: Object.freeze({ x: 0, y: -7.8, width: 17.2, height: 15.6 }),
    x: 0,
    y: 8.9,
  }),
  cap: Object.freeze({
    source: './public/assets/original-swf/hud-scorebar-cap-1456.png',
    sourceBounds: Object.freeze({ x: -6.2, y: -9.5, width: 12.4, height: 19 }),
    y: 8.75,
  }),
  scorebar1: Object.freeze({ depth: 1, matrix: Object.freeze({ a: 1, b: 0, c: 0, d: 0.56756591796875, x: -149.4, y: -3.1 }) }),
  scorebar2: Object.freeze({ depth: 12, matrix: Object.freeze({ a: 1, b: 0, c: 0, d: -0.56756591796875, x: -149.4, y: 19.8 }) }),
  text: Object.freeze({
    mode: Object.freeze({ matrix: Object.freeze({ x: -277, y: -20 }) }),
    score1: Object.freeze({ matrix: Object.freeze({ x: -311, y: -7 }) }),
    score2: Object.freeze({ matrix: Object.freeze({ x: -312, y: 6 }) }),
  }),
});

function sourceFrameFor(team, primary) {
  if (!Number.isInteger(team) || team < 0 || team > 2) {
    throw new RangeError(`Hud ScoreBar has no source team frame for: ${team}`);
  }
  // Hud.setScoreBar(): scorebar1 uses team + (team == 0 ? 1 : 2), while
  // scorebar2 uses team + 2. The distinction matters for FFA's neutral slot.
  return primary ? team + (team === 0 ? 1 : 2) : team + 2;
}

function sourceScorebar({ team, score, scoreLimit, primary, placement }) {
  if (!Number.isFinite(score)) throw new TypeError('Hud ScoreBar score must be finite');
  const frame = sourceFrameFor(team, primary);
  const width = score / scoreLimit * 125;
  const bar = Object.freeze({
    source: `./public/assets/original-swf/hud-scorebar-bar-1449-frame${frame}.png`,
    sourceBounds: SOURCE_SCOREBAR.bar.sourceBounds,
    x: SOURCE_SCOREBAR.bar.x,
    y: SOURCE_SCOREBAR.bar.y,
    width,
    scaleX: width / SOURCE_SCOREBAR.bar.sourceBounds.width,
  });
  return Object.freeze({
    depth: placement.depth,
    matrix: placement.matrix,
    background: SOURCE_SCOREBAR.background,
    mask: SOURCE_SCOREBAR.mask,
    bar,
    fade: Object.freeze({
      source: `./public/assets/original-swf/hud-scorebar-fade-1454-frame${frame}.png`,
      sourceBounds: SOURCE_SCOREBAR.fade.sourceBounds,
      x: SOURCE_SCOREBAR.fade.x,
      y: SOURCE_SCOREBAR.fade.y,
    }),
    cap: Object.freeze({
      source: SOURCE_SCOREBAR.cap.source,
      sourceBounds: SOURCE_SCOREBAR.cap.sourceBounds,
      x: SOURCE_SCOREBAR.bar.x + width,
      y: SOURCE_SCOREBAR.cap.y,
    }),
    edge: SOURCE_SCOREBAR.edge,
  });
}

// Pure source plan for Hud.setScoreBar(). It is intentionally not a generic
// progress-bar API: its child ids, clip depth, frame choices, Flash width
// semantics and text formatting are all fixed by symbol 1462/Hud.as.
export function getHudScorebarRenderPlan({ mode, team1, score1, team2, score2, scoreLimit }) {
  if (!Number.isFinite(scoreLimit) || scoreLimit <= 0) {
    throw new RangeError('Hud ScoreBar requires a positive source score limit');
  }
  const modeName = SCOREBAR_MODE_NAMES[mode];
  if (!modeName) throw new RangeError(`Hud ScoreBar has no decoded source mode: ${mode}`);
  return Object.freeze({
    holder: SOURCE_SCOREBAR.holder,
    scorebar1: sourceScorebar({ team: team1, score: score1, scoreLimit, primary: true, placement: SOURCE_SCOREBAR.scorebar1 }),
    scorebar2: sourceScorebar({ team: team2, score: score2, scoreLimit, primary: false, placement: SOURCE_SCOREBAR.scorebar2 }),
    text: Object.freeze({
      mode: Object.freeze({ text: modeName, matrix: SOURCE_SCOREBAR.text.mode.matrix }),
      score1: Object.freeze({ text: `> ${score1}`, matrix: SOURCE_SCOREBAR.text.score1.matrix }),
      score2: Object.freeze({ text: `${score2}`, matrix: SOURCE_SCOREBAR.text.score2.matrix }),
    }),
  });
}
