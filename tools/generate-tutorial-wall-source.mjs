import { readFileSync, writeFileSync } from 'node:fs';

const auditUrl = new URL('../private-assets/wall-tut-colour-audit.json', import.meta.url);
const sourceDirectory = new URL('../private-assets/wall-tut-export/DefineSprite_1378_MBFZ_fla.Wall_tut_240/', import.meta.url);
const outputUrl = new URL('../src/tutorial-wall-source.mjs', import.meta.url);
const audit = JSON.parse(readFileSync(auditUrl, 'utf8'));

function dimensions(file) {
  const data = readFileSync(file);
  if (data.toString('ascii', 1, 4) !== 'PNG') throw new Error(`Expected PNG: ${file}`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

const frames = [];
for (let frame = 1; frame <= 16; frame += 1) {
  const file = new URL(`${frame}.png`, sourceDirectory);
  const { width, height } = dimensions(file);
  const colourAudit = audit[frame];
  if (!colourAudit) throw new Error(`Missing Wall_tut colour audit for frame ${frame}`);
  frames.push({ frame, width, height, file: `./public/assets/original-swf/wall-tut-1378/${frame}.png`, colourAudit });
}

writeFileSync(outputUrl, `// GENERATED from FFDec symbol 1378 Wall_tut PNG frames and colour audit.\n// Regenerate after running private-assets/analyze-wall-tut.py with: npm run generate:tutorial-wall\nexport const TUTORIAL_WALL_SOURCE = Object.freeze({\n  characterId: 1378,\n  frames: Object.freeze(${JSON.stringify(frames, null, 2)}),\n});\n`, 'utf8');
