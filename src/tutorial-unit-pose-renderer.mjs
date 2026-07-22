function applyMatrix(context, { scaleX, scaleY, skewX, skewY }) {
  context.transform(scaleX, skewX, skewY, scaleY, 0, 0);
}

function drawShape(context, part, imageFor) {
  const image = imageFor(part.source);
  if (!image) throw new Error(`original Tutorial Shape asset is unavailable: ${part.source}`);
  context.save();
  context.translate(part.root.x, part.root.y);
  applyMatrix(context, part.root);
  if (part.local) {
    context.translate(part.local.x, part.local.y);
    applyMatrix(context, part.local);
  }
  context.drawImage(image, part.crop.xMin, part.crop.yMin);
  context.restore();
}

function drawGun(context, gun, drawGunPart) {
  if (typeof drawGunPart !== 'function') throw new Error('original Tutorial M4 gun renderer is required');
  context.save();
  context.translate(gun.root.x, gun.root.y);
  applyMatrix(context, gun.root);
  context.translate(gun.local.x, gun.local.y);
  applyMatrix(context, gun.local);
  drawGunPart(context, gun);
  context.restore();
}

export function drawTutorialUnitPose(context, pose, { imageFor, drawGun: drawGunPart, drawMuzzle: drawMuzzlePart } = {}) {
  if (typeof imageFor !== 'function') throw new Error('original Tutorial Shape image resolver is required');
  for (const part of [...pose.staticParts, ...pose.armParts]) drawShape(context, part, imageFor);
  for (const gun of pose.gunParts) drawGun(context, gun, drawGunPart);
  if (pose.muzzleParts?.length && typeof drawMuzzlePart !== 'function') throw new Error('original Tutorial USP2 muzzle renderer is required');
  for (const muzzle of pose.muzzleParts ?? []) drawGun(context, muzzle, drawMuzzlePart);
}
