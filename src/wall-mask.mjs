// Flash Movement.hitTest() accepts a collision pixel only when
// BitmapData.getPixel32(...).alpha equals 0xff.  This is intentionally more
// precise than using any visible/non-transparent mask colour.
export function createFlashWallMask({ width, height, data }) {
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new TypeError('wall mask dimensions must be positive integers');
  }
  if (!data || data.length !== width * height * 4) {
    throw new TypeError('wall mask must contain RGBA data for every pixel');
  }
  return Object.freeze({
    width,
    height,
    isSolid(x, y) {
      const pixelX = Math.floor(x);
      const pixelY = Math.floor(y);
      if (pixelX < 0 || pixelY < 0 || pixelX >= width || pixelY >= height) return false;
      return data[(pixelY * width + pixelX) * 4 + 3] === 255;
    },
  });
}

// The original Arena wall is an ARGB BitmapData.  Movement uses alpha ff as
// collision, while Unit/Bullet also retain the RGB suffix for tutorial and
// environment triggers.  Do not collapse this source data to a boolean mask.
export function createFlashWallSurface({ width, height, data }) {
  const mask = createFlashWallMask({ width, height, data });
  return Object.freeze({
    ...mask,
    colorAt(x, y) {
      const pixelX = Math.floor(x);
      const pixelY = Math.floor(y);
      if (pixelX < 0 || pixelY < 0 || pixelX >= width || pixelY >= height) return '';
      const offset = (pixelY * width + pixelX) * 4;
      if (data[offset + 3] !== 255) return '';
      return [data[offset], data[offset + 1], data[offset + 2]]
        .map((value) => value.toString(16).padStart(2, '0')).join('');
    },
  });
}

export function decodeFlashWallImage(image, documentRef = globalThis.document) {
  if (!image?.naturalWidth || !image?.naturalHeight) throw new TypeError('wall image must be loaded');
  const canvas = documentRef.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  return createFlashWallSurface(context.getImageData(0, 0, canvas.width, canvas.height));
}
