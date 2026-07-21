// User journey: a successor can regenerate a compact, source-backed runtime
// dependency index instead of relying on an undocumented manual reading.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildRelationIndex, parseAs3Class } from '../private-assets/parse-as3-relations.mjs';

test('parses a class declaration, typed fields, constructions and static calls', () => {
  const relation = parseAs3Class(`
    public class Demo extends Sprite {
      public var arena:Arena;
      public function init():void { this.arena = new Arena(this); Stats_Guns.Init(); }
    }
  `, 'Demo.as');

  assert.deepEqual(relation, {
    file: 'Demo.as',
    className: 'Demo',
    extends: 'Sprite',
    typedFields: ['Arena'],
    constructs: ['Arena'],
    staticCalls: ['Stats_Guns.Init']
  });
});

test('indexes the original combat runtime into its direct source relationships', async () => {
  const root = new URL('../assets/reverse/ffdec-deep-20260720/scripts/', import.meta.url);
  const names = ['Main.as', 'Game.as', 'Arena.as', 'Unit.as', 'Guns.as', 'Movement.as', 'Status.as', 'PhysWorld.as'];
  const sources = await Promise.all(names.map(async name => ({
    name,
    source: await readFile(new URL(name, root), 'utf8')
  })));
  const index = buildRelationIndex(sources);

  assert.equal(index.classes.Game.extends, 'Sprite');
  assert.ok(index.classes.Game.constructs.includes('Arena'));
  assert.ok(index.classes.Unit.typedFields.includes('Guns'));
  assert.ok(index.classes.Guns.constructs.includes('Bullet'));
  assert.ok(index.classes.PhysWorld.constructs.includes('PhysActor'));
  assert.ok(index.edges.some(edge => edge.from === 'Game' && edge.to === 'Arena' && edge.kind === 'constructs'));
});
