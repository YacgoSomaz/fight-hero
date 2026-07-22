import { m4SkinChildFrames } from './m4-skin-child-frames.mjs';
import { tutorialSkinShape } from './tutorial-skin-shape-source.mjs';
import { tutorialSkinShapeBounds } from './tutorial-skin-shape-bounds-source.mjs';

const STATIC_ROOT_PARTS = new Set(['foot2', 'leglow2', 'legup2', 'foot1', 'leglow1', 'legup1', 'body', 'head']);
const ARM_PATH = Object.freeze({
  'arm1:arm2up': 'arm1.arm2up',
  'arm1:arm2low': 'arm1.arm2low',
  'arm1:hand2': 'arm1.hand2',
  'arm2:arm1up': 'arm2.arm1up',
  'arm2:arm1low': 'arm2.arm1low',
  'arm2:hand1': 'arm2.hand1',
});

function rootTransform([, x, y, scaleX, scaleY, skewX, skewY]) {
  return { x, y, scaleX, scaleY, skewX, skewY };
}

function actionTransform({ x, y, scaleX, scaleY, rotateSkew0, rotateSkew1 }) {
  return { x, y, scaleX, scaleY, skewX: rotateSkew0, skewY: rotateSkew1 };
}

function rootFrameItems(rootFrame) {
  if (!Array.isArray(rootFrame)) throw new Error('A decoded UnitMC root frame is required');
  return new Map(rootFrame.map((item) => [item[0], rootTransform(item)]));
}

// UnitMC.EnterFrame() replaces only x/y of these visible clips with their
// authored hidden holder clips. Scale and skew remain on the visible child.
function enterFrameRoot(roots, id) {
  const root = roots.get(id);
  const holder = id === 'head' ? roots.get('headhold') : (id === 'arm1' || id === 'arm2' ? roots.get('arm1hold') : null);
  if (!root) return null;
  return holder ? { ...root, x: holder.x, y: holder.y } : root;
}

function planArm(rootId, action, skinFrame, roots) {
  const root = enterFrameRoot(roots, rootId);
  if (!root || !Array.isArray(action)) throw new Error(`UnitMC ${rootId} root/action data is required`);
  const childFrames = m4SkinChildFrames(skinFrame);
  const armParts = [];
  const gunParts = [];
  for (const item of action) {
    const local = actionTransform(item);
    if (item.name === 'gun') {
      gunParts.push({ rootId, character: item.character, frame: childFrames.gun, root, local });
      continue;
    }
    const path = ARM_PATH[`${rootId}:${item.name}`];
    if (!path) continue;
    const shape = tutorialSkinShape(path, skinFrame);
    armParts.push({
      id: path,
      character: shape.character,
      source: shape.source,
      crop: tutorialSkinShapeBounds(path, skinFrame),
      frame: childFrames[item.name],
      root,
      local,
    });
  }
  return { armParts, gunParts };
}

// A source-only pose. It preserves the original root and nested action
// matrices as two transforms; callers must not flatten/round these values.
export function createTutorialUnitPosePlan({ rootFrame, rearAction, frontAction, skinFrame } = {}) {
  const roots = rootFrameItems(rootFrame);
  const staticParts = rootFrame
    .filter(([id]) => STATIC_ROOT_PARTS.has(id))
    .map(([id]) => {
      const shape = tutorialSkinShape(id, skinFrame);
      return {
        id,
        character: shape.character,
        source: shape.source,
        crop: tutorialSkinShapeBounds(id, skinFrame),
        root: enterFrameRoot(roots, id),
      };
    });
  const rear = planArm('arm1', rearAction, skinFrame, roots);
  const front = planArm('arm2', frontAction, skinFrame, roots);
  return {
    staticParts,
    armParts: [...rear.armParts, ...front.armParts],
    gunParts: [...rear.gunParts, ...front.gunParts],
  };
}
