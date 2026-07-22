import { createCampaignOneSession } from './campaign-one-session.mjs';
import { createTutorialActorBindings } from './tutorial-actor-bindings.mjs';
import { advanceTutorialActorPlayback, createTutorialActorPlayback, sampleTutorialActorPlayback } from './tutorial-actor-playback.mjs';
import { TUTORIAL_M4_ARM_CALLBACKS } from './tutorial-m4-callback-source.mjs';
import { TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS } from './tutorial-unitmc-root-frame-actions-source.mjs';
import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';

const canvas = document.querySelector('#tutorialActor');
const context = canvas.getContext('2d');
const error = document.querySelector('#error');
const TICK_MS = 1000 / 30;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Tutorial Shape asset failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

try {
  const [unitTimeline, assets] = await Promise.all([
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    loadTutorialUnitPoseAssets({ loadImage }),
  ]);
  const [player] = createTutorialActorBindings(createCampaignOneSession()).actors;
  const source = {
    unitTimeline,
    rootFrameActions: TUTORIAL_UNITMC_ROOT_FRAME_ACTIONS,
    m4Runtime: assets.runtime,
    armCallbacks: TUTORIAL_M4_ARM_CALLBACKS,
  };
  let state = createTutorialActorPlayback(player);
  let previous = performance.now();
  let accumulated = 0;

  function render() {
    const sample = sampleTutorialActorPlayback(state, source);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(400, 355);
    context.scale(1.8, 1.8);
    drawTutorialUnitPose(context, sample.pose, assets);
    context.restore();
  }

  function frame(now) {
    accumulated += Math.min(now - previous, 250);
    previous = now;
    while (accumulated >= TICK_MS) {
      state = advanceTutorialActorPlayback(state, source);
      accumulated -= TICK_MS;
    }
    render();
    requestAnimationFrame(frame);
  }

  render();
  canvas.dataset.ready = 'true';
  window.tutorialActorReady = true;
  requestAnimationFrame(frame);
} catch (reason) {
  error.textContent = reason.message;
  canvas.dataset.ready = 'false';
  window.tutorialActorReady = false;
}
