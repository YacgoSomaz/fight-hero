import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGunDefinitions } from '../private-assets/parse-stats-guns.mjs';

test('extracts a complete addGun definition without confusing nested arrays or objects', () => {
  const source = `
    addGun(1,"M4","","","Assault Rifle",0,1,10,3,0.1,0,0,30,3,60,4,true,0.15,10,-1,
      "gas_small","bulletspark","pistol","arifle","rifle","rifle","rifle",
      S_ar2,null,Bullet_Line_Basic,[true,3.5,16777156,0.3],{"vision":0.5,"extraShots":2},"demo");
  `;

  const [m4] = extractGunDefinitions(source);

  assert.deepEqual(m4, {
    type: 1,
    id: 'M4',
    sprite: 'M4',
    name: 'M4',
    typeName: 'Assault Rifle',
    levelRequired: 1,
    damage: 10,
    force: 3,
    splash: 0,
    clipSize: 30,
    clipSpare: 3,
    range: 60,
    recoil: 4,
    autoFire: true,
    shootDelay: 0.15,
    xOffset: 10,
    yOffset: -1,
    effect: { shoot: 'gas_small', hit: 'bulletspark', shell: 'pistol', hudBullet: 'arifle' },
    animation: { idle: 'rifle', fire: 'rifle', reload: 'rifle' },
    shotSound: 'S_ar2',
    hitSound: null,
    bulletClass: 'Bullet_Line_Basic',
    parameters: [true, 3.5, 16777156, 0.3],
    extra: { vision: 0.5, extraShots: 2 },
    description: 'demo',
  });
});

test('ignores the addGun function declaration and retains quoted apostrophes', () => {
  const source = `
    public static function addGun(param1:uint, param2:String) : void {}
    addGun(2,"Nine Iron","","","Melee",0,20,110,100,0.3,0,0,0,0,8,2,false,0.5,6,0,
      "","","","rocket","sword","sword","sword",S_Whip2,S_Blunt2,Bullet_Melee_Basic,[],
      {"noAmmo":true},"Knock \\\'em out of the park!");
  `;

  const [iron] = extractGunDefinitions(source);

  assert.equal(iron.id, 'Nine Iron');
  assert.equal(iron.bulletClass, 'Bullet_Melee_Basic');
  assert.deepEqual(iron.extra, { noAmmo: true });
  assert.equal(iron.description, "Knock 'em out of the park!");
});
