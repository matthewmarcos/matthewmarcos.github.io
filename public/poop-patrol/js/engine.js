import { W, H, GUNS, BIRD_TYPES, levelPlan } from './config.js';
import { state } from './state.js';
import { updateHud, show, hide, setPlayUI } from './hud.js';
import { renderShop } from './shop.js';

let currentPlan = null;

// ---- Shooting ----
export function shoot(){
  if(state.scene !== 'play' || state.paused) return;
  const now = performance.now();
  const gun = GUNS.find(g => g.id === state.equipped);
  if(now - state.lastShot < gun.fireRate) return;

  // out of ammo: dry click, nothing fires
  if((state.ammo[state.equipped] || 0) <= 0){
    state.lastShot = now;
    floatText(state.statueX, state.statueY - 80, 'CLICK', '#e74c3c');
    return;
  }

  state.lastShot = now;
  state.ammo[state.equipped]--;

  const ang = Math.atan2(state.mouse.y - state.statueY, state.mouse.x - state.statueX);
  for(let i=0;i<gun.pellets;i++){
    const spread = (Math.random()-0.5) * gun.spread * 2;
    const a = ang + spread;
    state.pellets.push({
      x: state.statueX, y: state.statueY - 40,
      vx: Math.cos(a)*16, vy: Math.sin(a)*16,
      dmg: gun.dmg, life: 60
    });
  }
  // muzzle flash particles
  for(let i=0;i<6;i++){
    state.particles.push({
      x: state.statueX + Math.cos(ang)*30, y: state.statueY - 40 + Math.sin(ang)*30,
      vx: Math.cos(ang)*(2+Math.random()*3) + (Math.random()-0.5)*2,
      vy: Math.sin(ang)*(2+Math.random()*3) + (Math.random()-0.5)*2,
      life: 12, color: '#ffe27a', size: 3+Math.random()*3
    });
  }
}

// ---- Spawning ----
function spawnBird(){
  if(!currentPlan) return;
  const type = currentPlan.pool[Math.floor(Math.random()*currentPlan.pool.length)] || 'pigeon';
  const def = BIRD_TYPES[type];
  const fromLeft = Math.random() < 0.5;
  const y = 60 + Math.random() * (H * 0.42);
  const baseSpeed = (1.1 + state.level*0.12) * def.speed;
  state.birds.push({
    type, ...def,
    hp: def.hp, maxHp: def.hp,
    x: fromLeft ? -40 : W + 40,
    y,
    dir: fromLeft ? 1 : -1,
    vx: (fromLeft ? 1 : -1) * baseSpeed,
    bobT: Math.random()*Math.PI*2,
    baseY: y,
    poopCd: 1200 + Math.random()*1800,
    flap: 0,
  });
  state.spawned++;
}

// ---- Start a level (filth carries over; only ammo/birds reset) ----
export function startLevel(){
  state.scene = 'play';
  state.paused = false;
  state.birds = []; state.poops = []; state.pellets = []; state.particles = []; state.floats = [];
  currentPlan = levelPlan(state.level);
  state.toSpawn = currentPlan.count;
  state.spawned = 0;
  state.killed = 0;
  state.spawnTimer = 600;
  hide('shop-screen'); hide('start-screen'); hide('over-screen');
  setPlayUI(true);
  updateHud();
}

// ---- Update ----
export function update(dt){
  if(state.scene !== 'play' || state.paused) return;

  // spawn
  if(state.spawned < state.toSpawn){
    state.spawnTimer -= dt;
    if(state.spawnTimer <= 0){
      spawnBird();
      state.spawnTimer = currentPlan.spawnInterval * (0.7 + Math.random()*0.6);
    }
  }

  // birds
  for(const b of state.birds){
    b.x += b.vx * dt/16;
    b.bobT += dt/300;
    b.y = b.baseY + Math.sin(b.bobT) * 12;
    b.flap += dt/80;
    if(b.x < -60 && b.dir === -1){ b.x = W + 50; }
    if(b.x > W + 60 && b.dir === 1){ b.x = -50; }
    b.poopCd -= dt;
    if(b.poopCd <= 0){
      b.poopCd = (2200 + Math.random()*2600) / b.poopRate;
      state.poops.push({ x:b.x, y:b.y+b.size*0.4, vy: 3 + state.level*0.15, r: 8 });
    }
  }

  // pellets
  for(const p of state.pellets){ p.x += p.vx; p.y += p.vy; p.life--; }
  state.pellets = state.pellets.filter(p => p.life>0 && p.x>-20 && p.x<W+20 && p.y>-20 && p.y<H+20);

  // pellet vs bird collisions
  for(const p of state.pellets){
    for(const b of state.birds){
      if(b.dead) continue;
      const dx = p.x-b.x, dy=p.y-b.y;
      if(dx*dx+dy*dy < (b.size*0.9)*(b.size*0.9)){
        b.hp -= p.dmg;
        p.life = 0;
        burst(p.x, p.y, b.color, 4);
        if(b.hp <= 0){
          b.dead = true;
          state.cash += b.reward;
          state.killed++;
          burst(b.x, b.y, '#fff', 14);
          floatText(b.x, b.y, '+$'+b.reward, '#7CFC00');
        }
        break;
      }
    }
  }
  state.birds = state.birds.filter(b => !b.dead);

  // poops falling
  for(const pp of state.poops){
    pp.vy += 0.05 * dt/16;
    pp.y += pp.vy * dt/16;
    if(pp.y > state.statueY - 60 && Math.abs(pp.x - state.statueX) < 60){
      pp.hit = true;
      state.filth += 7;
      addSplat(pp.x, pp.y);
      burst(pp.x, pp.y, '#6b4423', 6);
    }
    if(pp.y > H - 40){ pp.hit = true; burst(pp.x, H-40, '#6b4423', 4); }
  }
  state.poops = state.poops.filter(pp => !pp.hit);

  // particles
  for(const pt of state.particles){ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=0.12; pt.life--; }
  state.particles = state.particles.filter(pt => pt.life>0);

  // float texts
  state.floats = state.floats.filter(f=>{ f.y-=0.6; f.life--; return f.life>0; });

  // filth cap & death
  if(state.filth >= state.filthMax){ gameOver(); return; }

  // level cleared?
  if(state.spawned >= state.toSpawn && state.birds.length === 0 && state.poops.length === 0){
    levelCleared();
  }

  updateHud();
}

export function burst(x,y,color,n){
  for(let i=0;i<n;i++){
    const a = Math.random()*Math.PI*2, sp=1+Math.random()*4;
    state.particles.push({ x,y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 1, life:18+Math.random()*12, color, size:2+Math.random()*3 });
  }
}
export function floatText(x,y,text,color){
  state.floats.push({x,y,text,color,life:50});
}
function addSplat(x,y){
  state.splats.push({ x, y: state.statueY - 30 + Math.random()*50, r: 6+Math.random()*10, a: 0.85 });
}

function levelCleared(){
  state.scene = 'shop';
  state.paused = false;
  setPlayUI(false);
  document.getElementById('shop-title').textContent = 'LEVEL ' + state.level + ' CLEARED';
  document.getElementById('shop-sub').textContent = 'Gear up, restock ammo, and decide whether to wash off.';
  renderShop();
  show('shop-screen');
}

function gameOver(){
  state.scene = 'over';
  state.paused = false;
  setPlayUI(false);
  document.getElementById('over-stats').textContent =
    'You reached Level ' + state.level + ' with $' + state.cash;
  show('over-screen');
}
