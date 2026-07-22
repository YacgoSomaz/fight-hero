const DOM_LAYERS = new WeakMap();
const SOURCE_DEPTHS = Object.freeze([1, 2, 7]);

function requireOriginalLayers(layers) {
  if (!Array.isArray(layers) || layers.length !== SOURCE_DEPTHS.length || !layers.every((layer, index) => layer?.depth === SOURCE_DEPTHS[index])) {
    throw new TypeError('Foundry foreground requires its three original child layers in source depth order');
  }
}

export function createFoundryForegroundDomLayer(documentRef) {
  const container = documentRef.createElement('div');
  container.className = 'map-layer foundry-foreground-layer';
  container.dataset.mapLayer = 'terrain';
  container.dataset.sourceType = 'foundry-display-list';
  const images = SOURCE_DEPTHS.map(() => {
    const image = documentRef.createElement('img');
    image.className = 'foundry-foreground-part';
    image.alt = '';
    image.draggable = false;
    return image;
  });
  container.replaceChildren(...images);
  DOM_LAYERS.set(container, images);
  return container;
}

export function renderFoundryForegroundDomLayer(container, layers) {
  requireOriginalLayers(layers);
  const images = DOM_LAYERS.get(container);
  if (!images) throw new TypeError('Foundry foreground layer was not created by createFoundryForegroundDomLayer');
  for (let index = 0; index < layers.length; index += 1) {
    const layer = layers[index];
    const image = images[index];
    // HTMLImageElement.src is normalized to an absolute URL by the browser;
    // compare the authored source token retained on the node so a stationary
    // source frame does not reload every render tick.
    if (image.dataset.sourceUrl !== layer.source) {
      image.src = layer.source;
      image.dataset.sourceUrl = layer.source;
    }
    image.dataset.sourceDepth = String(layer.depth);
    image.dataset.sourceCharacter = String(layer.character);
    image.dataset.sourceFrame = String(layer.frame);
    Object.assign(image.style, {
      left: `${layer.left}px`, top: `${layer.top}px`, width: `${layer.width}px`, height: `${layer.height}px`,
    });
  }
  return container;
}
