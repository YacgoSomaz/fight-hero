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
  throw new Error('Unclosed addGun call');
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
  const content = token.slice(1, -1);
  return content
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([\\"'])/g, '$1');
}

function decodeValue(token) {
  if (token.startsWith('"') || token.startsWith("'")) return decodeString(token);
  if (token === 'true') return true;
  if (token === 'false') return false;
  if (token === 'null') return null;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(token)) return Number(token);
  if (token.startsWith('[') || token.startsWith('{')) {
    return JSON.parse(token.replace(/\\'/g, "'"));
  }
  return token;
}

function mapDefinition(values) {
  const value = (index) => decodeValue(values[index]);
  return {
    type: value(0),
    id: value(1),
    sprite: value(2) || value(1),
    name: value(3) || value(1),
    typeName: value(4),
    levelRequired: value(6),
    damage: value(7),
    force: value(8),
    splash: value(10),
    clipSize: value(12),
    clipSpare: value(13),
    range: value(14),
    recoil: value(15),
    autoFire: value(16),
    shootDelay: value(17),
    xOffset: value(18),
    yOffset: value(19),
    effect: { shoot: value(20), hit: value(21), shell: value(22), hudBullet: value(23) },
    animation: { idle: value(24), fire: value(25), reload: value(26) },
    shotSound: value(27),
    hitSound: value(28),
    bulletClass: value(29),
    parameters: value(30),
    extra: value(31),
    description: value(32),
  };
}

// Parses the literal addGun calls in the decompiled Stats_Guns.Init body
// without evaluating ActionScript expressions or arbitrary source code.
export function extractGunDefinitions(source) {
  const guns = [];
  let searchFrom = 0;
  while (searchFrom < source.length) {
    const callStart = source.indexOf('addGun(', searchFrom);
    if (callStart === -1) break;
    const openIndex = callStart + 'addGun'.length;
    const argumentsText = readBalancedCall(source, openIndex);
    const values = splitArguments(argumentsText);
    if (/^\d+$/.test(values[0] ?? '')) guns.push(mapDefinition(values));
    searchFrom = openIndex + argumentsText.length + 2;
  }
  return guns;
}
