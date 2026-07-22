import assert from 'node:assert/strict';
import test from 'node:test';

import { createFoundryForegroundDomLayer, renderFoundryForegroundDomLayer } from '../src/foundry-foreground-dom.mjs';

function fakeDocument({ canonicalizeSrc = false } = {}) {
  return {
    createElement(tagName) {
      const element = {
        tagName,
        className: '',
        dataset: {},
        style: {},
        children: [],
        replaceChildren(...children) { this.children = children; },
      };
      if (tagName === 'img' && canonicalizeSrc) {
        let source = '';
        element.sourceAssignments = 0;
        Object.defineProperty(element, 'src', {
          get() { return source; },
          set(value) { element.sourceAssignments += 1; source = new URL(value, 'http://127.0.0.1:4173/').href; },
        });
      }
      return element;
    },
  };
}

test('Foundry foreground DOM layer contains only original child artwork in original depth order', () => {
  const node = createFoundryForegroundDomLayer(fakeDocument());
  const layers = [
    { depth: 1, character: 1242, frame: 1, type: 'png', source: 'base.png', left: -10, top: -20, width: 3102, height: 947 },
    { depth: 2, character: 1252, frame: 32, type: 'svg', source: 'water.svg', left: 100, top: 560, width: 302, height: 97.35 },
    { depth: 7, character: 1258, frame: 32, type: 'svg', source: 'pot.svg', left: 30, top: -220, width: 550.95, height: 904.35 },
  ];

  renderFoundryForegroundDomLayer(node, layers);

  assert.deepEqual({ className: node.className, mapLayer: node.dataset.mapLayer, sourceType: node.dataset.sourceType }, {
    className: 'map-layer foundry-foreground-layer', mapLayer: 'terrain', sourceType: 'foundry-display-list',
  });
  assert.deepEqual(node.children.map((image) => ({
    source: image.src, depth: image.dataset.sourceDepth, character: image.dataset.sourceCharacter, frame: image.dataset.sourceFrame,
    left: image.style.left, top: image.style.top, width: image.style.width, height: image.style.height,
  })), [
    { source: 'base.png', depth: '1', character: '1242', frame: '1', left: '-10px', top: '-20px', width: '3102px', height: '947px' },
    { source: 'water.svg', depth: '2', character: '1252', frame: '32', left: '100px', top: '560px', width: '302px', height: '97.35px' },
    { source: 'pot.svg', depth: '7', character: '1258', frame: '32', left: '30px', top: '-220px', width: '550.95px', height: '904.35px' },
  ]);
});

test('Foundry foreground DOM layer rejects a partial or unordered Display List', () => {
  const node = createFoundryForegroundDomLayer(fakeDocument());
  assert.throws(() => renderFoundryForegroundDomLayer(node, [{ depth: 7 }]), /three original child layers/);
});

test('Foundry foreground does not reload an unchanged relative source after the browser canonicalizes image.src', () => {
  const node = createFoundryForegroundDomLayer(fakeDocument({ canonicalizeSrc: true }));
  const layers = [
    { depth: 1, character: 1242, frame: 1, type: 'png', source: './public/assets/original-swf/foundry-foreground-1242/1.png', left: 0, top: 0, width: 1, height: 1 },
    { depth: 2, character: 1252, frame: 1, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1252-svg/1.svg', left: 0, top: 0, width: 1, height: 1 },
    { depth: 7, character: 1258, frame: 1, type: 'svg', source: './public/assets/original-swf/foundry-foreground-1258-svg/1.svg', left: 0, top: 0, width: 1, height: 1 },
  ];

  renderFoundryForegroundDomLayer(node, layers);
  renderFoundryForegroundDomLayer(node, layers);

  assert.deepEqual(node.children.map((image) => image.sourceAssignments), [1, 1, 1]);
});
