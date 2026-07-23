import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const CHROME_IDS = [1482, 1483, 1484];
const PORTRAIT_IDS = Array.from({ length: 34 }, (_, index) => 632 + index);

if (process.argv[1] && new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href === import.meta.url) {
  const [shapesRoot, outputRoot] = process.argv.slice(2);
  if (!shapesRoot || !outputRoot) {
    throw new Error('usage: node tools/copy-tutorial-speak-source-assets.mjs <ffdec-shapes-dir> <public-output-dir>');
  }
  mkdirSync(join(outputRoot, 'head'), { recursive: true });
  for (const id of CHROME_IDS) copyFileSync(join(shapesRoot, `${id}.svg`), join(outputRoot, `${id}.svg`));
  for (const id of PORTRAIT_IDS) copyFileSync(join(shapesRoot, `${id}.svg`), join(outputRoot, 'head', `${id}.svg`));
  const fontsRoot = join(dirname(shapesRoot), 'fonts');
  copyFileSync(join(fontsRoot, '1485_QTypeSquare-Medium.ttf'), join(outputRoot, 'font-1485.ttf'));
  copyFileSync(join(fontsRoot, '800_QTypeSquare-Book_10pt_st.ttf'), join(outputRoot, 'font-800.ttf'));
}
