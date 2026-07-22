import { readFileSync, writeFileSync } from 'node:fs';
import { extractCampaignDefinitions } from '../private-assets/parse-stats-campaign.mjs';
import { extractCampaignOneScript } from '../private-assets/parse-campaign-one-script.mjs';
import { extractClassDefinitions } from '../private-assets/parse-stats-classes.mjs';
import { extractDefaultClassSaves } from '../private-assets/parse-sd-default-profiles.mjs';

const sourceUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as', import.meta.url);
const outputUrl = new URL('../src/campaign-source.mjs', import.meta.url);
const campaignOneOutputUrl = new URL('../src/campaign-one-script-source.mjs', import.meta.url);
const unitUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Unit.as', import.meta.url);
const bulletUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Bullet.as', import.meta.url);
const playerUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Player.as', import.meta.url);
const classesUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Classes.as', import.meta.url);
const classOutputUrl = new URL('../src/class-source.mjs', import.meta.url);
const sdUrl = new URL('../assets/reverse/ffdec-deep-20260720/scripts/SD.as', import.meta.url);
const sdOutputUrl = new URL('../src/sd-default-profile-source.mjs', import.meta.url);
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
const classProfiles = extractClassDefinitions(readFileSync(classesUrl, 'utf8')).map(({ atLevel, ...profile }) => profile);
const classSerialized = JSON.stringify(classProfiles, null, 2);
const defaultClassSaves = extractDefaultClassSaves(readFileSync(sdUrl, 'utf8'));
const defaultClassSavesSerialized = JSON.stringify([0, ...defaultClassSaves], null, 2);

writeFileSync(outputUrl, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Campaign.as.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CAMPAIGN_CATALOG = Object.freeze(${serialized});\n`, 'utf8');
writeFileSync(campaignOneOutputUrl, `// GENERATED from decoded Campaign 1 ActionScript: Stats_Campaign, Unit, Bullet, and Player.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CAMPAIGN_ONE_SCRIPT = Object.freeze(${campaignOneSerialized});\n`, 'utf8');
writeFileSync(classOutputUrl, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/Stats_Classes.as.\n// Regenerate with: npm run extract:campaign\nexport const SOURCE_CLASS_PROFILES = Object.freeze(${classSerialized});\n`, 'utf8');
writeFileSync(sdOutputUrl, `// GENERATED from assets/reverse/ffdec-deep-20260720/scripts/SD.as.\n// Regenerate with: npm run extract:campaign\n// Index zero is the original ActionScript \`classSaves = [0]\` sentinel.\nexport const SOURCE_DEFAULT_CLASS_SAVES = Object.freeze(${defaultClassSavesSerialized});\n`, 'utf8');
