import { FOUNDRY_FOREGROUND_SOURCE } from './foundry-foreground-source.mjs';
import { FOUNDRY_FOREGROUND_SVG_SOURCE } from './foundry-foreground-svg-source.mjs';

const base = FOUNDRY_FOREGROUND_SOURCE.layers.find(({ character }) => character === 1242);
const svgLayers = new Map(FOUNDRY_FOREGROUND_SVG_SOURCE.map((layer) => [layer.character, layer]));

function requireFrame(character, frame, frames) {
  if (!Number.isInteger(frame) || frame < 1 || frame > frames) throw new RangeError(`Foundry ${character} frame ${frame} is outside the original ${frames}-frame timeline`);
}

function place({ depth, character, frame, type, source, matrix, viewport }, camera, stage) {
  const scaleX = stage.width / camera.width;
  const scaleY = stage.height / camera.height;
  return Object.freeze({
    depth, character, frame, type, source,
    left: (matrix.x + matrix.a * viewport.x - camera.x) * scaleX,
    top: (matrix.y + matrix.d * viewport.y - camera.y) * scaleY,
    width: viewport.width * matrix.a * scaleX,
    height: viewport.height * matrix.d * scaleY,
  });
}

// Produces CSS-pixel placements from original Flash coordinates.  This is a
// layer plan only: rendering and source timeline advancement remain separate
// so that no frame can be guessed or silently substituted.
export function getFoundryForegroundLayout({ source, viewport, waterFrame = 1, potFrame = 1 }) {
  requireFrame(1252, waterFrame, 76);
  requireFrame(1258, potFrame, 306);
  const water = svgLayers.get(1252);
  const pot = svgLayers.get(1258);
  return Object.freeze([
    place({
      depth: base.depth, character: base.character, frame: 1, type: 'png', source: `${base.source}/1.png`,
      matrix: base.matrix, viewport: { width: base.width, height: base.height, x: -154.6, y: -68 },
    }, source, viewport),
    place({
      depth: 2, character: water.character, frame: waterFrame, type: 'svg', source: `${water.source}/${waterFrame}.svg`,
      matrix: FOUNDRY_FOREGROUND_SOURCE.layers.find(({ character }) => character === water.character).matrix, viewport: water.viewport,
    }, source, viewport),
    place({
      depth: 7, character: pot.character, frame: potFrame, type: 'svg', source: `${pot.source}/${potFrame}.svg`,
      matrix: FOUNDRY_FOREGROUND_SOURCE.layers.find(({ character }) => character === pot.character).matrix, viewport: pot.viewport,
    }, source, viewport),
  ]);
}
