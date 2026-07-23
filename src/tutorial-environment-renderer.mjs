import { TUTORIAL_ENVIRONMENT_RENDER_SOURCE } from './tutorial-environment-render-plan.mjs';

function applyMatrix(context, matrix) {
  context.transform(matrix.scaleX, matrix.rotateSkew0, matrix.rotateSkew1, matrix.scaleY, 0, 0);
}

function drawDoor(context, door, assets, createCanvas) {
  const { mask, panel } = door;
  const { panel: panelSource } = TUTORIAL_ENVIRONMENT_RENDER_SOURCE.DOOR;
  const buffer = createCanvas(Math.ceil(mask.width), Math.ceil(mask.height));
  buffer.width = Math.ceil(mask.width);
  buffer.height = Math.ceil(mask.height);
  const bufferContext = buffer.getContext('2d');
  if (!bufferContext) throw new Error('Tutorial door mask canvas is unavailable');
  bufferContext.clearRect(0, 0, buffer.width, buffer.height);
  // Shape 1360 has a negative source bounding-box origin.  The original
  // Shape 1359 is a clipDepth=3 mask, so compose the raw vectors in the
  // symbol's own coordinate space before the Arena matrix is applied.
  bufferContext.drawImage(
    assets.doorPanel,
    panel.x + panelSource.xMin - mask.x,
    panel.y + panelSource.yMin - mask.y,
    panel.width,
    panel.height,
  );
  bufferContext.globalCompositeOperation = 'destination-in';
  bufferContext.drawImage(assets.doorMask, 0, 0, mask.width, mask.height);

  context.save();
  context.translate(door.outer.x, door.outer.y);
  applyMatrix(context, door.outer);
  context.drawImage(buffer, mask.x, mask.y);
  context.restore();
}

function drawElevator(context, elevator, assets) {
  const { child } = elevator;
  const { child: childSource } = TUTORIAL_ENVIRONMENT_RENDER_SOURCE.ELEVATOR;
  context.save();
  context.translate(elevator.outer.x, elevator.outer.y);
  applyMatrix(context, elevator.outer);
  context.translate(child.x, child.y);
  applyMatrix(context, child);
  context.drawImage(assets.elevator, childSource.xMin, childSource.yMin, child.width, child.height);
  context.restore();
}

// All artwork is loaded from the extracted source symbols.  The caller passes
// the source-derived plan so scene code cannot animate an independent door or
// leave the elevator visible after its original empty frame 19.
export function drawTutorialEnvironment(context, plan, assets, { createCanvas } = {}) {
  if (!context || !plan || !assets || typeof createCanvas !== 'function') throw new TypeError('Tutorial environment renderer requires source plan, art, and canvas factory');
  if (plan.door) drawDoor(context, plan.door, assets, createCanvas);
  if (plan.elevator) drawElevator(context, plan.elevator, assets);
}
