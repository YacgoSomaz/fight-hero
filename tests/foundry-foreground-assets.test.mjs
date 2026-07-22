import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { FOUNDRY_FOREGROUND_SOURCE } from '../src/foundry-foreground-source.mjs';
import { extractFoundryForegroundDisplayList } from '../tools/parse-foundry-foreground.mjs';

const root = new URL('../', import.meta.url);

async function pngSize(source) {
  const bytes = await readFile(new URL(source.slice(2), root));
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${source} must be PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test('ships all direct original Foundry foreground child frames for a fresh clone', async () => {
  const expected = [
    { character: 1242, frames: 1, directory: './public/assets/original-swf/foundry-foreground-1242', size: { width: 3102, height: 947 } },
    { character: 1252, frames: 76, directory: './public/assets/original-swf/foundry-foreground-1252', size: { width: 313, height: 98 } },
    { character: 1258, frames: 306, directory: './public/assets/original-swf/foundry-foreground-1258', size: { width: 665, height: 1019 } },
  ];

  for (const layer of expected) {
    const files = await readdir(new URL(`${layer.directory.slice(2)}/`, root));
    const frames = files.filter((file) => /^\d+\.png$/.test(file)).map((file) => Number(file.slice(0, -4))).sort((a, b) => a - b);
    assert.deepEqual(frames, Array.from({ length: layer.frames }, (_, index) => index + 1), `source ${layer.character} frame sequence`);
    assert.deepEqual(await pngSize(`${layer.directory}/1.png`), layer.size, `source ${layer.character} frame 1 dimensions`);
    assert.deepEqual(await pngSize(`${layer.directory}/${layer.frames}.png`), layer.size, `source ${layer.character} last-frame dimensions`);
  }
});

test('runtime Foundry source record is exactly the original child Display List plus direct exported frames', () => {
  const extracted = extractFoundryForegroundDisplayList();
  assert.deepEqual(
    FOUNDRY_FOREGROUND_SOURCE.layers.map(({ source, width, height, ...layer }) => layer),
    extracted.layers,
  );
  assert.deepEqual(FOUNDRY_FOREGROUND_SOURCE.layers.map(({ source, width, height }) => ({ source, width, height })), [
    { source: './public/assets/original-swf/foundry-foreground-1242', width: 3102, height: 947 },
    { source: './public/assets/original-swf/foundry-foreground-1252', width: 313, height: 98 },
    { source: './public/assets/original-swf/foundry-foreground-1258', width: 665, height: 1019 },
  ]);
});
