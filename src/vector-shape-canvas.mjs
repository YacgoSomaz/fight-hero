function drawContours(context, contours) {
  for (const contour of contours) {
    context.moveTo(contour.start.x, contour.start.y);
    for (const segment of contour.segments) {
      if (segment.edge === 'curve') context.quadraticCurveTo(segment.control.x, segment.control.y, segment.to.x, segment.to.y);
      else context.lineTo(segment.to.x, segment.to.y);
    }
    if (contour.closed) context.closePath();
  }
}

export function drawRuntimeShape(context, shape) {
  for (const { fill, contours } of shape.fills ?? []) {
    if (fill.type !== 'solid') continue;
    context.save(); context.beginPath();
    drawContours(context, contours);
    context.fillStyle = fill.color;
    if (fill.opacity !== undefined) context.globalAlpha *= fill.opacity;
    context.fill(); context.restore();
  }
  // DefineShape4 LineStyle2 records are visible source artwork.  They must be
  // rendered after fills in SWF draw order, not discarded by the old
  // fill-only vector helper.
  for (const { line, contours } of shape.lines ?? []) {
    context.save(); context.strokeStyle = line.color; context.lineWidth = line.width; context.beginPath();
    drawContours(context, contours);
    if (line.opacity !== undefined) context.globalAlpha *= line.opacity;
    context.stroke(); context.restore();
  }
}
