import { TUTORIAL_SPEAK_SOURCE_ASSETS, getTutorialSpeakPortraitSource } from './tutorial-speak-source.mjs';

// Hud 1540 places mc_speak (symbol 1488) at 5000,300 twips.  This is the
// source Hud placement, not a browser layout decision.
const HUD_SPEAK_HOLDER = Object.freeze({ x: 250, y: 15 });

const TEXT_FIELDS = Object.freeze({
  name: Object.freeze({
    fontFamily: 'QTypeSquare-Medium',
    fontPx: 13,
    align: 'center',
    // DefineEditText 1486: Xmin=-40, Xmax=4578, Ymin=-40 (twips).
    bounds: Object.freeze({ xMin: -2, xMax: 228.9, yMin: -2 }),
    color: 'rgb(204, 204, 204)',
  }),
  description: Object.freeze({
    fontFamily: 'QTypeSquare-Book_10pt_st',
    fontPx: 10,
    align: 'left',
    // DefineEditText 1487: Xmin=-40, Ymin=-40 (twips), then the original
    // PlaceObject3 GlowFilter data (black, blurX/blurY=5, strength=1).
    bounds: Object.freeze({ xMin: -2, yMin: -2 }),
    color: 'rgb(255, 255, 255)',
    glow: Object.freeze({ color: '#000000', blurX: 5, blurY: 5, strength: 1 }),
  }),
});

function sourceFrame(timeline, frame) {
  if (!timeline?.frames || !Number.isInteger(timeline.frameCount)) throw new TypeError('original Speak timeline is required');
  if (!Number.isInteger(frame) || frame < 1 || frame > timeline.frameCount) throw new RangeError(`original Speak frame is unavailable: ${frame}`);
  const current = timeline.frames[frame - 1];
  if (!current || current.frame !== frame) throw new Error(`original Speak frame record is unavailable: ${frame}`);
  return current;
}

function sourceItem(frame, character, label = String(character)) {
  const item = frame.items.find((candidate) => candidate.character === character);
  if (!item) throw new Error(`original Speak ${label} is unavailable on frame ${frame.frame}`);
  return item;
}

function sourceTextItem(frame, name) {
  const item = frame.items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`original Speak ${name} field is unavailable on frame ${frame.frame}`);
  return item;
}

function transform(item) {
  return {
    x: item.x,
    y: item.y,
    scaleX: item.scaleX,
    scaleY: item.scaleY,
    rotateSkew0: item.rotateSkew0,
    rotateSkew1: item.rotateSkew1,
  };
}

function textAnchor(item, field) {
  const x = field.align === 'center'
    ? item.x + (field.bounds.xMin + field.bounds.xMax) / 2
    : item.x + field.bounds.xMin;
  return { x: Number(x.toFixed(3)), y: Number((item.y + field.bounds.yMin).toFixed(3)) };
}

// Projects the actual current Speak_187 Display List into canvas instructions.
// The portrait character is intentionally resolved from Unit.unitInfo.frame,
// exactly as Hud.setMsg() does with mc_speak.head.gotoAndStop(...).
export function getTutorialSpeakRenderPlan({ hud, speaker, timeline } = {}) {
  if (!hud?.message) return null;
  if (!speaker?.unitInfo || !Number.isInteger(speaker.unitInfo.frame)) throw new TypeError('original Speak speaker UnitInfo frame is required');
  const frame = sourceFrame(timeline, hud.speakTimeline?.frame ?? 1);
  const portraitItem = sourceItem(frame, 666, 'head');
  const portraitSource = getTutorialSpeakPortraitSource(speaker.unitInfo.frame);
  const nameItem = sourceTextItem(frame, 'txt_name');
  const descriptionItem = sourceTextItem(frame, 'txt_desc');
  const nameAnchor = textAnchor(nameItem, TEXT_FIELDS.name);
  const descriptionAnchor = textAnchor(descriptionItem, TEXT_FIELDS.description);

  return {
    symbolId: 1488,
    frame: frame.frame,
    holder: { ...HUD_SPEAK_HOLDER },
    chrome: [1482, 1483, 1484].map((character) => {
      const item = sourceItem(frame, character);
      return {
        depth: item.depth,
        character,
        source: TUTORIAL_SPEAK_SOURCE_ASSETS.chrome[character],
        ...(item.clipDepth ? { clipDepth: item.clipDepth } : {}),
        ...transform(item),
      };
    }),
    portrait: {
      depth: portraitItem.depth,
      character: portraitSource.character,
      source: portraitSource.source,
      ...transform(portraitItem),
    },
    text: {
      name: {
        text: String(speaker.name ?? ''),
        ...nameAnchor,
        fontFamily: TEXT_FIELDS.name.fontFamily,
        fontPx: TEXT_FIELDS.name.fontPx,
        align: TEXT_FIELDS.name.align,
        color: TEXT_FIELDS.name.color,
      },
      description: {
        text: String(hud.message.text ?? ''),
        ...descriptionAnchor,
        fontFamily: TEXT_FIELDS.description.fontFamily,
        fontPx: TEXT_FIELDS.description.fontPx,
        align: TEXT_FIELDS.description.align,
        color: TEXT_FIELDS.description.color,
        glow: { ...TEXT_FIELDS.description.glow },
      },
    },
  };
}

export const TUTORIAL_SPEAK_RENDER_SOURCE = Object.freeze({ HUD_SPEAK_HOLDER, TEXT_FIELDS });
