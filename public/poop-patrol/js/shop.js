import { GUNS, AMMO, washCost } from './config.js';
import { state } from './state.js';
import { updateHud } from './hud.js';

const $ = id => document.getElementById(id);

export function renderShop(){
  $('cash-banner').textContent = '$' + state.cash;
  renderWash();
  renderGuns();
}

// ---- Wash station (optional cleaning; filth carries over if skipped) ----
function renderWash(){
  const panel = $('wash-panel');
  const filth = Math.round(state.filth);
  const cost = washCost(state.filth);
  const info = $('wash-info');
  const btn = $('wash-btn');

  if(filth <= 0){
    info.textContent = 'Statue is spotless. ✨';
    btn.textContent = 'CLEAN';
    btn.disabled = true;
    btn.classList.add('disabled');
  } else {
    info.innerHTML = `FILTH <b>${filth}%</b> — carries into next level if you don't wash`;
    btn.textContent = `WASH OFF · $${cost}`;
    btn.disabled = state.cash < cost;
    btn.classList.toggle('disabled', state.cash < cost);
  }
  btn.onclick = ()=>{
    const c = washCost(state.filth);
    if(state.filth <= 0 || state.cash < c) return;
    state.cash -= c;
    state.filth = 0;
    state.splats = [];
    renderShop(); updateHud();
  };
}

// ---- Guns: buy, equip, restock ammo ----
function renderGuns(){
  const wrap = $('shop-items');
  wrap.innerHTML = '';
  GUNS.forEach(g=>{
    const owned = state.owned.includes(g.id);
    const equipped = state.equipped === g.id;
    const canAfford = state.cash >= g.price;
    const am = AMMO[g.id];
    const rounds = state.ammo[g.id] || 0;

    const card = document.createElement('div');
    card.className = 'gun-card'
      + (equipped ? ' equipped' : '')
      + (owned && !equipped ? ' owned' : '')
      + (!owned && !canAfford ? ' cant' : '');

    if(owned){
      card.innerHTML = `
        <div class="gname">${g.name}</div>
        <div class="gstat">${g.desc}</div>
        <div class="grounds">AMMO: <b>${rounds}</b></div>
        <div class="gprice">${equipped ? 'EQUIPPED' : 'OWNED ✓ tap to equip'}</div>
        <button class="ammo-btn" ${state.cash < am.price ? 'disabled' : ''}>
          +${am.pack} ammo · $${am.price}
        </button>`;
      // equip on card click
      card.onclick = (e)=>{
        if(e.target.classList.contains('ammo-btn')) return;
        state.equipped = g.id;
        renderShop(); updateHud();
      };
      // buy ammo
      card.querySelector('.ammo-btn').onclick = (e)=>{
        e.stopPropagation();
        if(state.cash < am.price) return;
        state.cash -= am.price;
        state.ammo[g.id] = (state.ammo[g.id] || 0) + am.pack;
        renderShop(); updateHud();
      };
    } else {
      card.innerHTML = `
        <div class="gname">${g.name}</div>
        <div class="gstat">${g.desc}</div>
        <div class="grounds">comes with ${am.starter} rounds</div>
        <div class="gprice">$${g.price}</div>`;
      card.onclick = ()=>{
        if(state.cash < g.price) return;
        state.cash -= g.price;
        state.owned.push(g.id);
        state.equipped = g.id;
        state.ammo[g.id] = (state.ammo[g.id] || 0) + am.starter;
        renderShop(); updateHud();
      };
    }
    wrap.appendChild(card);
  });
}
