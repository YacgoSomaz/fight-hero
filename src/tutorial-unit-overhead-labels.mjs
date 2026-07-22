// Unit symbol 687's first Display List frame places DefineEditText 684
// (txt_name) at (-9,-88) and 685 (txt_level) at (-28,-88). Both definitions
// reference the original DefineFont3 683: QTypeSquare-Bold_8pt_st.
export const TUTORIAL_UNIT_OVERHEAD_FONT = Object.freeze({
  assetSrc: './public/assets/original-swf/unit-font-683.ttf',
  fontFamily: 'QTypeSquare-Bold_8pt_st',
  fontSize: 8,
  symbolId: 683,
});

const SOURCE_TEXT_FIELDS = Object.freeze([
  Object.freeze({ symbolId: 684, property: 'name', localX: -9, localY: -88, jugLocalX: -8.75, jugLocalY: -87.5, width: 100.75, height: 13.6 }),
  Object.freeze({ symbolId: 685, property: 'level', localX: -28, localY: -88, jugLocalX: -27.55, jugLocalY: -87.5, width: 19.6, height: 13.6 }),
]);

// Unit.setTeam() colours txt_name and txt_level using greenBar, blueBar, and
// redBar respectively (not the human/bot back colours used by bar_hp).
const SOURCE_TEXT_TEAM_COLOURS = Object.freeze({
  0: '#33ff33',
  1: '#3399cc',
  2: '#cc9900',
});

export function getTutorialUnitOverheadLabels(unit, screen) {
  const colour = SOURCE_TEXT_TEAM_COLOURS[unit.team];
  if (!colour) throw new Error(`original Unit.setTeam has no text colour for team: ${unit.team}`);
  if (!unit.unitInfo) throw new Error('original Unit info is required for Unit txt_name and txt_level');

  return SOURCE_TEXT_FIELDS.map((field) => ({
    assetSrc: TUTORIAL_UNIT_OVERHEAD_FONT.assetSrc,
    fontFamily: TUTORIAL_UNIT_OVERHEAD_FONT.fontFamily,
    fontSize: TUTORIAL_UNIT_OVERHEAD_FONT.fontSize,
    symbolId: field.symbolId,
    text: String(unit.unitInfo[field.property]),
    x: screen.x + (unit.isJug ? field.jugLocalX : field.localX),
    y: screen.y + (unit.isJug ? field.jugLocalY : field.localY),
    width: field.width,
    height: field.height,
    colour,
    alpha: 0.7,
  }));
}
