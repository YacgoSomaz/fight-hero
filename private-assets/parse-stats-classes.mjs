function literalValue(token) {
  const trimmed = token.trim();
  if (trimmed.startsWith('"')) return trimmed.slice(1, -1);
  return Number(trimmed);
}

function sourceFields(block) {
  const fields = {};
  for (const match of block.matchAll(/_loc3_\.(\w+)\s*=\s*("(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?)\s*;/g)) {
    fields[match[1]] = literalValue(match[2]);
  }
  const chained = /_loc3_\.(\w+)\s*=\s*_loc3_\.(\w+)\s*=\s*("(?:[^"\\]|\\.)*")\s*;/g;
  for (const match of block.matchAll(chained)) {
    fields[match[1]] = literalValue(match[3]);
    fields[match[2]] = literalValue(match[3]);
  }
  return fields;
}

// Reads only the literal class records from Stats_Classes.getClass().  The
// level formula below is the source `(max-min)/49*(level-1)`, not a rounded
// approximation or a quick-match balance table.
export function extractClassDefinitions(source) {
  const start = source.indexOf('public static function getClass');
  const end = source.indexOf('public static function getNextExp', start);
  if (start === -1 || end === -1) throw new Error('Stats_Classes.getClass source is unavailable');
  const body = source.slice(start, end);
  const classes = [];
  for (const match of body.matchAll(/case\s+(\d+)\s*:\s*([\s\S]*?)(?=\s*case\s+\d+\s*:|\s*}\s*_loc3_\.hp)/g)) {
    const number = Number(match[1]);
    if (!number) continue;
    const fields = sourceFields(match[2]);
    if (!fields.id || !fields.hpMin) continue;
    const stats = Object.freeze({
      hp: Object.freeze({ min: fields.hpMin, max: fields.hpMax }),
      crit: Object.freeze({ min: fields.critMin, max: fields.critMax }),
      aim: Object.freeze({ min: fields.aimMin, max: fields.aimMax }),
      ammo: Object.freeze({ min: fields.ammMin, max: fields.ammMax }),
    });
    classes.push(Object.freeze({
      number,
      id: fields.id,
      name: fields.name,
      startFrame: fields.startFrame,
      runType: fields.runType,
      stats,
      atLevel(level) {
        const interpolated = (range) => range.min + (range.max - range.min) / 49 * (level - 1);
        return { hp: interpolated(stats.hp), crit: interpolated(stats.crit), aim: interpolated(stats.aim), ammo: interpolated(stats.ammo) };
      },
    }));
  }
  return classes;
}
