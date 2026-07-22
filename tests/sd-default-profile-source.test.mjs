import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractDefaultClassSaves } from '../private-assets/parse-sd-default-profiles.mjs';

test('extracts the four literal first-run class saves from original SD.Init()', () => {
  const source = fs.readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/SD.as', import.meta.url), 'utf8');

  assert.deepEqual(extractDefaultClassSaves(source), [
    { skin: 1, primary: 'M4', secondary: 'USP', skill: 'none', streak: 'none', level: 1, exp: 0, funds: 0 },
    { skin: 1, primary: 'Scout', secondary: 'USP', skill: 'none', streak: 'none', level: 1, exp: 0, funds: 0 },
    { skin: 1, primary: 'Saw', secondary: 'USP', skill: 'none', streak: 'none', level: 1, exp: 0, funds: 0 },
    { skin: 1, primary: 'M3', secondary: 'USP', skill: 'none', streak: 'none', level: 1, exp: 0, funds: 0 },
  ]);
});
