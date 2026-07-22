import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSkillDefinitions } from '../private-assets/parse-stats-skills.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'assets/reverse/ffdec-deep-20260720/scripts/Stats_Skills.as');
const outputPath = resolve(root, 'src/skill-source.mjs');
const skills = extractSkillDefinitions(readFileSync(sourcePath, 'utf8'));

writeFileSync(outputPath, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Skills.as.\n// Regenerate with: npm run generate:skills\nexport const SOURCE_SKILLS = Object.freeze(${JSON.stringify(skills, null, 2)});\n`);
