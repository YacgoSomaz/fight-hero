// Arena.Init() creates the physics BitmapData from wallMC before the match
// begins.  Prepare the visual layers and that same source wall together, then
// expose a world only after both resources are ready.
export async function prepareSourceMapWorld({
  options,
  createWorld,
  getMapVisual,
  getMapLayerCrop,
  loadMapLayers,
  loadSourceWallMask,
}) {
  const mapId = options.mapId ?? (options.foundry ? 'foundry' : 'foundry');
  const visual = getMapVisual(mapId);
  const [layers, wall] = await Promise.all([
    loadMapLayers(visual),
    loadSourceWallMask(mapId),
  ]);
  layers.sky.sourceCrop = getMapLayerCrop(visual.sky);
  layers.map.sourceCrop = getMapLayerCrop(visual.background);
  layers.terrain.sourceCrop = getMapLayerCrop(visual.terrain);
  const world = createWorld(options);
  world.wall = wall.mask;
  world.wallSource = Object.freeze({ characterId: wall.source.characterId, frame: wall.frame });
  world.wallFrames = Object.freeze(wall.masks ?? [Object.freeze({ frame: wall.frame, mask: wall.mask })]);
  return Object.freeze({ mapId, visual, layers, wall, world });
}
