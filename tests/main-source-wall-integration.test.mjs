import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('browser entrypoint uses the atomic source wall path for every map, not a Foundry-only private asset', async () => {
  const source = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');
  assert.match(source, /import \{ loadSourceWallMask \} from '\.\/source-wall-loader\.mjs';/);
  assert.match(source, /import \{ prepareSourceMapWorld \} from '\.\/source-map-world\.mjs';/);
  assert.match(source, /await prepareSourceMapWorld\(/);
  assert.doesNotMatch(source, /assets\/reverse\/foundry-wall/);
  assert.doesNotMatch(source, /foundryWallMask/);
  assert.doesNotMatch(source, /foundryWall\.addEventListener/);
});
