// Browser-side display-list walker. `drawShape` is injected so the private
// extraction renderer and an eventual deployment-safe asset renderer can share
// the exact same original matrices without sharing extraction code.
export function drawVectorRuntimeSprite(context, runtime, symbolId, frameNumber, drawShape, options = {}) {
  // FFDec has two faithful export layouts: a graph with `sprites[id]`, and a
  // direct root Sprite object carrying its own `symbolId`/frames. Both are
  // original Display Lists; accepting the root form avoids manufacturing a
  // second wrapper solely for a source asset such as DownArrow_1395.
  const sprite = runtime?.sprites?.[symbolId]
    ?? (runtime?.symbolId === symbolId ? runtime : null);
  if (!sprite) throw new Error(`Sprite ${symbolId} is not present in the vector runtime`);
  const frame = sprite.frames[(Math.max(1, frameNumber) - 1) % sprite.frameCount];
  drawVectorRuntimeFrame(context, runtime, frame.items, drawShape, options);
}

export function drawVectorRuntimeFrame(context, runtime, items, drawShape, options = {}) {
  for (const item of items) {
    context.save();
    context.translate(item.x ?? 0, item.y ?? 0);
    context.transform(item.scaleX ?? 1, item.rotateSkew0 ?? 0, item.rotateSkew1 ?? 0, item.scaleY ?? 1, 0, 0);
    if (runtime.shapes[item.character]) drawShape(context, runtime.shapes[item.character]);
    else if (runtime.sprites[item.character]) drawVectorRuntimeSprite(context, runtime, item.character, options.childFrames?.[item.name] ?? 1, drawShape, options);
    context.restore();
  }
}
