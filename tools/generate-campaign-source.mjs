import { readFileSync, writeFileSync } from 'node:fs';
import { extractCampaignDefinitions } from '../private-assets/parse-stats-campaign.mjs';
import { extractCampaignOneScript } from '../private-assets/parse-campaign-one-script.mjs';

const sourceUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url);
const outputUrl = new URL('../src/campaign-source.mjs', import.meta.url);
const campaignOneOutputUrl = new URL('../src/campaign-one-script-source.mjs', import.meta.url);
const unitUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Unit.as', import.meta.url);
const bulletUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Bullet.as', import.meta.url);
const playerUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Player.as', import.meta.url);
const campaign = readFileSync(sourceUrl, 'utf8');
const catalog = extractCampaignDefinitions(campaign);
const serialized = JSON.stringify(catalog, null, 2);
const campaignOneScript = extractCampaignOneScript({
  campaign,
  unit: readFileSync(unitUrl, 'utf8'),
  bullet: readFileSync(bulletUrl, 'utf8'),
  player: readFileSync(playerUrl, 'utf8'),
});
const campaignOneSerialized = JSON.stringify(campaignOneScript, null, 2);

writeFileSync(outputUrl, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CAMPAIGN_CATALOG = Object.freeze(${serialized});\n`, 'utf8');
writeFileSync(campaignOneOutputUrl, `// GENERATED from decoded Campaign 1 ActionScript: Stats_Campaign, Unit, Bullet, and Player.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CAMPAIGN_ONE_SCRIPT = Object.freeze(${campaignOneSerialized});\n`, 'utf8');
