import { SOURCE_CLASS_PROFILES } from './class-source.mjs';
import { createTutorialPlayerProfile } from './tutorial-player-profile.mjs';

const PROFILE_BY_ID = new Map(SOURCE_CLASS_PROFILES.map((profile) => [profile.id, profile]));

function bindSourceActor(actor, index) {
  const profile = PROFILE_BY_ID.get(actor.soldier);
  const sourcePlayerProfile = index === 0 ? createTutorialPlayerProfile(actor) : null;
  if (!profile) throw new Error(`Tutorial actor ${actor.id} has no decoded source class profile: ${actor.soldier}`);
  return {
    id: actor.id,
    human: index === 0,
    name: actor.name,
    team: actor.team,
    soldier: actor.soldier,
    skin: actor.skin,
    // UnitMC.setSkin() sends this value to head/body/limb child MovieClips.
    // It must never be used as a UnitMC root timeline image/frame number.
    skinFrame: profile.startFrame + actor.skin,
    runType: profile.runType,
    className: profile.name,
    classProfile: profile,
    // MatchSettings.updatePlayer() reads this from SD.classSaves before
    // Unit.setClass() resolves class stats.  The player adapter uses SD.Init
    // only for a first-run save; imported original saves can replace it.
    level: sourcePlayerProfile?.level ?? null,
    sourcePlayerProfile,
    difficulty: actor.difficulty,
    spawned: actor.spawned,
    position: actor.position ? { ...actor.position } : null,
    noAim: actor.noAim,
    noJump: actor.noJump,
    guns: { ...actor.guns },
  };
}

// Pure source adapter.  Rendering/physics must consume these bindings later;
// this module intentionally never creates a generic quick-match actor.
export function createTutorialActorBindings(session) {
  return { actors: session.actors.map(bindSourceActor) };
}
