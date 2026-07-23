// Canvas `source-in` replaces every destination pixel outside the source
// shape.  Flash ColorTransform affects only the DisplayObject being drawn,
// so reproduce it in an isolated bitmap before compositing it back into the
// Arena/Hud canvas.
export function createSourceTintedCanvas({
  image,
  source,
  colour,
  alpha = 1,
  createCanvas,
} = {}) {
  if (!image || !source || typeof createCanvas !== 'function') {
    throw new TypeError('source tint requires an original image, source bounds, and canvas factory');
  }
  if (![source.x, source.y, source.width, source.height].every(Number.isFinite) || !(source.width > 0) || !(source.height > 0)) {
    throw new RangeError('source tinted image requires positive original bounds');
  }
  const buffer = createCanvas(Math.ceil(source.width), Math.ceil(source.height));
  buffer.width = Math.ceil(source.width);
  buffer.height = Math.ceil(source.height);
  const bufferContext = buffer.getContext('2d');
  if (!bufferContext) throw new Error('source tint buffer context is unavailable');
  bufferContext.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  bufferContext.globalCompositeOperation = 'source-in';
  bufferContext.globalAlpha = alpha;
  bufferContext.fillStyle = colour;
  bufferContext.fillRect(0, 0, source.width, source.height);
  return buffer;
}

export function drawSourceTintedImage(context, options = {}) {
  const { destination } = options;
  if (!context || !destination || ![destination.x, destination.y, destination.width, destination.height].every(Number.isFinite)
    || !(destination.width > 0) || !(destination.height > 0)) {
    throw new TypeError('source tinted image requires a world context and positive destination bounds');
  }
  const buffer = createSourceTintedCanvas(options);
  context.drawImage(buffer, destination.x, destination.y, destination.width, destination.height);
}
