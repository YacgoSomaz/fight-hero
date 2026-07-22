import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const swfPath = fileURLToPath(new URL('../assets/reverse/4399-90433-25.swf', import.meta.url));
const sourcePath = fileURLToPath(new URL('../assets/reverse/ffdec-deep-20260720/scripts/UnitMC.as', import.meta.url));

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

function skipMatrix(bytes, offset) {
  const bits = bitReader(bytes, offset);
  if (bits.unsigned(1)) {
    const count = bits.unsigned(5);
    bits.signed(count); bits.signed(count);
  }
  if (bits.unsigned(1)) {
    const count = bits.unsigned(5);
    bits.signed(count); bits.signed(count);
  }
  const count = bits.unsigned(5);
  bits.signed(count); bits.signed(count);
  return bits.end();
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

function definitions(bytes) {
  const found = new Map();
  let offset = 8;
  const rect = bitReader(bytes, offset);
  const count = rect.unsigned(5);
  rect.signed(count); rect.signed(count); rect.signed(count); rect.signed(count);
  offset = rect.end() + 4;
  while (offset < bytes.length) {
    const tag = readTag(bytes, offset);
    if ([2, 22, 32, 39, 46, 83, 84].includes(tag.code)) found.set(bytes.readUInt16LE(tag.body), tag);
    offset = tag.next;
  }
  return found;
}

function firstFrameDisplayList(bytes, sprite) {
  const placed = new Map();
  let offset = sprite.body + 4;
  while (offset < sprite.next) {
    const tag = readTag(bytes, offset);
    if (tag.code === 0 || tag.code === 1) break;
    if (tag.code === 26 || tag.code === 70) {
      let cursor = tag.body;
      const flags = bytes[cursor++];
      const flags2 = tag.code === 70 ? bytes[cursor++] : 0;
      const depth = bytes.readUInt16LE(cursor); cursor += 2;
      const item = { ...(placed.get(depth) ?? {}), depth };
      if (tag.code === 70 && ((flags2 & 8) || ((flags2 & 16) && (flags & 2)))) cursor = bytes.indexOf(0, cursor) + 1;
      if (flags & 2) { item.character = bytes.readUInt16LE(cursor); cursor += 2; }
      if (flags & 4) cursor = skipMatrix(bytes, cursor);
      if (flags & 8) cursor = skipColorTransform(bytes, cursor);
      if (flags & 16) cursor += 2;
      if (flags & 32) {
        const end = bytes.indexOf(0, cursor);
        item.name = bytes.subarray(cursor, end).toString();
      }
      placed.set(depth, item);
    }
    offset = tag.next;
  }
  return [...placed.values()];
}

function setSkinPaths(source) {
  return [...source.matchAll(/this\.setPart\(this\.([\w.]+),this\.curSkin\);/g)].map((match) => match[1]);
}

/**
 * Mechanically links UnitMC.setSkin's AS3 targets to the nested SWF sprites.
 * It intentionally does not map a skin index to the root UnitMC timeline.
 */
export function extractUnitMCSkinGraph({ swf = swfPath, unitSource = sourcePath } = {}) {
  const bytes = decompressSwf(swf);
  const defs = definitions(bytes);
  const root = defs.get(669);
  if (!root || root.code !== 39) throw new Error('UnitMC symbol 669 was not found');

  const source = fs.readFileSync(unitSource, 'utf8');
  const rootChildren = new Map(firstFrameDisplayList(bytes, root).filter((item) => item.name).map((item) => [item.name, item.character]));
  const targets = setSkinPaths(source).map((path) => {
    const [rootName, childName] = path.split('.');
    const rootCharacter = rootChildren.get(rootName);
    if (!rootCharacter) throw new Error(`UnitMC root target ${rootName} is absent`);
    const character = childName
      ? new Map(firstFrameDisplayList(bytes, defs.get(rootCharacter)).filter((item) => item.name).map((item) => [item.name, item.character])).get(childName)
      : rootCharacter;
    const sprite = defs.get(character);
    if (!sprite || sprite.code !== 39) throw new Error(`UnitMC skin target ${path} is not a Sprite`);
    return [path, character, bytes.readUInt16LE(sprite.body + 2)];
  });

  return {
    rootAnimation: 669,
    rootAnimationFrames: bytes.readUInt16LE(root.body + 2),
    targets,
  };
}
