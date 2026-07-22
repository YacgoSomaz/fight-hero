import test from 'node:test';
import assert from 'node:assert/strict';
import { getOriginalAimerRig } from '../src/aimer-rig.mjs';

const ROOT = new URL('../', import.meta.url);

// User journey: while aiming, the player sees the four original SWF tick marks
// and original circle expand from the exact Player.as recoil calculation.
test('normal Aimer places its extracted line and circle symbols with the original Display List matrices', () => {
  const rig = getOriginalAimerRig({
    pointer: { x: 100, y: 200 },
    arm: { x: 97, y: 196 },
    dynRecoilMod: 90,
  });
  const spread = Math.sqrt(50);

  assert.equal(rig.spread, spread);
  assert.deepEqual(rig.parts, [
    { name: 'line1', source: './public/assets/original-swf/aimer-line-1424.png', x: 100.05, y: 199.9 - spread, width: 1.5, height: 5.95, origin: { x: 0.75, y: 5.2 }, matrix: [1, 0, 0, 1] },
    { name: 'line2', source: './public/assets/original-swf/aimer-line-1424.png', x: 100.1 + spread, y: 200.15, width: 1.5, height: 5.95, origin: { x: 0.75, y: 5.2 }, matrix: [0, 1, -1, 0] },
    { name: 'line3', source: './public/assets/original-swf/aimer-line-1424.png', x: 99.85, y: 200.2 + spread, width: 1.5, height: 5.95, origin: { x: 0.75, y: 5.2 }, matrix: [-1, 0, 0, -1] },
    { name: 'line4', source: './public/assets/original-swf/aimer-line-1424.png', x: 99.8 - spread, y: 199.95, width: 1.5, height: 5.95, origin: { x: 0.75, y: 5.2 }, matrix: [0, -1, 1, 0] },
    { name: 'circle', source: './public/assets/original-swf/aimer-circle-1428-frame1.png', x: 100.15 - spread, y: 200.05 - spread, width: spread * 2, height: spread * 2, origin: { x: 20, y: 20 }, matrix: [1, 0, 0, 1] },
  ]);
});

test('zero original recoil keeps all marks at the pointer and collapses only the source circle', () => {
  const rig = getOriginalAimerRig({ pointer: { x: 18, y: 27 }, arm: { x: 18, y: 27 }, dynRecoilMod: 0 });

  assert.equal(rig.spread, 0);
  assert.equal(rig.parts[0].y, 26.9);
  assert.equal(rig.parts[1].x, 18.1);
  assert.equal(rig.parts[4].width, 0);
  assert.equal(rig.parts[4].height, 0);
});

test('the dynamic Aimer uses directly extracted original source files, not a generated drawing', async () => {
  const { access } = await import('node:fs/promises');
  await access(new URL('public/assets/original-swf/aimer-line-1424.png', ROOT));
  await access(new URL('public/assets/original-swf/aimer-circle-1428-frame1.png', ROOT));
});
