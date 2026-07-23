import { inflateSync } from 'node:zlib';
import { readFileSync, writeFileSync } from 'node:fs';

const TWIPS = 20;
const FIXED = 65536;
const TARGET_SYMBOL = 1395;
const TARGET_SHAPE = 1394;

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
  const rect = { xMin: reader.readSBits(bits), xMax: reader.readSBits(bits), yMin: reader.readSBits(bits), yMax: reader.readSBits(bits) };
  reader.align();
  return rect;
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

function hex(value) { return value.toString(16).padStart(2, '0'); }
function readRgba(reader) {
  const color = `#${hex(reader.readUI8())}${hex(reader.readUI8())}${hex(reader.readUI8())}`;
  return { color, opacity: reader.readUI8() / 255 };
}

function readFillStyle(reader) {
  if (reader.readUI8() !== 0) throw new Error('Tutorial DownArrow uses an unsupported non-solid source fill');
  return { type: 'solid', ...readRgba(reader) };
}

function readFillStyles(reader) {
  let count = reader.readUI8();
  if (count === 0xff) count = reader.readUI16();
  const styles = [null];
  for (let index = 0; index < count; index += 1) styles.push(readFillStyle(reader));
  return styles;
}

function readLineStyles(reader) {
  let count = reader.readUI8();
  if (count === 0xff) count = reader.readUI16();
  const styles = [null];
  for (let index = 0; index < count; index += 1) {
    const width = reader.readUI16() / TWIPS;
    reader.readUBits(2); // start cap
    const join = reader.readUBits(2);
    const hasFill = Boolean(reader.readUBits(1));
    reader.readUBits(1); reader.readUBits(1); reader.readUBits(1); reader.readUBits(5); reader.readUBits(1); reader.readUBits(2);
    if (join === 2) reader.readUI16();
    if (hasFill) throw new Error('Tutorial DownArrow uses an unsupported line fill');
    styles.push({ width, ...readRgba(reader) });
  }
  return styles;
}

function samePoint(left, right) { return left.x === right.x && left.y === right.y; }
function reverseEdge(edge) {
  if (edge.edge === 'straight') return { ...edge, from: edge.to, to: edge.from };
  return { ...edge, from: edge.to, control: edge.control, to: edge.from };
}

function joinContours(edges) {
  const remaining = [...edges];
  const contours = [];
  while (remaining.length) {
    const first = remaining.shift();
    const contour = { start: first.from, segments: [{ ...first, from: undefined }], closed: false };
    let end = first.to;
    while (!samePoint(end, contour.start)) {
      let index = remaining.findIndex((edge) => samePoint(edge.from, end));
      let edge = index >= 0 ? remaining.splice(index, 1)[0] : null;
      if (!edge) {
        index = remaining.findIndex((candidate) => samePoint(candidate.to, end));
        if (index < 0) break;
        edge = reverseEdge(remaining.splice(index, 1)[0]);
      }
      contour.segments.push({ ...edge, from: undefined });
      end = edge.to;
    }
    contour.closed = samePoint(end, contour.start);
    contours.push(contour);
  }
  return contours;
}

function parseShape4(body) {
  const reader = new BitReader(body, 2);
  readRect(reader); readRect(reader); reader.readUI8();
  const fills = readFillStyles(reader);
  const lines = readLineStyles(reader);
  let fillBits = reader.readUBits(4);
  let lineBits = reader.readUBits(4);
  let fill0 = 0;
  let fill1 = 0;
  let lineStyle = 0;
  let x = 0;
  let y = 0;
  const fillEdges = new Map();
  const lineEdges = new Map();
  const add = (target, style, edge) => {
    if (!style) return;
    if (!target.has(style)) target.set(style, []);
    target.get(style).push(edge);
  };
  while (true) {
    const type = reader.readUBits(1);
    if (!type) {
      const flags = reader.readUBits(5);
      if (!flags) break;
      if (flags & 1) {
        const bits = reader.readUBits(5);
        x = reader.readSBits(bits); y = reader.readSBits(bits);
      }
      if (flags & 2) fill0 = reader.readUBits(fillBits);
      if (flags & 4) fill1 = reader.readUBits(fillBits);
      if (flags & 8) lineStyle = reader.readUBits(lineBits);
      if (flags & 16) throw new Error('Tutorial DownArrow unexpectedly changes styles mid-shape');
      continue;
    }
    const straight = reader.readUBits(1);
    const bits = reader.readUBits(4) + 2;
    const from = { x: x / TWIPS, y: y / TWIPS };
    let edge;
    if (straight) {
      let dx = 0; let dy = 0;
      if (reader.readUBits(1)) { dx = reader.readSBits(bits); dy = reader.readSBits(bits); }
      else if (reader.readUBits(1)) dy = reader.readSBits(bits);
      else dx = reader.readSBits(bits);
      x += dx; y += dy;
      edge = { edge: 'straight', from, to: { x: x / TWIPS, y: y / TWIPS } };
    } else {
      const controlX = reader.readSBits(bits); const controlY = reader.readSBits(bits);
      const anchorX = reader.readSBits(bits); const anchorY = reader.readSBits(bits);
      const control = { x: (x + controlX) / TWIPS, y: (y + controlY) / TWIPS };
      x += controlX + anchorX; y += controlY + anchorY;
      edge = { edge: 'curve', from, control, to: { x: x / TWIPS, y: y / TWIPS } };
    }
    add(fillEdges, fill0, edge); add(fillEdges, fill1, reverseEdge(edge)); add(lineEdges, lineStyle, edge);
  }
  return {
    fills: [...fillEdges.entries()].map(([style, edges]) => ({ fill: fills[style], contours: joinContours(edges) })),
    lines: [...lineEdges.entries()].map(([style, edges]) => ({ line: lines[style], contours: joinContours(edges) })),
  };
}

