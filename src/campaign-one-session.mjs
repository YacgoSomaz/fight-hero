import { ARENA_SOURCE_LAYOUTS } from './arena-source-layouts.mjs';
import { SOURCE_CAMPAIGN_CATALOG } from './campaign-source.mjs';
import { createCampaignOneRuntime } from './campaign-one-runtime.mjs';

function sourceActor(id, definition) {
  const spawn = definition.extra?.spawn ?? null;
  return {
    id: `unit${id}`,
    team: definition.team,
    name: definition.name,
    soldier: definition.soldier,
    skin: definition.skin,
    primary: definition.primary,
    secondary: definition.secondary,
    skill: definition.skill,
    streak: definition.streak,
    difficulty: definition.difficulty,
    spawned: !definition.extra?.noSpawn,
    spawn: spawn ? { ...spawn } : null,
    noAim: Boolean(definition.extra?.noAim),
    definition,
  };
}

// This is intentionally a source session model, not a quick-match World.
// It carries the exact Stats_Campaign actor records forward until Tutorial's
// own wall mask, Unit implementation, and HUD/cutscene consumers are ready.
export function createCampaignOneSession() {
  const definition = SOURCE_CAMPAIGN_CATALOG.campaign[0];
  const arena = ARENA_SOURCE_LAYOUTS[definition.map];
  if (!arena) throw new Error(`Campaign 1 Arena source is unavailable: ${definition.map}`);
  return {
    definition,
    map: { id: definition.map, wallCharacter: arena.wallCharacter, nodes: arena.nodes },
    runtime: createCampaignOneRuntime(),
    actors: [sourceActor(0, definition.player), ...definition.bots.map((actor, index) => sourceActor(index + 1, actor))],
  };
}
