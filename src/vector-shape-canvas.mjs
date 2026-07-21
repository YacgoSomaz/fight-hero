export function drawRuntimeShape(context, shape) {
  for (const { fill, contours } of shape.fills) {
    if (fill.type !== 'solid') continue;
    context.save(); context.beginPath();
    for (const contour of contours) {
      context.moveTo(contour.start.x, contour.start.y);
      for (const segment of contour.segments) {
        if (segment.edge === 'curve') context.quadraticCurveTo(segment.control.x, segment.control.y, segment.to.x, segment.to.y);
        else context.lineTo(segment.to.x, segment.to.y);
      }
      if (contour.closed) context.closePath();
    }
    context.fillStyle = fill.color;
    if (fill.opacity !== undefined) context.globalAlpha *= fill.opacity;
    context.fill(); context.restore();
  }
}
