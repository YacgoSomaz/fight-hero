import fs from 'node:fs';
import zlib from 'node:zlib';

let bytes = fs.readFileSync('assets/reverse/4399-90433-25.swf');
if (bytes.subarray(0, 3).toString() === 'CWS') bytes = Buffer.concat([Buffer.from('FWS'), bytes.subarray(3, 8), zlib.inflateSync(bytes.subarray(8))]);

function readTag(offset) {
  const header = bytes.readUInt16LE(offset); let length = header & 63; let body = offset + 2;
  if (length === 63) { length = bytes.readUInt32LE(body); body += 4; }
  return { code: header >> 6, body, length, next: body + length };
}
function readBits(offset) {
  let bit = offset * 8;
  const unsigned = (count) => { let value = 0; for (let i = 0; i < count; i += 1) { value = value * 2 + ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1); bit += 1; } return value; };
  const signed = (count) => { const value = unsigned(count); return count && value >= 2 ** (count - 1) ? value - 2 ** count : value; };
  return { unsigned, signed, end: () => Math.ceil(bit / 8) };
}
function readRect(offset) {
  const bits = readBits(offset); const count = bits.unsigned(5);
  const xMin = bits.signed(count) / 20; const xMax = bits.signed(count) / 20;
  const yMin = bits.signed(count) / 20; const yMax = bits.signed(count) / 20;
  return { xMin, xMax, yMin, yMax, next: bits.end() };
}
function readMatrix(offset) {
  const bits = readBits(offset); let a = 1; let d = 1; let b = 0; let c = 0;
  if (bits.unsigned(1)) { const count = bits.unsigned(5); a = bits.signed(count) / 65536; d = bits.signed(count) / 65536; }
  if (bits.unsigned(1)) { const count = bits.unsigned(5); b = bits.signed(count) / 65536; c = bits.signed(count) / 65536; }
  const count = bits.unsigned(5); const x = bits.signed(count) / 20; const y = bits.signed(count) / 20;
  return { a, b, c, d, x, y, next: bits.end() };
}
function skipCxform(offset) { const bits = readBits(offset); const add = bits.unsigned(1); const mult = bits.unsigned(1); const count = bits.unsigned(4); if (mult) for (let i = 0; i < 4; i += 1) bits.signed(count); if (add) for (let i = 0; i < 4; i += 1) bits.signed(count); return bits.end(); }

const defs = new Map();
let offset = 8; const stage = readRect(offset); offset = stage.next + 4;
while (offset < bytes.length) {
  const tag = readTag(offset);
  if ([2, 22, 32, 39, 46, 83, 84].includes(tag.code)) defs.set(bytes.readUInt16LE(tag.body), tag);
  offset = tag.next;
}

function firstDisplayList(id) {
  const sprite = defs.get(id); if (!sprite || sprite.code !== 39) return [];
  const placed = new Map(); let cursor = sprite.body + 4;
  while (cursor < sprite.next) {
    const tag = readTag(cursor); if (tag.code === 0 || tag.code === 1) break;
    if (tag.code === 26 || tag.code === 70) {
      let pos = tag.body; const flags = bytes[pos++]; const flags2 = tag.code === 70 ? bytes[pos++] : 0; const depth = bytes.readUInt16LE(pos); pos += 2;
      const next = { ...(placed.get(depth) ?? {}), depth };
      if (tag.code === 70 && ((flags2 & 8) || ((flags2 & 16) && (flags & 2)))) { const end = bytes.indexOf(0, pos); pos = end + 1; }
      if (flags & 2) { next.character = bytes.readUInt16LE(pos); pos += 2; }
      if (flags & 4) { const matrix = readMatrix(pos); Object.assign(next, matrix); pos = matrix.next; }
      if (flags & 8) pos = skipCxform(pos);
      if (flags & 16) pos += 2;
      if (flags & 32) { const end = bytes.indexOf(0, pos); next.name = bytes.subarray(pos, end).toString(); }
      placed.set(depth, next);
    }
    cursor = tag.next;
  }
  return [...placed.values()];
}
function displayListAtFrame(id, targetFrame) {
  const sprite = defs.get(id); if (!sprite || sprite.code !== 39) return [];
  const placed = new Map(); let cursor = sprite.body + 4; let frame = 1;
  while (cursor < sprite.next) {
    const tag = readTag(cursor); if (tag.code === 0) break;
    if (tag.code === 1) { if (frame === targetFrame) return [...placed.values()]; frame += 1; cursor = tag.next; continue; }
    if (tag.code === 26 || tag.code === 70) {
      let pos = tag.body; const flags = bytes[pos++]; const flags2 = tag.code === 70 ? bytes[pos++] : 0; const depth = bytes.readUInt16LE(pos); pos += 2;
      const next = { ...(placed.get(depth) ?? {}), depth };
      if (tag.code === 70 && ((flags2 & 8) || ((flags2 & 16) && (flags & 2)))) { const end = bytes.indexOf(0, pos); pos = end + 1; }
      if (flags & 2) { next.character = bytes.readUInt16LE(pos); pos += 2; }
      if (flags & 4) { const matrix = readMatrix(pos); Object.assign(next, matrix); pos = matrix.next; }
      if (flags & 8) pos = skipCxform(pos);
      if (flags & 16) pos += 2;
      if (flags & 32) { const end = bytes.indexOf(0, pos); next.name = bytes.subarray(pos, end).toString(); }
      placed.set(depth, next);
    } else if (tag.code === 28) placed.delete(bytes.readUInt16LE(tag.body));
    else if (tag.code === 5) placed.delete(bytes.readUInt16LE(tag.body + 2));
    cursor = tag.next;
  }
  return [...placed.values()];
}

