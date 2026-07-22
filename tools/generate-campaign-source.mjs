import { readFileSync, writeFileSync } from 'node:fs';
import { extractCampaignDefinitions } from '../private-assets/parse-stats-campaign.mjs';

const sourceUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url);
const outputUrl = new URL('../src/campaign-source.mjs', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const catalog = extractCampaignDefinitions(source);
const serialized = JSON.stringify(catalog, null, 2);

writeFileSync(outputUrl, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CAMPAIGN_CATALOG = Object.freeze(${serialized});\n`, 'utf8');
