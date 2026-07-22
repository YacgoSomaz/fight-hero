import { SOURCE_CLASS_PROFILES } from './class-source.mjs';

const PROFILE_BY_ID = new Map(SOURCE_CLASS_PROFILES.map((profile) => [profile.id, profile]));

function bindSourceActor(actor, index) {
  const profile = PROFILE_BY_ID.get(actor.soldier);
  if (!profile) throw new Error(`Tutorial actor ${actor.id} has no decoded source class profile: ${actor.soldier}`);
  return {
    id: actor.id,
    human: index === 0,
    name: actor.name,
    team: actor.team,
    soldier: actor.soldier,
    skin: actor.skin,
    unitFrame: profile.startFrame + actor.skin,
    runType: profile.runType,
    className: profile.name,
    classProfile: profile,
    // Campaign 1 only supplies AI difficulty. Player level belongs to the
    // original saved class profile, so retaining null is more faithful than
    // borrowing the prototype's level-one Medic numbers.
    level: index === 0 ? null : null,
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
