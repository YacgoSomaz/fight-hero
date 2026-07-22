function literalValue(token) {
  const trimmed = token.trim();
  if (trimmed.startsWith('"')) return JSON.parse(trimmed);
  return Number(trimmed);
}

// Reads only the four literal `classSaves.push({...})` records established in
// SD.Init().  Saved SharedObject data is intentionally outside this parser:
// this artifact represents the original SWF's deterministic first-run state.
export function extractDefaultClassSaves(source) {
  const initStart = source.indexOf('public static function Init');
  const savesStart = source.indexOf('classSaves = [0];', initStart);
  const savesEnd = source.indexOf('unlocks = [];', savesStart);
  if (initStart === -1 || savesStart === -1 || savesEnd === -1) {
    throw new Error('SD.Init first-run class save source is unavailable');
  }
  const saves = [];
  const body = source.slice(savesStart, savesEnd);
  for (const match of body.matchAll(/classSaves\.push\(\{([\s\S]*?)\}\);/g)) {
    const record = {};
    for (const field of match[1].matchAll(/"(\w+)"\s*:\s*("(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?)/g)) {
      record[field[1]] = literalValue(field[2]);
    }
    saves.push(Object.freeze(record));
  }
  if (saves.length !== 4) throw new Error(`expected four original first-run class saves, found ${saves.length}`);
  return Object.freeze(saves);
}
