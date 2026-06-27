import { GUNS } from './config.js';
import { state } from './state.js';

const $ = id => document.getElementById(id);

export function show(id){ $(id).classList.remove('hidden'); }
export function hide(id){ $(id).classList.add('hidden'); }

// Short labels for the in-game weapon bar
const SHORT = { pea:'PEA', revolver:'REV', shotgun:'SHTGN', smg:'SMG', rifle:'RIFLE', cannon:'BOOM' };

export function updateHud(){
  $('cash').textContent = '$' + state.cash;
  $('level').textContent = 'LV ' + state.level;
  $('birds-left').textContent = state.killed + '/' + state.toSpawn;

  const gun = GUNS.find(g => g.id === state.equipped);
  $('weapon-name').textContent = gun.name;

  const rounds = state.ammo[state.equipped] || 0;
  const ammoEl = $('ammo');
  ammoEl.textContent = rounds + ' rds';
  ammoEl.classList.toggle('empty', rounds <= 0);

  $('meter-fill').style.width = Math.min(100, state.filth) + '%';
  $('meter-fill').style.background = state.filth > 70
    ? 'linear-gradient(90deg,#e74c3c,#8a2a1a)'
    : 'linear-gradient(90deg,#8a5a2b,#6b4423)';

  syncWeaponBar();
}

// ---- In-game weapon bar (switch guns + per-gun ammo readout) ----
let barSig = '';
const ammoSpans = {};

function buildWeaponBar(){
  const bar = $('weapon-bar');
  bar.innerHTML = '';
  for(const k in ammoSpans) delete ammoSpans[k];
  state.owned.forEach((id, i) => {
    const gun = GUNS.find(g => g.id === id);
    const slot = document.createElement('button');
    slot.className = 'wslot';
    slot.innerHTML =
      `<span class="wkey">${i+1}</span>` +
      `<span class="wname">${SHORT[id] || gun.name}</span>` +
      `<span class="wammo">${state.ammo[id] || 0}</span>`;
    slot.onclick = () => equipWeapon(id);
    bar.appendChild(slot);
    ammoSpans[id] = slot.querySelector('.wammo');
  });
  barSig = state.owned.join(',');
}

function syncWeaponBar(){
  if(barSig !== state.owned.join(',')) buildWeaponBar();
  state.owned.forEach(id => {
    const span = ammoSpans[id];
    if(!span) return;
    const rounds = state.ammo[id] || 0;
    span.textContent = rounds;
    const slot = span.parentElement;
    slot.classList.toggle('active', id === state.equipped);
    slot.classList.toggle('empty', rounds <= 0);
  });
}

export function equipWeapon(id){
  if(!state.owned.includes(id) || state.equipped === id) return;
  state.equipped = id;
  updateHud();
}

// ---- Visibility of in-play chrome (pause button + weapon bar) ----
export function setPlayUI(v){
  $('pause-btn').style.display = v ? 'flex' : 'none';
  $('weapon-bar').style.display = v ? 'flex' : 'none';
  if(v) buildWeaponBar();
}
export function refreshPauseIcon(){
  $('pause-btn').textContent = state.paused ? '▶' : '❚❚';
  $('pause-btn').setAttribute('aria-label', state.paused ? 'Resume' : 'Pause');
}
