import assert from 'node:assert/strict';
import test from 'node:test';

import { drawTutorialSpeak } from '../src/tutorial-speak-renderer.mjs';

function canvasSpy() {
  const calls = [];
  return {
    calls,
    save() { calls.push(['save']); },
    restore() { calls.push(['restore']); },
    translate(x, y) { calls.push(['translate', x, y]); },
    transform(a, b, c, d, e, f) { calls.push(['transform', a, b, c, d, e, f]); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
    fillText(...args) { calls.push(['fillText', ...args]); },
    set globalCompositeOperation(value) { calls.push(['composite', value]); },
    set fillStyle(value) { calls.push(['fillStyle', value]); },
    set font(value) { calls.push(['font', value]); },
    set textAlign(value) { calls.push(['textAlign', value]); },
    set textBaseline(value) { calls.push(['textBaseline', value]); },
    set shadowColor(value) { calls.push(['shadowColor', value]); },
    set shadowBlur(value) { calls.push(['shadowBlur', value]); },
  };
}

test('draws original Speak_187 chrome and clips its source portrait with Shape 1483', () => {
  const context = canvasSpy();
  const bufferContext = canvasSpy();
  const buffer = { width: 0, height: 0, getContext: () => bufferContext };
  const assets = {
    chrome: { 1482: { name: '1482' }, 1483: { name: '1483-mask' }, 1484: { name: '1484' } },
    portraits: { 645: { name: '645-scientist' } },
  };
  const plan = {
    holder: { x: 250, y: 15 },
    chrome: [
      { depth: 1, character: 1482, x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
      { depth: 2, character: 1483, clipDepth: 5, x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
      { depth: 6, character: 1484, x: 0, y: 20, scaleX: 1, scaleY: 1, rotateSkew0: 0, rotateSkew1: 0 },
    ],
    portrait: { character: 645, x: 20.2, y: 67.35, scaleX: 2.235107421875, scaleY: 2.235107421875, rotateSkew0: 0.41375732421875, rotateSkew1: -0.41375732421875 },
    text: {
      name: { text: 'Player', x: 184.8, y: 21.25, fontFamily: 'QTypeSquare-Medium', fontPx: 13, align: 'center', color: 'rgb(204, 204, 204)' },
      description: { text: 'Source line', x: 69.35, y: 39.8, fontFamily: 'QTypeSquare-Book_10pt_st', fontPx: 10, align: 'left', color: 'rgb(255, 255, 255)', glow: { color: '#000000', blurX: 5, blurY: 5, strength: 1 } },
    },
  };

  drawTutorialSpeak(context, plan, assets, { createCanvas: () => buffer });

  assert.ok(context.calls.some((call) => call[0] === 'drawImage' && call[1] === assets.chrome[1482]));
  assert.ok(context.calls.some((call) => call[0] === 'drawImage' && call[1] === buffer && call[2] === 250 && call[3] === 15));
  assert.ok(context.calls.some((call) => call[0] === 'drawImage' && call[1] === assets.chrome[1484]));
  assert.ok(bufferContext.calls.some((call) => call[0] === 'drawImage' && call[1] === assets.portraits[645]));
  assert.ok(bufferContext.calls.some((call) => call[0] === 'composite' && call[1] === 'destination-in'));
  assert.ok(bufferContext.calls.some((call) => call[0] === 'drawImage' && call[1] === assets.chrome[1483]));
  assert.ok(context.calls.some((call) => call[0] === 'fillText' && call[1] === 'Player'));
  assert.ok(context.calls.some((call) => call[0] === 'shadowBlur' && call[1] === 5));
});
