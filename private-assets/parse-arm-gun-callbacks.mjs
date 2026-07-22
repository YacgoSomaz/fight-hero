function frameScriptPairs(source) {
  const call = source.match(/addFrameScript\(([\s\S]*?)\);/);
  if (!call) throw new Error('original arm-gun addFrameScript declaration is unavailable');
  const tokens = call[1].split(',').map((token) => token.trim());
  if (tokens.length % 2) throw new Error('original arm-gun addFrameScript pairs are malformed');
  return Array.from({ length: tokens.length / 2 }, (_, index) => {
    const frameIndex = Number(tokens[index * 2]);
    const handler = tokens[index * 2 + 1].match(/^this\.frame(\d+)$/)?.[1];
    if (!Number.isInteger(frameIndex) || !handler) throw new Error('original arm-gun frame callback is malformed');
    return { frame: frameIndex + 1, handler: Number(handler) };
  });
}

function parentCallback(source, handler) {
  const start = source.indexOf(`internal function frame${handler}()`);
  if (start < 0) throw new Error(`original arm-gun handler frame${handler} is unavailable`);
  const next = source.indexOf('internal function ', start + 1);
  const body = source.slice(start, next < 0 ? source.length : next);
  return body.match(/MovieClip\(parent\)\.(doneShoot|reloadSound|doneReload)\(\)/)?.[1] ?? null;
}

// The source class is the only owner of arm animation callbacks. Keep Flash's
// zero-based addFrameScript positions as one-based visible MovieClip frames.
export function extractArmGunCallbacks(source) {
  if (typeof source !== 'string') throw new Error('original arm-gun ActionScript source is required');
  return Object.freeze(Object.fromEntries(
    frameScriptPairs(source)
      .map(({ frame, handler }) => [frame, parentCallback(source, handler)])
      .filter(([, callback]) => callback),
  ));
}
