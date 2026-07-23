import { readFileSync, writeFileSync } from 'node:fs';

import { extractTutorialSpeakPortraitTimeline } from './extract-tutorial-environment-timeline.mjs';

if (process.argv[1] && new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href === import.meta.url) {
  const [sourcePath, outputPath] = process.argv.slice(2);
  if (!sourcePath || !outputPath) {
    throw new Error('usage: node tools/extract-tutorial-speak-portrait-timeline.mjs <source.swf> <output.json>');
  }
  writeFileSync(outputPath, `${JSON.stringify(extractTutorialSpeakPortraitTimeline(readFileSync(sourcePath)))}\n`);
}
