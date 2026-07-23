// This is a provenance/query manifest, not a runtime asset loader.  The
// archives remain outside the public web build because source material must
// not be shipped merely to run the local reconstruction.
export const ORIGINAL_SOURCE_BASELINE = Object.freeze({
  swf: Object.freeze({
    file: '4399-90433-war-heroes-original.swf',
    sha256: 'BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29',
    sizeBytes: 16688824,
  }),
  archives: Object.freeze({
    ffdec: Object.freeze({ file: 'war_heroes_4399_ffdec_extracted.zip', entries: 2259 }),
    rabcdasm: Object.freeze({ file: 'war_heroes_4399_rabcdasm.zip', entries: 1079 }),
    timeline: Object.freeze({ file: 'swf-structure.xml', bytes: 139328467 }),
  }),
});

const LOGIC_MODULES = new Set([
  'AI', 'Arena', 'Bullet', 'Game', 'Guns', 'Holder_Gun', 'Hud', 'Main',
  'MatchSettings', 'Menu', 'Movement', 'Player', 'Stats_Maps', 'Unit',
]);

export function getOriginalEvidenceRoute({ module, symbolId, purpose, ambiguous = false } = {}) {
  if (purpose === 'display-list') {
    if (!Number.isInteger(symbolId) || symbolId < 1) throw new TypeError('display-list evidence requires a positive original symbol id');
    return [
      `swf-structure.xml#DefineSpriteTag:${symbolId}`,
      `extracted/sprites/DefineSprite_${symbolId}`,
    ];
  }
  if (purpose !== 'logic' || !LOGIC_MODULES.has(module)) {
    throw new TypeError(`unsupported original evidence module: ${module ?? symbolId ?? 'unknown'}`);
  }
  const route = [
    `extracted/scripts/${module}.as`,
    `existing-ffdec-pcode/${module}.as`,
  ];
  if (ambiguous) route.push(`rabcdasm/war-heroes-4399-0/${module}.class.asasm`);
  return route;
}
