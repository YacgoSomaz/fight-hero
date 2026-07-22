import { SOURCE_TUTORIAL_SKIN_SHAPES } from './tutorial-skin-shape-source.mjs';
import { drawTutorialM4Gun, drawTutorialUsp2Muzzle } from './tutorial-unit-gun-renderer.mjs';
import { loadTutorialM4PoseRuntime, loadTutorialUsp2MuzzleRuntime } from './tutorial-unit-pose-runtime.mjs';
import { drawRuntimeShape } from './vector-shape-canvas.mjs';

function sourceShapePaths() {
  return [...new Set(Object.values(SOURCE_TUTORIAL_SKIN_SHAPES).flatMap((skin) => Object.values(skin).map(({ source }) => source)))].sort();
}

export async function loadTutorialUnitPoseAssets({ loadImage, fetchImpl } = {}) {
  if (typeof loadImage !== 'function') throw new Error('original Tutorial Shape image loader is required');
  const sources = sourceShapePaths();
  const loaded = await Promise.all(sources.map(async (source) => {
    const image = await loadImage(source);
    if (!image) throw new Error(`original Tutorial Shape asset failed to load: ${source}`);
    return [source, image];
  }));
  const [runtime, muzzleRuntime] = await Promise.all([loadTutorialM4PoseRuntime(fetchImpl), loadTutorialUsp2MuzzleRuntime(fetchImpl)]);
  const images = new Map(loaded);
  return {
    imageFor: (source) => images.get(source),
    drawGun: (context, gun) => drawTutorialM4Gun(context, gun, runtime, drawRuntimeShape),
    drawMuzzle: (context, muzzle) => drawTutorialUsp2Muzzle(context, muzzle, muzzleRuntime, drawRuntimeShape),
    runtime,
    muzzleRuntime,
  };
}
