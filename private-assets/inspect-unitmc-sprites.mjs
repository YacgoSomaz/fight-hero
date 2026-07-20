import fs from 'node:fs';
import zlib from 'node:zlib';

let bytes = fs.readFileSync('assets/reverse/4399-90433-25.swf');
if (bytes.subarray(0, 3).toString() === 'CWS') bytes = Buffer.concat([Buffer.from('FWS'), bytes.subarray(3, 8), zlib.inflateSync(bytes.subarray(8))]);

function readTag(offset) {
  const header = bytes.readUInt16LE(offset); let length = header & 63; let body = offset + 2;
  if (length === 63) { length = bytes.readUInt32LE(body); body += 4; }
  return { code: header >> 6, body, next: body + length };
}
function readBits(offset) {
  let bit = offset * 8;
  const unsigned = (count) => { let value = 0; for (let i = 0; i < count; i += 1) { value = value * 2 + ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1); bit += 1; } return value; };
  const signed = (count) => { const value = unsigned(count); return count && value >= 2 ** (count - 1) ? value - 2 ** count : value; };
  return { unsigned, signed, end: () => Math.ceil(bit / 8) };
}
function readMatrix(offset) {
  const bits = readBits(offset); let scaleX = 1; let scaleY = 1; let rotateSkew0 = 0; let rotateSkew1 = 0;
  if (bits.unsigned(1)) { const count = bits.unsigned(5); scaleX = bits.signed(count) / 65536; scaleY = bits.signed(count) / 65536; }
  if (bits.unsigned(1)) { const count = bits.unsigned(5); rotateSkew0 = bits.signed(count) / 65536; rotateSkew1 = bits.signed(count) / 65536; }
  const count = bits.unsigned(5); const x = bits.signed(count) / 20; const y = bits.signed(count) / 20;
  return { x, y, scaleX, scaleY, rotateSkew0, rotateSkew1, next: bits.end() };
}
function skipCxform(offset) {
  const bits = readBits(offset); const hasAdd = bits.unsigned(1); const hasMult = bits.unsigned(1); const count = bits.unsigned(4);
  if (hasMult) for (let i = 0; i < 4; i += 1) bits.signed(count);
  if (hasAdd) for (let i = 0; i < 4; i += 1) bits.signed(count);
  return bits.end();
}
function findSprite(id) {
  let offset = 8; const rectBits = bytes[offset] >> 3; offset += Math.ceil((5 + rectBits * 4) / 8) + 4;
  while (offset < bytes.length) { const tag = readTag(offset); if (tag.code === 39 && bytes.readUInt16LE(tag.body) === id) return tag; offset = tag.next; }
  throw new Error(`Sprite ${id} not found`);
}
function timeline(id) {
  const sprite = findSprite(id); const placed = new Map(); const frames = []; let label = null; let offset = sprite.body + 4;
  while (offset < sprite.next) {
    const tag = readTag(offset); if (tag.code === 0) break;
    if (tag.code === 43) label = bytes.subarray(tag.body, bytes.indexOf(0, tag.body)).toString();
    if (tag.code === 1) { frames.push({ frame: frames.length + 1, label, items: [...placed.values()].map((item) => ({ ...item })) }); label = null; }
    if (tag.code === 26) {
      let cursor = tag.body; const flags = bytes[cursor++]; const depth = bytes.readUInt16LE(cursor); cursor += 2;
      const next = { ...(placed.get(depth) ?? {}), depth };
      if (flags & 2) { next.character = bytes.readUInt16LE(cursor); cursor += 2; }
      if (flags & 4) { const matrix = readMatrix(cursor); Object.assign(next, matrix); cursor = matrix.next; delete next.next; }
      if (flags & 8) cursor = skipCxform(cursor);
      if (flags & 16) cursor += 2;
      if (flags & 32) { const end = bytes.indexOf(0, cursor); next.name = bytes.subarray(cursor, end).toString(); }
      placed.set(depth, next);
    } else if (tag.code === 70) {
      let cursor = tag.body; const flags = bytes[cursor++]; const flags2 = bytes[cursor++]; const depth = bytes.readUInt16LE(cursor); cursor += 2;
      const next = { ...(placed.get(depth) ?? {}), depth };
      if ((flags2 & 8) || ((flags2 & 16) && (flags & 2))) { const end = bytes.indexOf(0, cursor); cursor = end + 1; }
      if (flags & 2) { next.character = bytes.readUInt16LE(cursor); cursor += 2; }
      if (flags & 4) { const matrix = readMatrix(cursor); Object.assign(next, matrix); cursor = matrix.next; delete next.next; }
      if (flags & 8) cursor = skipCxform(cursor);
      if (flags & 16) cursor += 2;
      if (flags & 32) { const end = bytes.indexOf(0, cursor); next.name = bytes.subarray(cursor, end).toString(); }
      placed.set(depth, next);
    } else if (tag.code === 28) { placed.delete(bytes.readUInt16LE(tag.body)); }
    else if (tag.code === 5) { placed.delete(bytes.readUInt16LE(tag.body + 2)); }
    offset = tag.next;
  }
  return { id, frameCount: frames.length, frames };
}

const summary = process.argv.includes('--summary');
const exportPath = process.argv.find((value) => value.startsWith('--export='))?.slice('--export='.length);
const ids = process.argv.slice(2).filter((value) => !value.startsWith('--')).map(Number);
const result = ids.map((id) => {
  const data = timeline(id);
  if (!summary) return data;
  return {
    id: data.id,
    frameCount: data.frameCount,
    samples: [1, 2, 51].filter((frame) => frame <= data.frameCount).map((frame) => data.frames[frame - 1]),
    names: [...new Set(data.frames.flatMap((frame) => frame.items.map((item) => item.name).filter(Boolean)))],
  };
});
if (exportPath) {
  const root = timeline(669);
  // `gun` is the holstered root clip.  The selected rifle is already inside
  // arm1 in the fixed Medic art, so omit that duplicate visual from the web
  // render while retaining every body/holder matrix.
  const visible = new Set(['arm1', 'foot2', 'leglow2', 'legup2', 'foot1', 'leglow1', 'legup1', 'body', 'headhold', 'arm1hold', 'head', 'arm2']);
  const frameData = root.frames.map((frame) => frame.items.filter((item) => visible.has(item.name)).sort((a, b) => a.depth - b.depth).map((item) => [
    item.name, item.x, item.y, item.scaleX, item.scaleY, item.rotateSkew0, item.rotateSkew1,
  ]));
  fs.writeFileSync(exportPath, JSON.stringify({ version: 1, sourceSymbol: 669, frames: frameData }));
  console.log(`wrote ${frameData.length} UnitMC frames to ${exportPath}`);
} else console.log(JSON.stringify(result, null, 2));
