import { drawVectorRuntimeFrame, drawVectorRuntimeSprite } from './vector-runtime-renderer.mjs';

export function drawTutorialM4Gun(context, { character, frame }, runtime, drawShape) {
  if (!runtime?.sprites?.[character]) throw new Error(`original Tutorial M4 gun Sprite is unavailable: ${character}`);
  drawVectorRuntimeSprite(context, runtime, character, frame, drawShape);
}

export function drawTutorialUsp2Muzzle(context, { character, frame }, runtime, drawShape) {
  if (character !== 394 || !runtime?.frames?.[frame - 1]) throw new Error(`original Tutorial USP2 muzzle frame is unavailable: ${frame}`);
  drawVectorRuntimeFrame(context, runtime, runtime.frames[frame - 1].items, drawShape);
}
