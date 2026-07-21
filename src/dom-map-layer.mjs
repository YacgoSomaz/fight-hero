// Convert the exact source-image crop used by the Canvas renderer into a DOM
// image layout.  Keeping the original raw bitmap (including FFDec stage
// padding) is important: crop.x/y determines where its authored pixels land.
export function getDomMapLayerLayout({ naturalWidth, naturalHeight, crop, source, world, viewport, followsCamera }) {
  const scaleX = followsCamera
    ? viewport.width / source.width * world.width / crop.width
    : viewport.width / crop.width;
  const scaleY = followsCamera
    ? viewport.height / source.height * world.height / crop.height
    : viewport.height / crop.height;
  const cameraX = followsCamera ? source.x / world.width * crop.width : 0;
  const cameraY = followsCamera ? source.y / world.height * crop.height : 0;
  return {
    width: naturalWidth * scaleX,
    height: naturalHeight * scaleY,
    left: -(crop.x + cameraX) * scaleX,
    top: -(crop.y + cameraY) * scaleY,
  };
}
