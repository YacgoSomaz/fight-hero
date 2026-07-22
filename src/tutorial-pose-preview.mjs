import { loadTutorialUnitPoseAssets } from './tutorial-unit-pose-assets.mjs';
import { createTutorialUnitPosePlan } from './tutorial-unit-pose-plan.mjs';
import { drawTutorialUnitPose } from './tutorial-unit-pose-renderer.mjs';

const canvas = document.querySelector('#tutorialPose');
const context = canvas.getContext('2d');
const error = document.querySelector('#error');

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error(`original Tutorial Shape asset failed to load: ${source}`)), { once: true });
    image.src = source;
  });
}

try {
  const [timeline, assets] = await Promise.all([
    fetch('./public/assets/unitmc-timeline.json').then((response) => {
      if (!response.ok) throw new Error(`UnitMC timeline failed to load (${response.status})`);
      return response.json();
    }),
    loadTutorialUnitPoseAssets({ loadImage }),
  ]);
  const pose = createTutorialUnitPosePlan({ rootFrame: timeline.frames[0], rearAction: assets.runtime.actions.rifle.rear[0].items, frontAction: assets.runtime.actions.rifle.front[0].items, skinFrame: 57 });
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save(); context.translate(400, 340);
  drawTutorialUnitPose(context, pose, assets);
  context.restore();
  window.tutorialPoseReady = true;
} catch (reason) {
  error.textContent = reason.message;
  window.tutorialPoseReady = false;
}
