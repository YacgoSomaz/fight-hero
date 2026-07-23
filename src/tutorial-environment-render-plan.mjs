const DOOR = Object.freeze({
  symbolId: 1361,
  outer: Object.freeze({ x: 1658.1, y: 1226.6, scaleX: 1, scaleY: 1.0455322, rotateSkew0: -0.019729614, rotateSkew1: 0 }),
  mask: Object.freeze({ symbolId: 1359, assetSrc: './public/assets/original-swf/tutorial-environment/1359.svg', x: -2.7, y: -3.75, width: 85.7, height: 132.95 }),
  panel: Object.freeze({ symbolId: 1360, assetSrc: './public/assets/original-swf/tutorial-environment/1360.svg', xMin: -41.25, yMin: -66.5, width: 82.5, height: 129.75 }),
});

const ELEVATOR = Object.freeze({
  symbolId: 1388,
  outer: Object.freeze({ x: 2517.35, y: 576.05, scaleX: 1, scaleY: 1, rotateSkew0: -0.22038269, rotateSkew1: 0 }),
  child: Object.freeze({ symbolId: 1387, assetSrc: './public/assets/original-swf/tutorial-environment/1387.svg', xMin: -30, yMin: -70.2, width: 60, height: 140.45 }),
});

function sourceFrame(timeline, frame, symbolId) {
  if (!Number.isInteger(frame) || frame < 1 || frame > timeline.frameCount) throw new RangeError(`Tutorial environment frame is unavailable: ${symbolId}/${frame}`);
  return timeline.frames[frame - 1];
}

function childFor(frame, symbolId) {
  const child = frame.items.find((item) => item.character === symbolId);
  return child ?? null;
}

function worldOuter(outer, arenaPosition) {
  return {
    x: arenaPosition.x + outer.x,
    y: arenaPosition.y + outer.y,
    scaleX: outer.scaleX,
    scaleY: outer.scaleY,
    rotateSkew0: outer.rotateSkew0,
    rotateSkew1: outer.rotateSkew1,
  };
}

// Converts the source Arena placements plus nested MovieClip frame records
// into Canvas-friendly source art instructions. It never substitutes a CSS
// platform: the frame itself decides when the elevator is absent.
export function getTutorialEnvironmentRenderPlan(environment, timelines, arenaPosition) {
  if (!environment?.door || !environment?.elevator) throw new TypeError('Tutorial environment state is required');
  if (!timelines?.[DOOR.symbolId] || !timelines?.[ELEVATOR.symbolId]) throw new TypeError('Tutorial environment timelines are required');
  if (!arenaPosition || !Number.isFinite(arenaPosition.x) || !Number.isFinite(arenaPosition.y)) throw new TypeError('Tutorial Arena position is required');

  const doorFrame = sourceFrame(timelines[DOOR.symbolId], environment.door.frame, DOOR.symbolId);
  const panel = childFor(doorFrame, DOOR.panel.symbolId);
  if (!panel) throw new Error(`Tutorial door panel is unavailable on frame ${environment.door.frame}`);
  const elevatorFrame = sourceFrame(timelines[ELEVATOR.symbolId], environment.elevator.frame, ELEVATOR.symbolId);
  const elevatorChild = childFor(elevatorFrame, ELEVATOR.child.symbolId);

  return {
    door: {
      symbolId: DOOR.symbolId,
      frame: environment.door.frame,
      outer: worldOuter(DOOR.outer, arenaPosition),
      mask: { ...DOOR.mask },
      panel: {
        symbolId: DOOR.panel.symbolId,
        assetSrc: DOOR.panel.assetSrc,
        x: panel.x,
        y: panel.y,
        width: DOOR.panel.width,
        height: DOOR.panel.height,
        scaleX: panel.scaleX,
        scaleY: panel.scaleY,
        rotateSkew0: panel.rotateSkew0,
        rotateSkew1: panel.rotateSkew1,
      },
    },
    elevator: elevatorChild && {
      symbolId: ELEVATOR.symbolId,
      frame: environment.elevator.frame,
      outer: worldOuter(ELEVATOR.outer, arenaPosition),
      child: {
        symbolId: ELEVATOR.child.symbolId,
        assetSrc: ELEVATOR.child.assetSrc,
        x: elevatorChild.x,
        y: elevatorChild.y,
        width: ELEVATOR.child.width,
        height: ELEVATOR.child.height,
        scaleX: elevatorChild.scaleX,
        scaleY: elevatorChild.scaleY,
        rotateSkew0: elevatorChild.rotateSkew0,
        rotateSkew1: elevatorChild.rotateSkew1,
      },
    },
  };
}

export const TUTORIAL_ENVIRONMENT_RENDER_SOURCE = Object.freeze({ DOOR, ELEVATOR });
