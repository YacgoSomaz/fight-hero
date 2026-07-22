import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('browser entrypoint replaces Foundry flattened terrain with the original source Display List and applies the same-tick wall mask', async () => {
  const source = await readFile(new URL('../src/main.mjs', import.meta.url), 'utf8');

  assert.match(source, /import \{ getFoundryForegroundRuntimePlan \} from '\.\/foundry-foreground-runtime\.mjs';/);
  assert.match(source, /import \{ createFoundryForegroundDomLayer, renderFoundryForegroundDomLayer \} from '\.\/foundry-foreground-dom\.mjs';/);
  assert.match(source, /import \{ advanceFoundryWorldTimeline, createFoundryWorldTimeline \} from '\.\/foundry-world-timeline\.mjs';/);
  assert.match(source, /commitMapLayers\(prepared\.layers, prepared\.mapId\)/);
  assert.match(source, /getFoundryForegroundRuntimePlan\(\{\s*mapId: foundryWorldTimeline\.mapId,/);
  assert.match(source, /renderFoundryForegroundDomLayer\(foundryForeground, plan\.layers\)/);
  assert.match(source, /advanceFoundryWorldTimeline\(foundryWorldTimeline, world\.wallFrames, ticks\)/);
  assert.match(source, /world\.wall = next\.wall/);
});
