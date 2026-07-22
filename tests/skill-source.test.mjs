import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractSkillDefinitions } from '../private-assets/parse-stats-skills.mjs';
import { SOURCE_SKILLS } from '../src/skill-source.mjs';

test('browser skill source is a direct generated copy of every original Stats_Skills.addSkill definition', () => {
  const source = readFileSync(new URL('../assets/reverse/ffdec-deep-20260720/scripts/Stats_Skills.as', import.meta.url), 'utf8');
  assert.deepEqual(SOURCE_SKILLS, extractSkillDefinitions(source));
  assert.equal(SOURCE_SKILLS.length, 22);
  assert.deepEqual(SOURCE_SKILLS.find(({ classNumber, id }) => classNumber === 1 && id === 'operation'), {
    classNumber: 1,
    id: 'operation',
    sprite: 'operation',
    name: 'Self Revive',
    typeName: 'Timed',
    cost: 0,
    levelRequired: 16,
    value: 30,
    special: 'When about to die, heal 50% health',
    description: 'After reaching 0 health, the Medic performs a last second operation on himself, regaining half of his health.\n\n(Can only occur once every 30 seconds)',
  });
});
