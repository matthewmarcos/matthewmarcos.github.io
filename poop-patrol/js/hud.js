import { GUNS } from './config.js';
import { state } from './state.js';

const $ = id => document.getElementById(id);

export function show(id){ $(id).classList.remove('hidden'); }
export function hide(id){ $(id).classList.add('hidden'); }

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
}

// ---- Pause button ----
export function setPauseVisible(v){
  $('pause-btn').style.display = v ? 'flex' : 'none';
}
export function refreshPauseIcon(){
  $('pause-btn').textContent = state.paused ? '▶' : '❚❚';
  $('pause-btn').setAttribute('aria-label', state.paused ? 'Resume' : 'Pause');
}
