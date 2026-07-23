import assert from 'node:assert/strict';
import test from 'node:test';

import { ORIGINAL_SOURCE_BASELINE, getOriginalEvidenceRoute } from '../src/original-source-baseline.mjs';

test('the 4399 original package is the canonical bytecode and timeline evidence baseline', () => {
  assert.equal(ORIGINAL_SOURCE_BASELINE.swf.sha256, 'BDC9216EDD31D8CF2B231182C7203655CFEF9A71F497E5708F9A649D8A40BD29');
  assert.equal(ORIGINAL_SOURCE_BASELINE.swf.sizeBytes, 16688824);
  assert.deepEqual(ORIGINAL_SOURCE_BASELINE.archives, {
    ffdec: { file: 'war_heroes_4399_ffdec_extracted.zip', entries: 2259 },
    rabcdasm: { file: 'war_heroes_4399_rabcdasm.zip', entries: 1079 },
    timeline: { file: 'swf-structure.xml', bytes: 139328467 },
  });
});

test('ambiguous gameplay logic escalates from AS3 to P-code then original ASASM', () => {
  assert.deepEqual(getOriginalEvidenceRoute({ module: 'AI', purpose: 'logic', ambiguous: true }), [
    'extracted/scripts/AI.as',
    'existing-ffdec-pcode/AI.as',
    'rabcdasm/war-heroes-4399-0/AI.class.asasm',
  ]);
  assert.deepEqual(getOriginalEvidenceRoute({ module: 'Unit', purpose: 'logic', ambiguous: false }), [
    'extracted/scripts/Unit.as',
    'existing-ffdec-pcode/Unit.as',
  ]);
});

test('display-list and asset work consult the original structure XML before export crops', () => {
  assert.deepEqual(getOriginalEvidenceRoute({ symbolId: 1378, purpose: 'display-list' }), [
    'swf-structure.xml#DefineSpriteTag:1378',
    'extracted/sprites/DefineSprite_1378',
  ]);
  assert.throws(() => getOriginalEvidenceRoute({ module: 'Unknown', purpose: 'logic' }), /unsupported original evidence module/i);
});
