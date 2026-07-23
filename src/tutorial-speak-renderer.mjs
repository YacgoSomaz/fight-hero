function applyMatrix(context, item) {
  context.translate(item.x, item.y);
  context.transform(item.scaleX, item.rotateSkew0, item.rotateSkew1, item.scaleY, 0, 0);
}

function drawItem(context, item, image) {
  context.save();
  applyMatrix(context, item);
  context.drawImage(image, 0, 0);
  context.restore();
}

function drawText(context, field) {
  context.fillStyle = field.color;
  context.font = `${field.fontPx}px "${field.fontFamily}"`;
  context.textAlign = field.align;
  context.textBaseline = 'top';
  if (field.glow) {
    context.shadowColor = field.glow.color;
    // Flash's source blurX/blurY are retained as the Canvas shadow radius;
    // canvas has one blur axis, so do not manufacture an unrelated effect.
    context.shadowBlur = Math.max(field.glow.blurX, field.glow.blurY) * field.glow.strength;
  }
  context.fillText(field.text, field.x, field.y);
  if (field.glow) {
    context.shadowColor = 'transparent';
    context.shadowBlur = 0;
  }
}

// Speak_187's depth 2 Shape 1483 is a clipDepth=5 mask.  Its portrait at
// depth 3 must therefore be composed before the chrome at depth 6, rather
// than rendered as an unmasked DOM or Canvas image.
export function drawTutorialSpeak(context, plan, assets, { createCanvas } = {}) {
  if (!context || !plan || !assets?.chrome || !assets?.portraits || typeof createCanvas !== 'function') {
    throw new TypeError('Tutorial Speak renderer requires source plan, source art, and canvas factory');
  }
  const [back, mask, front] = plan.chrome;
  const backImage = assets.chrome[back?.character];
  const maskImage = assets.chrome[mask?.character];
  const frontImage = assets.chrome[front?.character];
  const portraitImage = assets.portraits[plan.portrait?.character];
  if (!backImage || !maskImage || !frontImage || !portraitImage) throw new Error('original Speak source art is unavailable');

  const portraitCanvas = createCanvas(100, 100);
  portraitCanvas.width = 100;
  portraitCanvas.height = 100;
  const portraitContext = portraitCanvas.getContext('2d');
  if (!portraitContext) throw new Error('Tutorial Speak portrait mask canvas is unavailable');
  drawItem(portraitContext, plan.portrait, portraitImage);
  portraitContext.globalCompositeOperation = 'destination-in';
  drawItem(portraitContext, mask, maskImage);

  context.save();
  context.translate(plan.holder.x, plan.holder.y);
  drawItem(context, back, backImage);
  context.drawImage(portraitCanvas, 0, 0);
  drawItem(context, front, frontImage);
  drawText(context, plan.text.name);
  drawText(context, plan.text.description);
  context.restore();
}