function frameLabels(id) {
  const sprite = defs.get(id); if (!sprite || sprite.code !== 39) return [];
  const labels = []; let cursor = sprite.body + 4; let frame = 1;
  while (cursor < sprite.next) {
    const tag = readTag(cursor);
    if (tag.code === 0) break;
    if (tag.code === 43) {
      const end = bytes.indexOf(0, tag.body);
      labels.push({ frame, label: bytes.subarray(tag.body, end).toString() });
    }
    if (tag.code === 1) frame += 1;
    cursor = tag.next;
  }
  return labels;
}
function union(a, b) { return !a ? b : !b ? a : { xMin: Math.min(a.xMin, b.xMin), yMin: Math.min(a.yMin, b.yMin), xMax: Math.max(a.xMax, b.xMax), yMax: Math.max(a.yMax, b.yMax) }; }
function transformBounds(bounds, matrix) {
  const points = [[bounds.xMin, bounds.yMin], [bounds.xMin, bounds.yMax], [bounds.xMax, bounds.yMin], [bounds.xMax, bounds.yMax]].map(([x, y]) => ({ x: matrix.a * x + matrix.c * y + matrix.x, y: matrix.b * x + matrix.d * y + matrix.y }));
  return { xMin: Math.min(...points.map((p) => p.x)), yMin: Math.min(...points.map((p) => p.y)), xMax: Math.max(...points.map((p) => p.x)), yMax: Math.max(...points.map((p) => p.y)) };
}
function visualBounds(id, frame = 1, seen = new Set()) {
  if (seen.has(id)) return null; seen.add(id);
  const direct = definitionBounds(id); if (direct) return direct;
  const sprite = defs.get(id); if (!sprite || sprite.code !== 39) return null;
  const ownFrame = Math.min(frame, bytes.readUInt16LE(sprite.body + 2));
  let result = null;
  for (const item of displayListAtFrame(id, ownFrame)) {
    if (!item.character) continue;
    const child = visualBounds(item.character, ownFrame, new Set(seen));
    if (child) result = union(result, transformBounds(child, item));
  }
  return result;
}
function definitionBounds(id) {
  const tag = defs.get(id); if (!tag) return null;
  if ([2, 22, 32, 83].includes(tag.code)) return readRect(tag.body + 2);
  return null;
}
function describe(id, indent = '') {
  const tag = defs.get(id); const list = firstDisplayList(id); const bounds = definitionBounds(id);
  const frames = tag?.code === 39 ? bytes.readUInt16LE(tag.body + 2) : null;
  console.log(`${indent}${id}: ${tag ? `tag ${tag.code}` : 'missing'}${frames !== null ? ` frames ${frames}` : ''}${bounds ? ` bounds ${JSON.stringify(bounds)}` : ''}`);
  for (const item of list) {
    console.log(`${indent}  depth ${item.depth} -> ${item.character} matrix [${[item.a, item.b, item.c, item.d, item.x, item.y].map((v) => Number(v).toFixed(3)).join(', ')}]`);
    if (indent.length < 4 && item.character) describe(item.character, `${indent}    `);
  }
}

for (const id of [501, 538, 568, 598, 631, 666, 668]) describe(id);
for (const id of [375, 501, 668]) console.log(`labels ${id}:`, frameLabels(id));
for (const [id, frame] of [[501, 77], [668, 77], [375, 20]]) console.log(`display ${id} frame ${frame}:`, displayListAtFrame(id, frame));
for (const [id, frame] of [[266, 51], [298, 51], [385, 51], [375, 20], [425, 1]]) console.log(`bounds ${id} frame ${frame}:`, visualBounds(id, frame));
for (const [id, frame, alpha] of [[501, 51, [87, 62]], [668, 51, [60, 36]]]) {
  const bounds = visualBounds(id, frame);
  console.log(`canvas origin ${id} frame ${frame}:`, { bounds, drawOffset: bounds && { x: bounds.xMin - alpha[0], y: bounds.yMin - alpha[1] } });
}
