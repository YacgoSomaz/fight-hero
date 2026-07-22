import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractGunDefinitions } from '../private-assets/parse-stats-guns.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'assets/reverse/ffdec-deep-20260720/scripts/Stats_Guns.as');
const outputPath = resolve(root, 'src/gun-source.mjs');
const source = readFileSync(sourcePath, 'utf8');
const guns = extractGunDefinitions(source);

writeFileSync(outputPath, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Guns.as.\n// Regenerate with: npm run generate:guns\nexport const SOURCE_GUNS = Object.freeze(${JSON.stringify(guns, null, 2)});\n`);
