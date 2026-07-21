import fs from 'node:fs';
import zlib from 'node:zlib';
import { applyRemoveTag } from './swf-display-list.mjs';

let bytes = fs.readFileSync('assets/reverse/4399-90433-25.swf');
if (bytes.subarray(0, 3).toString() === 'CWS') {
  bytes = Buffer.concat([Buffer.from('FWS'), bytes.subarray(3, 8), zlib.inflateSync(bytes.subarray(8))]);
}

function readTag(offset) {
  const header = bytes.readUInt16LE(offset);
  let length = header & 63;
  let body = offset + 2;
  if (length === 63) { length = bytes.readUInt32LE(body); body += 4; }
  return { code: header >> 6, body, length, next: body + length };
}

function readMatrix(offset) {
  let bit = offset * 8;
  const unsigned = (count) => {
    let value = 0;
    for (let index = 0; index < count; index += 1) value = (value << 1) | ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1), bit += 1;
    return value;
  };
  const signed = (count) => {
    const value = unsigned(count);
    return count && (value & (1 << (count - 1))) ? value - 2 ** count : value;
  };
  let scaleX = 1; let scaleY = 1; let rotateSkew0 = 0; let rotateSkew1 = 0;
  if (unsigned(1)) { const count = unsigned(5); scaleX = signed(count) / 65536; scaleY = signed(count) / 65536; }
  if (unsigned(1)) { const count = unsigned(5); rotateSkew0 = signed(count) / 65536; rotateSkew1 = signed(count) / 65536; }
  const count = unsigned(5);
  const x = signed(count) / 20;
  const y = signed(count) / 20;
  return { x, y, scaleX, scaleY, rotateSkew0, rotateSkew1, next: Math.ceil(bit / 8) };
}

function skipColorTransform(offset, withAlpha = true) {
  let bit = offset * 8;
  const unsigned = (count) => {
    let value = 0;
    for (let index = 0; index < count; index += 1) value = (value << 1) | ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1), bit += 1;
    return value;
  };
  const hasAdd = unsigned(1); const hasMult = unsigned(1); const count = unsigned(4);
  const terms = withAlpha ? 4 : 3;
  if (hasMult) bit += count * terms;
  if (hasAdd) bit += count * terms;
  return Math.ceil(bit / 8);
}

let offset = 8;
const nbits = bytes[offset] >> 3;
offset += Math.ceil((5 + nbits * 4) / 8) + 4;
let arena;
while (offset < bytes.length) {
  const tag = readTag(offset);
  if (tag.code === 39 && bytes.readUInt16LE(tag.body) === 1413) { arena = tag; break; }
  offset = tag.next;
}
if (!arena) throw new Error('Arena sprite 1413 not found');

const placed = new Map();
const frames = [];
let label = null;
offset = arena.body + 4;
while (offset < arena.next) {
  const tag = readTag(offset);
  if (tag.code === 0) break;
  if (tag.code === 43) label = bytes.subarray(tag.body, bytes.indexOf(0, tag.body)).toString();
  if (tag.code === 1) { frames.push({ label, items: [...placed.values()] }); label = null; }
  if (tag.code === 26) {
    let cursor = tag.body;
    const flags = bytes[cursor++];
    const depth = bytes.readUInt16LE(cursor); cursor += 2;
    const existing = placed.get(depth) ?? { depth };
    const next = { ...existing, depth };
    if (flags & 2) { next.character = bytes.readUInt16LE(cursor); cursor += 2; }
    if (flags & 4) { const matrix = readMatrix(cursor); Object.assign(next, matrix); cursor = matrix.next; delete next.next; }
    if (flags & 8) cursor = skipColorTransform(cursor);
    if (flags & 16) cursor += 2;
    if (flags & 32) { const end = bytes.indexOf(0, cursor); next.name = bytes.subarray(cursor, end).toString(); cursor = end + 1; }
    placed.set(depth, next);
  } else applyRemoveTag(placed, tag, bytes);
  offset = tag.next;
}
// Frame 2 is Arena's Foundry labelled frame.  1263 is NodePhysBox, 1268 is
// NodeAiAction, 1273 is NodeWaypoint, 1276 is NodeSpawn, and 1280 is pickup.
console.error(frames.map((frame, index) => `${index + 1}:${frame.label ?? ''}`).join(', '));
const foundryFrame = frames.find((frame) => frame.label === 'foundry');
const foundry = foundryFrame.items.filter((item) => [1242, 1252, 1258, 1261, 1263, 1268, 1273, 1276, 1280].includes(item.character))
  .map(({ character, depth, name, x, y, scaleX, scaleY }) => ({ character, depth, name, x, y, scaleX, scaleY }));
console.log(JSON.stringify(foundry, null, 2));
