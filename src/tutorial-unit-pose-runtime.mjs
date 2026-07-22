export const TUTORIAL_M4_POSE_RUNTIME_URL = './public/assets/m4-vector-runtime.local.json';
export const TUTORIAL_USP2_MUZZLE_RUNTIME_URL = './public/assets/usp2-muzzle-flash-runtime.local.json';

export async function loadTutorialM4PoseRuntime(fetchImpl = fetch) {
  const response = await fetchImpl(TUTORIAL_M4_POSE_RUNTIME_URL);
  if (!response?.ok) throw new Error(`original M4 pose runtime failed to load (${response?.status ?? 'network'})`);
  const runtime = await response.json();
  if (!Array.isArray(runtime?.roots) || !runtime.actions?.rifle?.rear || !runtime.actions?.rifle?.front) {
    throw new Error('original M4 pose runtime is missing its decoded arm Display Lists');
  }
  return runtime;
}

export async function loadTutorialUsp2MuzzleRuntime(fetchImpl = fetch) {
  const response = await fetchImpl(TUTORIAL_USP2_MUZZLE_RUNTIME_URL);
  if (!response?.ok) throw new Error(`original USP2 muzzle runtime failed to load (${response?.status ?? 'network'})`);
  const runtime = await response.json();
  if (runtime?.symbolId !== 394 || runtime?.frameCount !== 8 || !Array.isArray(runtime?.frames) || runtime.frames.length !== 8 || !runtime?.shapes) {
    throw new Error('original USP2 MuzzleFlash Display List is missing');
  }
  return runtime;
}
