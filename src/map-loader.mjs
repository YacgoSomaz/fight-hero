function browserImage() { return new Image(); }

function loadLayer(source, makeImage) {
  return new Promise((resolve, reject) => {
    const image = makeImage();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`原始地图资源加载失败：${source}`));
    image.src = source;
    // Cached browser images can be complete before the handlers are assigned.
    if (image.complete) {
      if (image.naturalWidth) resolve(image);
      else reject(new Error(`原始地图资源加载失败：${source}`));
    }
  });
}

// Never mutate the images currently being rendered.  A new map becomes active
// only after its original sky, backdrop and Arena foreground all finished.
export async function loadMapLayers(visual, makeImage = browserImage) {
  const [sky, map, terrain] = await Promise.all([
    loadLayer(visual.sky, makeImage),
    loadLayer(visual.background, makeImage),
    loadLayer(visual.terrain, makeImage),
  ]);
  return { sky, map, terrain };
}

// A timeline wall is a single original SWF symbol with multiple source frames.
// Keep frame metadata paired with its loaded image so a source transition can
// switch its collision image atomically later on.
export async function loadSourceWallFrames(source, makeImage = browserImage) {
  const images = await Promise.all(source.frames.map(({ file }) => loadLayer(file, makeImage)));
  return source.frames.map((frame, index) => ({ ...frame, image: images[index] }));
}
