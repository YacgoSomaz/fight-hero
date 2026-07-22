import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractGunDefinitions } from '../private-assets/parse-stats-guns.mjs';
import { SOURCE_GUNS } from '../src/gun-source.mjs';

test('browser gun source is a direct generated copy of every original Stats_Guns.addGun definition', () => {
  const source = readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Guns.as', import.meta.url), 'utf8');
  assert.deepEqual(SOURCE_GUNS, extractGunDefinitions(source));
  assert.deepEqual(SOURCE_GUNS.find(({ id }) => id === 'USP2'), {
    type: 5, id: 'USP2', sprite: 'USP', name: 'USP', typeName: 'Pistol', levelRequired: 1,
    damage: 15, force: 3, splash: 0, clipSize: 15, clipSpare: 3, range: 66, recoil: 3,
    autoFire: false, shootDelay: 0.25, xOffset: 8, yOffset: -8,
    effect: { shoot: 'smoke', hit: 'bulletspark', shell: 'pistol', hudBullet: 'pistol' },
    animation: { idle: 'pistol', fire: 'pistol', reload: 'pistol' },
    shotSound: 'S_pistolFire', hitSound: null, bulletClass: 'Bullet_Line_Basic',
    parameters: [true, 3.5, 16777156, 0.3, 1.5, 16777156, 0.6], extra: { noAmmo: true }, description: '',
  });
});
