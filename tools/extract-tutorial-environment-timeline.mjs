import { inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';

const TWIPS = 20;
const FIXED = 65536;
const ENVIRONMENT_SYMBOLS = new Set([1361, 1388]);
const SPEAK_SYMBOL = 1488;
const SPEAK_HEAD_SYMBOL = 666;

class BitReader {
  constructor(bytes, offset = 0) { this.bytes = bytes; this.byte = offset; this.bit = 0; }
  align() { if (this.bit) { this.byte += 1; this.bit = 0; } }
  readUBits(count) {
    let value = 0;
    for (let index = 0; index < count; index += 1) {
      value = (value << 1) | ((this.bytes[this.byte] >> (7 - this.bit)) & 1);
      this.bit += 1;
      if (this.bit === 8) { this.byte += 1; this.bit = 0; }
    }
    return value >>> 0;
  }
  readSBits(count) {
    const value = this.readUBits(count);
    return count && (value & (1 << (count - 1))) ? value - (2 ** count) : value;
  }
  readUI8() { this.align(); return this.bytes[this.byte++]; }
  readUI16() { this.align(); const value = this.bytes[this.byte] | (this.bytes[this.byte + 1] << 8); this.byte += 2; return value; }
}

function readRect(reader) {
  const bits = reader.readUBits(5);
  reader.readSBits(bits); reader.readSBits(bits); reader.readSBits(bits); reader.readSBits(bits);
  reader.align();
}

function readMatrix(reader) {
  const matrix = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 };
  if (reader.readUBits(1)) {
    const bits = reader.readUBits(5);
    matrix.scaleX = reader.readSBits(bits) / FIXED;
    matrix.scaleY = reader.readSBits(bits) / FIXED;
  }
  if (reader.readUBits(1)) {
    const bits = reader.readUBits(5);
    matrix.rotateSkew0 = reader.readSBits(bits) / FIXED;
    matrix.rotateSkew1 = reader.readSBits(bits) / FIXED;
  }
  const bits = reader.readUBits(5);
  matrix.x = reader.readSBits(bits) / TWIPS;
  matrix.y = reader.readSBits(bits) / TWIPS;
  reader.align();
  return matrix;
}

function skipColorTransform(reader) {
  const hasAdd = reader.readUBits(1);
  const hasMult = reader.readUBits(1);
  const bits = reader.readUBits(4);
  if (hasMult) for (let index = 0; index < 4; index += 1) reader.readSBits(bits);
  if (hasAdd) for (let index = 0; index < 4; index += 1) reader.readSBits(bits);
  reader.align();
}

function readZeroString(reader) {
  let value = '';
  while (true) {
    const code = reader.readUI8();
    if (code === 0) return value;
    value += String.fromCharCode(code);
  }
}

function parsePlaceObject2(body) {
  const reader = new BitReader(body);
  const flags = reader.readUI8();
  const result = { depth: reader.readUI16() };
  if (flags & 0x02) result.character = reader.readUI16();
  if (flags & 0x04) Object.assign(result, readMatrix(reader));
  if (flags & 0x08) skipColorTransform(reader);
  if (flags & 0x10) result.ratio = reader.readUI16();
  if (flags & 0x20) result.name = readZeroString(reader);
  if (flags & 0x40) result.clipDepth = reader.readUI16();
  return result;
}

// Speak_187 uses PlaceObject3 for the glow-filtered description EditText.
// The fields through Matrix retain the PlaceObject2 order; the FilterList is
// display-only for this extractor, so it may remain unread once the placement
// record is complete.
function parsePlaceObject3(body) {
  const reader = new BitReader(body);
  const flags = reader.readUI8();
  reader.readUI8(); // PlaceObject3-only image/class/filter/blend flags.
  const result = { depth: reader.readUI16() };
  if (flags & 0x02) result.character = reader.readUI16();
  if (flags & 0x04) Object.assign(result, readMatrix(reader));
  if (flags & 0x08) skipColorTransform(reader);
  if (flags & 0x10) result.ratio = reader.readUI16();
  if (flags & 0x20) result.name = readZeroString(reader);
  if (flags & 0x40) result.clipDepth = reader.readUI16();
  return result;
}

function readTag(bytes, offset) {
  const header = bytes.readUInt16LE(offset);
  const code = header >> 6;
  let length = header & 63;
  let body = offset + 2;
  if (length === 63) { length = bytes.readUInt32LE(body); body += 4; }
  return { code, body, next: body + length };
}

