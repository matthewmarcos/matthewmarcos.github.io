// Entry point: canvas setup, input listeners, buttons, and the frame loop.

import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { input } from './state.js';
import { startRun } from './run.js';
import { update } from './update.js';
import { initRender, render } from './render.js';
import { hideGameOverScreen, hideStartScreen } from './hud.js';

const canvas = document.getElementById('canvas');
canvas.width = VIEW_WIDTH;
canvas.height = VIEW_HEIGHT;
initRender(canvas.getContext('2d'));

// -- input --

window.addEventListener('keydown', (event) => input.pressedKeys.add(event.key.toLowerCase()));
window.addEventListener('keyup', (event) => input.pressedKeys.delete(event.key.toLowerCase()));

canvas.addEventListener('mousemove', (event) => {
  const bounds = canvas.getBoundingClientRect();
  input.mouse.x = event.clientX - bounds.left;
  input.mouse.y = event.clientY - bounds.top;
});

document.getElementById('start-btn').addEventListener('click', () => {
  hideStartScreen();
  startRun();
});

document.getElementById('restart-btn').addEventListener('click', () => {
  hideGameOverScreen();
  startRun();
});

// -- frame loop --

// Clamp dt so returning from a background tab doesn't fast-forward the world.
const MAX_FRAME_SECONDS = 0.05;

let previousTimestamp = 0;

function frame(timestamp) {
  if (previousTimestamp === 0) previousTimestamp = timestamp;
  const dt = Math.min((timestamp - previousTimestamp) / 1000, MAX_FRAME_SECONDS);
  previousTimestamp = timestamp;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
