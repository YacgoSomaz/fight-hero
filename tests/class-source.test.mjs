import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractClassDefinitions } from '../private-assets/parse-stats-classes.mjs';
import { SOURCE_CLASS_PROFILES } from '../src/class-source.mjs';

test('browser class profiles exactly follow the decoded Stats_Classes source', () => {
  const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Classes.as', import.meta.url), 'utf8');
  const extracted = extractClassDefinitions(source).map(({ atLevel, ...profile }) => profile);
  assert.deepEqual(SOURCE_CLASS_PROFILES, extracted);
});
