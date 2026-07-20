// Decoded directly from Arena (symbol 1413), labelled frame 2 "Foundry".
// Coordinates are SWF twips converted to pixels.  The 1268 instances are
// NodeWaypoint and the 1273 instances are NodeJump; the connection markers
// (1276) deliberately remain data-only and are not drawn.
export const FOUNDRY_LAYOUT = Object.freeze({
  width: 2874,
  height: 863,
  navigation: Object.freeze([
    ['waypoint', 276.8, 216.8], ['waypoint', 305.8, 590.75], ['waypoint', 517.8, 424.75],
    ['waypoint', 619.75, 545.75], ['waypoint', 549.75, 630.75], ['waypoint', 1131.7, 383.75],
    ['waypoint', 1408.7, 387.75], ['waypoint', 1149.7, 615.7], ['waypoint', 1389.7, 618.7],
    ['waypoint', 1726.7, 604.7], ['waypoint', 2447.65, 520.75], ['waypoint', 2190.7, 488.75],
    ['waypoint', 2008.7, 484.75], ['waypoint', 1928.7, 352.75], ['waypoint', 2653.65, 433.75],
    ['waypoint', 2344.7, 625.75], ['waypoint', 2206.7, 293.75], ['waypoint', 636.8, 336.75],
    ['waypoint', 547.95, 666.9], ['waypoint', 1440.4, 635.4], ['waypoint', 1110.9, 630.9],
    ['jump', 127.05, 704.25], ['jump', 486, 703.25], ['jump', 968, 701.25], ['jump', 1576, 701.25],
    ['jump', 1689.05, 666.25], ['jump', 1865, 702.25], ['jump', 2333, 702.25], ['jump', 2488, 584.3],
    ['jump', 2714, 506.3], ['jump', 2427, 352.3], ['jump', 2095.05, 553.3], ['jump', 1771.05, 412.3],
    ['jump', 826.1, 413.3], ['jump', 478.1, 496.3], ['jump', 474.1, 306.3], ['jump', 730.1, 607.25],
    ['jump', 267.1, 659.2],
  ].map(([type, x, y]) => Object.freeze({ type, x, y }))),
  spawns: Object.freeze({ p1: Object.freeze({ x: 486, y: 703.25 }), p2: Object.freeze({ x: 2333, y: 702.25 }) }),
});
