// This parser reads only literal calls inside Stats_Campaign.setMatch(). It
// deliberately never evaluates ActionScript; bare identifiers such as M_Slow
// remain source-reference strings in the extracted record.
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
  throw new Error('Unclosed Stats_Campaign call');
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

function topLevelColon(source) {
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
    else if (char === ':' && depth === 0) return index;
  }
  throw new Error(`Object property is missing a colon: ${source}`);
}

function decodeObject(token) {
  const result = {};
  for (const property of splitArguments(token.slice(1, -1)).filter(Boolean)) {
    const colon = topLevelColon(property);
    const key = decodeValue(property.slice(0, colon));
    result[key] = decodeValue(property.slice(colon + 1));
  }
  return result;
}

function decodeValue(token) {
  const value = token.trim();
  if (value.startsWith('"') || value.startsWith("'")) return decodeString(value);
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) return Number(value);
  const arithmetic = value.match(/^(-?(?:\d+\.?\d*|\.\d+))\s*([*+\/-])\s*(-?(?:\d+\.?\d*|\.\d+))$/);
  if (arithmetic) {
    const left = Number(arithmetic[1]);
    const right = Number(arithmetic[3]);
    return ({ '*': left * right, '+': left + right, '-': left - right, '/': left / right })[arithmetic[2]];
  }
  if (value.startsWith('[') && value.endsWith(']')) return splitArguments(value.slice(1, -1)).filter(Boolean).map(decodeValue);
  if (value.startsWith('{') && value.endsWith('}')) return decodeObject(value);
  return value;
}

function callsInStage(source, name) {
  const calls = [];
  let searchFrom = 0;
  while (searchFrom < source.length) {
    const start = source.indexOf(`${name}(`, searchFrom);
    if (start === -1) break;
    const openIndex = start + name.length;
    const argumentText = readBalancedCall(source, openIndex);
    calls.push(splitArguments(argumentText).map(decodeValue));
    searchFrom = openIndex + argumentText.length + 2;
  }
  return calls;
}

function actor(values) {
  const [team, name, soldier, skin, primary, secondary, skill, streak, difficulty, extra] = values;
  return { team, name, soldier, skin, primary, secondary, skill, streak, difficulty, extra };
}

function parseStage(kind, stage, body) {
  const [cutsceneValues] = callsInStage(body, 'setCutscene');
  const [levelValues] = callsInStage(body, 'setLvl');
  const [playerValues] = callsInStage(body, 'setPlr');
  if (!levelValues || !playerValues) throw new Error(`Missing source level or player for ${kind} ${stage}`);
  const [mode, score, map, difficulty, song, title, description, special, extra] = levelValues;
  const [preSong, preFrames, postSong, postFrames] = cutsceneValues ?? [null, null, null, null];
  return {
    kind, stage,
    cutscene: { preSong, preFrames, postSong, postFrames },
    mode, score, map, difficulty, song, title, description, special, extra,
    player: actor(playerValues),
    bots: callsInStage(body, 'addBot').map(actor),
  };
}

function sourceStages(source) {
  const start = source.indexOf('public static function setMatch');
  const end = source.indexOf('public static function runScripts', start);
  if (start === -1 || end === -1) throw new Error('Stats_Campaign setMatch block not found');
  const groups = { campaign: [], challenges: [] };
  let kind = null;
  let stage = null;
  let body = [];
  const flush = () => {
    if (kind && stage !== null) groups[kind].push(parseStage(kind, stage, body.join('\n')));
    stage = null;
    body = [];
  };
  for (const line of source.slice(start, end).split(/\r?\n/)) {
    const outer = line.match(/^\s{12}case ([01]):\s*$/);
    if (outer) {
      flush();
      kind = outer[1] === '0' ? 'campaign' : 'challenges';
      continue;
    }
    const inner = line.match(/^\s{18}case (\d+):\s*$/);
    if (inner && kind) {
      flush();
      stage = Number(inner[1]);
      continue;
    }
    if (stage !== null) body.push(line);
  }
  flush();
  return groups;
}

export function extractCampaignDefinitions(source) {
  const groups = sourceStages(source);
  return Object.freeze({
    campaign: Object.freeze(groups.campaign),
    challenges: Object.freeze(groups.challenges),
  });
}
