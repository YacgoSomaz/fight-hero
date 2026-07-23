import { advanceCampaignOnePreCutscene, createCampaignOnePreCutscene } from './campaign-one-cutscene.mjs';
import { CAMPAIGN_ONE_CUTSCENE_SOURCE } from './campaign-one-cutscene-source.mjs';

const canvas = document.querySelector('#campaignOneCutscene');
const context = canvas.getContext('2d');
const error = document.querySelector('#error');
const ART_ROOT = './public/assets/original-swf/cutscene-1890';

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Cutscene source image failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

function contains(point, field) {
  return point.x >= field.x && point.x <= field.x + field.width && point.y >= field.y && point.y <= field.y + field.height;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
}

function drawItem(item, assets) {
  if (item.name) return;
  context.save();
  context.translate(item.x, item.y);
  context.transform(item.a, item.b, item.c, item.d, 0, 0);
  const image = assets.get(item.character);
  if (image) context.drawImage(image, 0, 0);
  else {
    const children = CAMPAIGN_ONE_CUTSCENE_SOURCE.sprites[item.character];
    if (!children) throw new Error(`original Cutscene visual is unavailable: ${item.character}`);
    children.forEach((child) => drawItem(child, assets));
  }
  context.restore();
}

function drawDynamicFields(state) {
  const { title, previous, next } = CAMPAIGN_ONE_CUTSCENE_SOURCE.fields;
  context.save();
  context.fillStyle = '#ffffff';
  context.textBaseline = 'alphabetic';
  context.font = '16px "QTypeSquare-Book_16pt_st"';
  context.textAlign = 'left';
  context.fillText(state.title, title.x, title.y + 16.95);
  context.fillStyle = '#cccccc';
  context.font = '25px "Consolas"';
  if (state.previous.visible) context.fillText(state.previous.text, previous.x, previous.y + 25);
  if (state.next.visible) {
    context.textAlign = 'right';
    context.fillText(state.next.text, next.x + next.width, next.y + 25);
  }
  context.restore();
}

try {
  const fontFaces = await Promise.all([
    new FontFace('QTypeSquare-Book_16pt_st', `url(${ART_ROOT}/1576_QTypeSquare-Book_16pt_st.ttf)`).load(),
    new FontFace('Consolas', `url(${ART_ROOT}/1578_Consolas.ttf)`).load(),
  ]);
  fontFaces.forEach((font) => document.fonts.add(font));
  const assets = new Map(await Promise.all(CAMPAIGN_ONE_CUTSCENE_SOURCE.art.map(async (character) => [
    character,
    await loadImage(`${ART_ROOT}/${character}.svg`),
  ])));
  let state = createCampaignOnePreCutscene();
  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    CAMPAIGN_ONE_CUTSCENE_SOURCE.frames[state.sourceFrame].forEach((item) => drawItem(item, assets));
    drawDynamicFields(state);
    canvas.dataset.sourceFrame = String(state.sourceFrame);
    canvas.dataset.ready = 'true';
    window.campaignOneCutsceneReady = true;
  };
  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(event);
    let action = null;
    if (state.next.visible && contains(point, CAMPAIGN_ONE_CUTSCENE_SOURCE.fields.next)) action = 'next';
    else if (state.previous.visible && contains(point, CAMPAIGN_ONE_CUTSCENE_SOURCE.fields.previous)) action = 'previous';
    if (!action) return;
    const result = advanceCampaignOnePreCutscene(state, action);
    if (result.kind === 'startGame') {
      window.location.assign('./tutorial-scene-preview.html?source=campaign-1');
      return;
    }
    state = result;
    render();
  });
  render();
} catch (reason) {
  error.textContent = reason instanceof Error ? reason.message : String(reason);
  canvas.dataset.ready = 'false';
  window.campaignOneCutsceneReady = false;
}
