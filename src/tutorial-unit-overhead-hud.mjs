// Direct source record: Unit is symbol 687. Its first-frame Display List
// places bar_hp (symbol 670) at depth 1 with matrix
// `c9 45 3f 27 2f 0c de 4a 0b`; decoding that SWF MATRIX yields x=-27,
// y=-76.25 and scaleY=0.61224365234375. Status.setBars() changes only
// `bar_hp.width`, so the source x/y and transformed height remain authored.
export const TUTORIAL_UNIT_BAR = Object.freeze({
  assetSrc: './public/assets/original-swf/unit-bar-670.png',
  symbolId: 670,
  sourceWidth: 47,
  sourceHeight: 5,
  localX: -27,
  localY: -76.25,
  scaleY: 0.61224365234375,
});

// Exact ColorTransform.color values from Unit.as constructor / setTeam().
const TEAM_BAR_COLOURS = Object.freeze({
  0: Object.freeze({ human: 3407667, bot: 39168 }),
  1: Object.freeze({ human: 3381708, bot: 26367 }),
  2: Object.freeze({ human: 13395456, bot: 13395456 }),
});

function sourceColourToHex(colour) {
  return `#${colour.toString(16).padStart(6, '0')}`;
}

// This keeps the source contract narrow: a spawned Unit already owns a Status
// instance, and Status.setBars() owns barHpWidth. There is deliberately no
// generic health calculation, label substitute, or invented placement here.
export function getTutorialUnitOverheadBar(unit, screen) {
  const sourceColours = TEAM_BAR_COLOURS[unit.team];
  if (!sourceColours) throw new Error(`original Unit.setTeam has no bar colour for team: ${unit.team}`);
  const colour = unit.human ? sourceColours.human : sourceColours.bot;
  return {
    assetSrc: TUTORIAL_UNIT_BAR.assetSrc,
    symbolId: TUTORIAL_UNIT_BAR.symbolId,
    sourceWidth: TUTORIAL_UNIT_BAR.sourceWidth,
    sourceHeight: TUTORIAL_UNIT_BAR.sourceHeight,
    x: screen.x + TUTORIAL_UNIT_BAR.localX,
    y: screen.y + TUTORIAL_UNIT_BAR.localY,
    width: unit.status.barHpWidth,
    height: TUTORIAL_UNIT_BAR.sourceHeight * TUTORIAL_UNIT_BAR.scaleY,
    colour: sourceColourToHex(colour),
  };
}
