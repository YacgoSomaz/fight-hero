import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { applyRemoveTag } from '../private-assets/swf-display-list.mjs';

const defaultSwf = fileURLToPath(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
const ARENA = 1413;
const FOREGROUND_CHILDREN = new Set([1242, 1252, 1258]);

function decompressSwf(path) {
  const source = fs.readFileSync(path);
  return source.subarray(0, 3).toString() === 'CWS'
    ? Buffer.concat([Buffer.from('FWS'), source.subarray(3, 8), zlib.inflateSync(source.subarray(8))])
    : source;
}

function readTag(bytes, offset) {
  const header = bytes.readUInt16LE(offset);
  let length = header & 63;
  let body = offset + 2;
  if (length === 63) {
    length = bytes.readUInt32LE(body);
    body += 4;
  }
  return { code: header >> 6, body, next: body + length };
}

function bitReader(bytes, start) {
  let bit = start * 8;
  const unsigned = (count) => {
    let value = 0;
    for (let index = 0; index < count; index += 1) {
      value = value * 2 + ((bytes[bit >> 3] >> (7 - (bit & 7))) & 1);
      bit += 1;
    }
    return value;
  };
  const signed = (count) => {
    const value = unsigned(count);
    return count && value >= 2 ** (count - 1) ? value - 2 ** count : value;
  };
  return { unsigned, signed, end: () => Math.ceil(bit / 8) };
}

function readMatrix(bytes, offset) {
  const bits = bitReader(bytes, offset);
  let a = 1; let b = 0; let c = 0; let d = 1;
  if (bits.unsigned(1)) {
    const count = bits.unsigned(5);
    a = bits.signed(count) / 65536;
    d = bits.signed(count) / 65536;
  }
  if (bits.unsigned(1)) {
    const count = bits.unsigned(5);
    b = bits.signed(count) / 65536;
    c = bits.signed(count) / 65536;
  }
  const count = bits.unsigned(5);
  return { a, b, c, d, x: bits.signed(count) / 20, y: bits.signed(count) / 20, next: bits.end() };
}

function skipColorTransform(bytes, offset) {
  const bits = bitReader(bytes, offset);
  const hasAdd = bits.unsigned(1);
  const hasMultiply = bits.unsigned(1);
  const count = bits.unsigned(4);
  if (hasMultiply) for (let index = 0; index < 4; index += 1) bits.signed(count);
  if (hasAdd) for (let index = 0; index < 4; index += 1) bits.signed(count);
  return bits.end();
}

function definitionMap(bytes) {
  const result = new Map();
  const stage = bitReader(bytes, 8);
  const count = stage.unsigned(5);
  stage.signed(count); stage.signed(count); stage.signed(count); stage.signed(count);
  let offset = stage.end() + 4;
  while (offset < bytes.length) {
    const tag = readTag(bytes, offset);
    if ([2, 22, 32, 39, 46, 83, 84].includes(tag.code)) result.set(bytes.readUInt16LE(tag.body), tag);
    offset = tag.next;
  }
  return result;
}

function readPlacement(bytes, tag, placed) {
  let cursor = tag.body;
  const flags = bytes[cursor++];
  const flags2 = tag.code === 70 ? bytes[cursor++] : 0;
  const depth = bytes.readUInt16LE(cursor); cursor += 2;
  const item = { ...(placed.get(depth) ?? {}), depth };
  if (tag.code === 70 && ((flags2 & 8) || ((flags2 & 16) && (flags & 2)))) cursor = bytes.indexOf(0, cursor) + 1;
  if (flags & 2) { item.character = bytes.readUInt16LE(cursor); cursor += 2; }
  if (flags & 4) {
    const matrix = readMatrix(bytes, cursor);
    item.matrix = { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, x: matrix.x, y: matrix.y };
    cursor = matrix.next;
  }
  if (flags & 8) cursor = skipColorTransform(bytes, cursor);
  if (flags & 16) cursor += 2;
  if (flags & 32) {
    const end = bytes.indexOf(0, cursor);
    item.name = bytes.subarray(cursor, end).toString();
  }
  placed.set(depth, item);
}

function displayListFrames(bytes, sprite) {
  const placed = new Map();
  const frames = [];
  let label = null;
  let offset = sprite.body + 4;
  while (offset < sprite.next) {
    const tag = readTag(bytes, offset);
    if (tag.code === 0) break;
    if (tag.code === 43) label = bytes.subarray(tag.body, bytes.indexOf(0, tag.body)).toString();
    if (tag.code === 26 || tag.code === 70) readPlacement(bytes, tag, placed);
    else applyRemoveTag(placed, tag, bytes);
    if (tag.code === 1) {
      frames.push({ label, items: [...placed.values()].map((item) => ({ ...item })) });
      label = null;
    }
    offset = tag.next;
  }
  return frames;
}

/**
 * Arena's Display List is the authority for reassembling Foundry's dynamic
 * foreground.  This deliberately excludes wallMC and Node* authoring data.
 */
export function extractFoundryForegroundDisplayList({ swf = defaultSwf } = {}) {
  const bytes = decompressSwf(swf);
  const defs = definitionMap(bytes);
  const arena = defs.get(ARENA);
  if (!arena || arena.code !== 39) throw new Error('original Arena symbol 1413 is unavailable');
  const frames = displayListFrames(bytes, arena);
  const index = frames.findIndex(({ label }) => label === 'foundry');
  if (index < 0) throw new Error('original Arena Foundry frame label is unavailable');

  const layers = frames[index].items
    .filter(({ character }) => FOREGROUND_CHILDREN.has(character))
    .sort((left, right) => left.depth - right.depth)
    .map(({ depth, character, matrix = { a: 1, b: 0, c: 0, d: 1, x: 0, y: 0 } }) => {
      const definition = defs.get(character);
      if (!definition) throw new Error(`Foundry child ${character} definition is unavailable`);
      return Object.freeze({
        depth,
        character,
        frameCount: definition.code === 39 ? bytes.readUInt16LE(definition.body + 2) : 1,
        matrix: Object.freeze({ ...matrix }),
      });
    });

  if (layers.length !== FOREGROUND_CHILDREN.size) throw new Error('original Foundry foreground Display List is incomplete');
  return Object.freeze({ arenaCharacter: ARENA, frame: index + 1, label: frames[index].label, layers: Object.freeze(layers) });
}
