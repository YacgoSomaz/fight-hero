import { applyTutorialStatusDamage } from './tutorial-status-damage-runtime.mjs';
import { applyTutorialCorpseHit } from './tutorial-corpse-runtime.mjs';

function result({ applied = false, reason = null, damage = 0, died = false, events = [], extra = {} } = {}) {
  return { applied, reason, damage, died, events, extra };
}

// Narrow port of Bullet.doHitEffect() for the decoded Tutorial USP2 line
// bullet after hitTestAll() has selected a live Unit. The source supports
// bounce/reflect bullet spawning; those branches are intentionally surfaced
// as unsupported rather than turning them into ordinary damage.
export function applyTutorialLineBulletHit({ trace, shooter, bulletExtra = {}, random = Math.random } = {}) {
  const hit = trace?.hit;
  const extra = { ...bulletExtra, ...(hit?.extra ?? {}) };
  const gun = shooter?.gun?.curGun;
  if (hit?.type !== 'unit' && hit?.type !== 'corpse') return result({ reason: 'non-unit', extra });
  if (!gun || gun.id !== trace.gunId) throw new Error('Tutorial Bullet.doHitEffect requires the source shooter current gun');
  if (gun.extra.bounceShots) throw new Error(`Tutorial Bullet.doHitEffect bounceShots is not yet migrated: ${gun.id}`);
  if (hit.type === 'corpse') {
    const corpseOutcome = applyTutorialCorpseHit({ corpse: hit.target, attacker: shooter, gun, extra, random });
    return result({ applied: true, reason: 'corpse', events: [{ type: 'hitCorpse', force: corpseOutcome.force }], extra });
  }
  const target = hit.target;
  if (!target?.status) throw new Error('Tutorial Bullet.doHitEffect requires the target source Status');
  if (target.status.sReflect) return result({ reason: 'reflect', extra });
  if (target.gun?.reflecting) throw new Error('Tutorial Bullet.doHitEffect gun reflecting is not yet migrated');
  const dmgMod = extra.dmgMod ? Number(extra.dmgMod) : 1;
  const outcome = applyTutorialStatusDamage(target, shooter, gun, extra, gun.damage * dmgMod, { random });
  return { ...outcome, extra };
}
