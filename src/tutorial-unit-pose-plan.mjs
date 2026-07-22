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

// Assigning DisplayObject.rotation in Flash preserves its decomposed scale but
// replaces the matrix's rotation/skew. Unit.as does that to arm1/arm2/head
// after UnitMC.EnterFrame has moved their x/y to the hidden holders.
function applyFlashRotation(root, degrees) {
  if (!Number.isFinite(degrees)) return root;
  const scaleX = Math.hypot(root.scaleX, root.skewX);
  const scaleY = (root.scaleX * root.scaleY - root.skewX * root.skewY) / scaleX;
  const radians = degrees * Math.PI / 180;
  const clean = (value) => Math.abs(value) < 1e-14 ? 0 : value;
  return {
    ...root,
    scaleX: clean(Math.cos(radians) * scaleX),
    skewX: clean(Math.sin(radians) * scaleX),
    skewY: clean(-Math.sin(radians) * scaleY),
    scaleY: clean(Math.cos(radians) * scaleY),
  };
}

function planArm(rootId, action, skinFrame, roots, gunFrame, muzzleFrame, armRotation) {
  const root = applyFlashRotation(enterFrameRoot(roots, rootId), armRotation);
  if (!root || !Array.isArray(action)) throw new Error(`UnitMC ${rootId} root/action data is required`);
  const childFrames = m4SkinChildFrames(skinFrame);
  const armParts = [];
  const gunParts = [];
  const muzzleParts = [];
  for (const item of action) {
    const local = actionTransform(item);
    if (item.name === 'gun') {
      gunParts.push({ rootId, character: item.character, frame: gunFrame ?? childFrames.gun, root, local });
      continue;
    }
    // arm_gun_316 places MuzzleFlash_317 (character 394) at depth 16 only
    // on pistol_fire's first frame.  Its own frame is selected once by the
    // original constructor; it must not be regenerated during canvas paint.
    if (rootId === 'arm1' && item.character === 394 && muzzleFrame) {
      muzzleParts.push({ rootId, character: item.character, frame: muzzleFrame, root, local });
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
  return { armParts, gunParts, muzzleParts };
}

// A source-only pose. It preserves the original root and nested action
// matrices as two transforms; callers must not flatten/round these values.
export function createTutorialUnitPosePlan({ rootFrame, rearAction, frontAction, skinFrame, gunFrame, muzzleFrame, aim } = {}) {
  if (gunFrame !== undefined && (!Number.isInteger(gunFrame) || gunFrame < 1)) throw new Error('original Tutorial gun Sprite frame is required');
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
        root: id === 'head'
          ? applyFlashRotation(enterFrameRoot(roots, id), aim?.headRotation)
          : enterFrameRoot(roots, id),
      };
    });
  const rear = planArm('arm1', rearAction, skinFrame, roots, gunFrame, muzzleFrame, aim?.armRotation);
  const front = planArm('arm2', frontAction, skinFrame, roots, gunFrame, muzzleFrame, aim?.armRotation);
  return {
    flip: Boolean(aim?.flip),
    staticParts,
    armParts: [...rear.armParts, ...front.armParts],
    gunParts: [...rear.gunParts, ...front.gunParts],
    muzzleParts: [...rear.muzzleParts, ...front.muzzleParts],
  };
}