function frameItems(display, { includeName = false } = {}) {
  return [...display.values()]
    .sort((left, right) => left.depth - right.depth)
    .map((item) => {
      const result = {
        depth: item.depth,
        character: item.character ?? null,
        clipDepth: item.clipDepth ?? null,
        x: item.x ?? 0,
        y: item.y ?? 0,
        scaleX: item.scaleX ?? 1,
        scaleY: item.scaleY ?? 1,
        rotateSkew0: item.rotateSkew0 ?? 0,
        rotateSkew1: item.rotateSkew1 ?? 0,
      };
      if (includeName) result.name = item.name ?? null;
      return result;
    });
}

function parseSprite(body, options = {}) {
  const id = body.readUInt16LE(0);
  const frameCount = body.readUInt16LE(2);
  const display = new Map();
  const frames = [];
  const labels = {};
  for (let offset = 4; offset < body.length;) {
    const tag = readTag(body, offset);
    if (tag.code === 26 || tag.code === 70) {
      const next = tag.code === 26
        ? parsePlaceObject2(body.subarray(tag.body, tag.next))
        : parsePlaceObject3(body.subarray(tag.body, tag.next));
      display.set(next.depth, { ...display.get(next.depth), ...next });
    } else if (tag.code === 28) {
      display.delete(body.readUInt16LE(tag.body));
    } else if (tag.code === 43) {
      const label = readZeroString(new BitReader(body.subarray(tag.body, tag.next)));
      labels[label] = frames.length + 1;
    } else if (tag.code === 1) {
      frames.push({ frame: frames.length + 1, items: frameItems(display, options) });
    } else if (tag.code === 0) {
      break;
    }
    offset = tag.next;
  }
  if (frames.length !== frameCount) throw new Error(`environment timeline ${id} frame count mismatch (${frames.length}/${frameCount})`);
  return { frameCount, labels, frames };
}

function extractTimelines(source, targetSymbols, options = {}) {
  const swf = uncompress(source);
  const header = new BitReader(swf, 8);
  readRect(header); header.readUI16(); header.readUI16();
  const timelines = {};
  for (let offset = header.byte; offset < swf.length;) {
    const tag = readTag(swf, offset);
    const body = swf.subarray(tag.body, tag.next);
    if (tag.code === 39 && targetSymbols.has(body.readUInt16LE(0))) timelines[body.readUInt16LE(0)] = parseSprite(body, options);
    if (tag.code === 0) break;
    offset = tag.next;
  }
  if (Object.keys(timelines).length !== targetSymbols.size) throw new Error('original Tutorial timeline source is incomplete');
  return timelines;
}

function uncompress(source) {
  if (!Buffer.isBuffer(source)) source = Buffer.from(source);
  if (source.subarray(0, 3).toString('ascii') === 'FWS') return source;
  if (source.subarray(0, 3).toString('ascii') !== 'CWS') throw new Error('original SWF compression is unavailable');
  return Buffer.concat([Buffer.from(`FWS${String.fromCharCode(source[3])}`, 'binary'), source.subarray(4, 8), inflateSync(source.subarray(8))]);
}

export function extractTutorialEnvironmentTimelines(source) {
  return extractTimelines(source, ENVIRONMENT_SYMBOLS);
}

// Hud.setMsg()/Hud.EnterFrame drive the root Speak_187 movie clip; preserving
// names on the three dynamic children is mandatory because the Renderer must
// bind the original head, txt_name and txt_desc rather than approximate them.
export function extractTutorialSpeakTimeline(source) {
  const speak = extractTimelines(source, new Set([SPEAK_SYMBOL]), { includeName: true })[SPEAK_SYMBOL];
  return { symbolId: SPEAK_SYMBOL, ...speak };
}

// Speak_187.head is the original 200-frame portrait selector. Hud.setMsg()
// drives it with Unit.unitInfo.frame, so keep its FrameLabel and Display List
// records independent from the 33-frame container animation.
export function extractTutorialSpeakPortraitTimeline(source) {
  const portrait = extractTimelines(source, new Set([SPEAK_HEAD_SYMBOL]))[SPEAK_HEAD_SYMBOL];
  return { symbolId: SPEAK_HEAD_SYMBOL, ...portrait };
}

if (process.argv[1] && new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href === import.meta.url) {
  const [sourcePath, outputPath] = process.argv.slice(2);
  if (!sourcePath || !outputPath) throw new Error('usage: node tools/extract-tutorial-environment-timeline.mjs <source.swf> <output.json>');
  writeFileSync(outputPath, `${JSON.stringify(extractTutorialEnvironmentTimelines(readFileSync(sourcePath)))}\n`);
}
