import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// User journey: when I open a match, its visible stage has the original SWF
// 800×600 4:3 coordinate space instead of widening the map to a 16:9 page.
test('the runtime stage follows the original SWF 800 by 600 display rectangle', async () => {
  const [header, html, css] = await Promise.all([
    readFile(new URL('../assets/reverse/ffdec-deep-20260720/header.txt', import.meta.url), 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../style.css', import.meta.url), 'utf8'),
  ]);

  assert.match(header, /widthPx=800/);
  assert.match(header, /heightPx=600/);
  assert.match(header, /frameRate=30/);
  assert.match(html, /<canvas id="game" width="800" height="600"/);
  assert.match(css, /main\s*\{[^}]*width:min\(800px,100vw\)/);
  assert.match(css, /#mapBackdrop\{[^}]*aspect-ratio:4\/3/);
  assert.match(css, /canvas\s*\{[^}]*aspect-ratio:4\/3/);
  assert.match(css, /#actorOverlay\{[^}]*aspect-ratio:4\/3/);
});
