import { readFileSync, writeFileSync } from 'node:fs';

import { extractTutorialSpeakTimeline } from './extract-tutorial-environment-timeline.mjs';

if (process.argv[1] && new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href === import.meta.url) {
  const [sourcePath, outputPath] = process.argv.slice(2);
  if (!sourcePath || !outputPath) {
    throw new Error('usage: node tools/extract-tutorial-speak-timeline.mjs <source.swf> <output.json>');
  }
  writeFileSync(outputPath, `${JSON.stringify(extractTutorialSpeakTimeline(readFileSync(sourcePath)))}\n`);
}
