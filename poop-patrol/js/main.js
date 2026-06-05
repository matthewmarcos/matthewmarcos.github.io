import { W, H } from './config.js';
import { state, resetRun } from './state.js';
import { update, shoot, startLevel } from './engine.js';
import { draw, initRender } from './render.js';
import { updateHud, setPauseVisible, refreshPauseIcon, show } from './hud.js';
import { renderShop } from './shop.js';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
cv.width = W; cv.height = H;
initRender(ctx);

// ---- Input mapping ----
function toLogical(e){
  const r = cv.getBoundingClientRect();
  const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
  const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
  return { x: cx / r.width * W, y: cy / r.height * H };
}
cv.addEventListener('mousemove', e => { state.mouse = toLogical(e); });
cv.addEventListener('mousedown', e => {
  if(state.scene==='play' && !state.paused){ state.mouse = toLogical(e); shoot(); }
});
cv.addEventListener('touchstart', e => {
  if(state.scene==='play' && !state.paused){ e.preventDefault(); state.mouse = toLogical(e); shoot(); }
}, {passive:false});
cv.addEventListener('touchmove', e => { state.mouse = toLogical(e); }, {passive:false});

// ---- Pause ----
function togglePause(){
  if(state.scene !== 'play') return;
  state.paused = !state.paused;
  refreshPauseIcon();
}
document.getElementById('pause-btn').addEventListener('click', togglePause);
window.addEventListener('keydown', e => {
  if(e.key === 'p' || e.key === 'P'){ togglePause(); }
});

// ---- Buttons ----
function newRun(){ resetRun(); startLevel(); }
document.getElementById('start-btn').onclick = newRun;
document.getElementById('retry-btn').onclick = newRun;
document.getElementById('next-btn').onclick = ()=>{ state.level++; startLevel(); };

// ---- Init UI ----
setPauseVisible(false);
refreshPauseIcon();
updateHud();

// ---- Debug hook (opt-in via ?debug) ----
if(new URLSearchParams(location.search).has('debug')){
  window.__pp = { state, renderShop, show, setPauseVisible, updateHud };
}

// ---- Loop ----
let last = performance.now();
function loop(now){
  const dt = Math.min(40, now - last);
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