function parsePlaceObject2(body) {
  const reader = new BitReader(body);
  const flags = reader.readUI8();
  const depth = reader.readUI16();
  const result = { depth };
  if (flags & 2) result.character = reader.readUI16();
  if (flags & 4) Object.assign(result, readMatrix(reader));
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

function parseSprite(body) {
  const id = body.readUInt16LE(0);
  const frameCount = body.readUInt16LE(2);
  const display = new Map();
  const frames = [];
  for (let offset = 4; offset < body.length;) {
    const tag = readTag(body, offset);
    if (tag.code === 26) {
      const next = parsePlaceObject2(body.subarray(tag.body, tag.next));
      display.set(next.depth, { ...display.get(next.depth), ...next });
    } else if (tag.code === 28) display.delete(body.readUInt16LE(tag.body));
    else if (tag.code === 1) frames.push({ frame: frames.length + 1, items: [...display.values()].sort((left, right) => left.depth - right.depth) });
    else if (tag.code === 0) break;
    offset = tag.next;
  }
  if (frames.length !== frameCount) throw new Error(`Tutorial DownArrow frame count mismatch (${frames.length}/${frameCount})`);
  return { id, frameCount, frames };
}

function uncompress(source) {
  if (!Buffer.isBuffer(source)) source = Buffer.from(source);
  if (source.subarray(0, 3).toString('ascii') === 'FWS') return source;
  if (source.subarray(0, 3).toString('ascii') !== 'CWS') throw new Error('original SWF compression is unavailable');
  return Buffer.concat([Buffer.from(`FWS${String.fromCharCode(source[3])}`, 'binary'), source.subarray(4, 8), inflateSync(source.subarray(8))]);
}

export function extractTutorialDownArrowRuntime(source) {
  const swf = uncompress(source);
  const header = new BitReader(swf, 8);
  readRect(header); header.readUI16(); header.readUI16();
  let sprite = null;
  let shape = null;
  for (let offset = header.byte; offset < swf.length;) {
    const tag = readTag(swf, offset);
    const body = swf.subarray(tag.body, tag.next);
    if (tag.code === 83 && body.readUInt16LE(0) === TARGET_SHAPE) shape = parseShape4(body);
    if (tag.code === 39 && body.readUInt16LE(0) === TARGET_SYMBOL) sprite = parseSprite(body);
    if (tag.code === 0) break;
    offset = tag.next;
  }
  if (!sprite || !shape) throw new Error('original Tutorial DownArrow source is incomplete');
  return { symbolId: sprite.id, frameCount: sprite.frameCount, frames: sprite.frames, shapes: { [TARGET_SHAPE]: shape } };
}

if (process.argv[1] && new URL(`file://${process.argv[1].replaceAll('\\', '/')}`).href === import.meta.url) {
  const [sourcePath, outputPath] = process.argv.slice(2);
  if (!sourcePath || !outputPath) throw new Error('usage: node tools/extract-tutorial-down-arrow-runtime.mjs <source.swf> <output.json>');
  writeFileSync(outputPath, `${JSON.stringify(extractTutorialDownArrowRuntime(readFileSync(sourcePath)))}\n`);
}
