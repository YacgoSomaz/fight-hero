function readBalancedCall(source, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth += 1;
    else if (char === ')' && --depth === 0) return source.slice(openIndex + 1, index);
  }
  throw new Error('Unclosed addSkill call');
}

function splitArguments(source) {
  const values = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth -= 1;
    else if (char === ',' && depth === 0) {
      values.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }
  values.push(source.slice(start).trim());
  return values;
}

function decodeString(token) {
  return token.slice(1, -1)
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([\\"'])/g, '$1');
}

function decodeValue(token) {
  if (token.startsWith('"') || token.startsWith("'")) return decodeString(token);
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(token)) return Number(token);
  return token;
}

// Parses literal Stats_Skills.Init addSkill calls without evaluating AS3.
// The function declaration itself is skipped because its first token is not
// a numeric class index.
export function extractSkillDefinitions(source) {
  const skills = [];
  let searchFrom = 0;
  while (searchFrom < source.length) {
    const callStart = source.indexOf('addSkill(', searchFrom);
    if (callStart === -1) break;
    const openIndex = callStart + 'addSkill'.length;
    const values = splitArguments(readBalancedCall(source, openIndex));
    if (/^\d+$/.test(values[0] ?? '')) {
      const value = (index) => decodeValue(values[index]);
      skills.push({
        classNumber: value(0),
        id: value(1),
        sprite: value(2),
        name: value(3),
        typeName: value(4),
        cost: value(5),
        levelRequired: value(6),
        value: value(7),
        special: value(8),
        description: value(9),
      });
    }
    searchFrom = openIndex + readBalancedCall(source, openIndex).length + 2;
  }
  return skills;
}
