export const TUTORIAL_M4_POSE_RUNTIME_URL = './public/assets/m4-vector-runtime.local.json';

export async function loadTutorialM4PoseRuntime(fetchImpl = fetch) {
  const response = await fetchImpl(TUTORIAL_M4_POSE_RUNTIME_URL);
  if (!response?.ok) throw new Error(`original M4 pose runtime failed to load (${response?.status ?? 'network'})`);
  const runtime = await response.json();
  if (!Array.isArray(runtime?.roots) || !runtime.actions?.rifle?.rear || !runtime.actions?.rifle?.front) {
    throw new Error('original M4 pose runtime is missing its decoded arm Display Lists');
  }
  return runtime;
}
