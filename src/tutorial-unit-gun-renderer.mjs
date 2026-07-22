import { drawVectorRuntimeSprite } from './vector-runtime-renderer.mjs';

export function drawTutorialM4Gun(context, { character, frame }, runtime, drawShape) {
  if (!runtime?.sprites?.[character]) throw new Error(`original Tutorial M4 gun Sprite is unavailable: ${character}`);
  drawVectorRuntimeSprite(context, runtime, character, frame, drawShape);
}
