import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { FOUNDRY_FOREGROUND_SVG_SOURCE } from '../src/foundry-foreground-svg-source.mjs';

const root = new URL('../', import.meta.url);

async function svgRoot(source) {
  const svg = await readFile(new URL(source.slice(2), root), 'utf8');
  const viewport = svg.match(/<svg[^>]*height="([\d.]+)px"[^>]*width="([\d.]+)px"/);
  const registration = svg.match(/<g transform="matrix\(1\.0, 0\.0, 0\.0, 1\.0, ([\d.]+), ([\d.]+)\)"/);
  assert.ok(viewport && registration, `${source} must retain FFDec's direct SVG root geometry`);
  return {
    width: Number(viewport[2]), height: Number(viewport[1]),
    x: -Number(registration[1]), y: -Number(registration[2]),
  };
}

test('ships direct original SVG timelines with stable FFDec viewports and source registration', async () => {
  const expected = [
    { character: 1252, frames: 76, source: './public/assets/original-swf/foundry-foreground-1252-svg', viewport: { width: 312.15, height: 97.35, x: -2.25, y: -59.35 } },
    { character: 1258, frames: 306, source: './public/assets/original-swf/foundry-foreground-1258-svg', viewport: { width: 550.95, height: 904.35, x: -15.4, y: -55 } },
  ];

  assert.deepEqual(FOUNDRY_FOREGROUND_SVG_SOURCE, expected);
  for (const layer of expected) {
    const files = await readdir(new URL(`${layer.source.slice(2)}/`, root));
    const frames = files.filter((file) => /^\d+\.svg$/.test(file)).map((file) => Number(file.slice(0, -4))).sort((a, b) => a - b);
    assert.deepEqual(frames, Array.from({ length: layer.frames }, (_, index) => index + 1), `SVG ${layer.character} complete timeline`);
    assert.deepEqual(await svgRoot(`${layer.source}/1.svg`), layer.viewport, `SVG ${layer.character} first frame`);
    assert.deepEqual(await svgRoot(`${layer.source}/${layer.frames}.svg`), layer.viewport, `SVG ${layer.character} last frame`);
  }
});
