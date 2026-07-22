// Unit symbol 687 places icon (symbol 682) at depth 3 with the matrix
// `19 a9 53 74 e8`, decoded as (-34.7,-80.3).  Symbol 682's frame labels
// are the original Unit.setClass() icon values, not a browser icon set.
const SOURCE_ICONS = Object.freeze({
  sniper: Object.freeze({ frame: 1, assetSrc: './public/assets/original-swf/unit-icon-682-sniper-frame1.png' }),
  medic: Object.freeze({ frame: 2, assetSrc: './public/assets/original-swf/unit-icon-682-medic-frame2.png' }),
  soldier: Object.freeze({ frame: 3, assetSrc: './public/assets/original-swf/unit-icon-682-soldier-frame3.png' }),
  tank: Object.freeze({ frame: 4, assetSrc: './public/assets/original-swf/unit-icon-682-tank-frame4.png' }),
});

const SOURCE_TEAM_COLOURS = Object.freeze({
  0: '#33ff33',
  1: '#3399cc',
  2: '#cc9900',
});

export function getTutorialUnitOverheadIcon(unit, screen) {
  const icon = SOURCE_ICONS[unit.unitInfo?.icon];
  if (!icon) throw new Error(`original Unit icon is unavailable: ${unit.unitInfo?.icon}`);
  const colour = SOURCE_TEAM_COLOURS[unit.team];
  if (!colour) throw new Error(`original Unit.setTeam has no icon colour for team: ${unit.team}`);
  return {
    assetSrc: icon.assetSrc,
    spriteId: 682,
    frame: icon.frame,
    sourceWidth: 15,
    sourceHeight: 15,
    x: screen.x - 34.7,
    y: screen.y - 80.3,
    width: 15,
    height: 15,
    colour,
    alpha: 0.7,
  };
}
