import { W, H } from './config.js';
import { state } from './state.js';

let ctx = null;
export function initRender(context){ ctx = context; }

export function draw(){
  // sky gradient
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#6db3e8'); g.addColorStop(1,'#c8e6f5');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

  drawClouds();

  // ground
  ctx.fillStyle = '#4a8c3f'; ctx.fillRect(0,H-40,W,40);
  ctx.fillStyle = '#3d7534';
  for(let i=0;i<W;i+=24){ ctx.fillRect(i, H-40, 12, 6); }

  // pedestal
  ctx.fillStyle = '#8a8d96';
  ctx.fillRect(state.statueX-50, H-40, 100, 14);
  ctx.fillStyle = '#a7abb5';
  ctx.fillRect(state.statueX-44, H-58, 88, 20);

  drawStatue();

  // splats on statue
  for(const s of state.splats){
    ctx.fillStyle = `rgba(90,60,30,${s.a})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(120,85,45,${s.a*0.7})`;
    ctx.beginPath(); ctx.arc(s.x-s.r*0.3, s.y-s.r*0.2, s.r*0.5, 0, Math.PI*2); ctx.fill();
  }

  // poops
  for(const pp of state.poops){
    ctx.fillStyle = '#6b4423';
    ctx.beginPath(); ctx.ellipse(pp.x, pp.y, pp.r*0.8, pp.r, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(pp.x-2, pp.y-3, pp.r*0.35, 0, Math.PI*2); ctx.fill();
  }

  for(const b of state.birds) drawBird(b);

  // pellets
  ctx.fillStyle = '#ffcb1f';
  for(const p of state.pellets){
    ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2); ctx.fill();
  }

  // particles
  for(const pt of state.particles){
    ctx.globalAlpha = Math.max(0, pt.life/30);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // float texts
  state.floats.forEach(f=>{
    ctx.globalAlpha = Math.min(1, f.life/30);
    ctx.font = "bold 22px 'VT323', monospace";
    ctx.fillStyle = f.color; ctx.textAlign='center';
    ctx.fillText(f.text, f.x, f.y);
  });
  ctx.globalAlpha = 1;

  // crosshair (only while actively playing)
  if(state.scene==='play' && !state.paused){
    ctx.strokeStyle = 'rgba(231,76,60,0.9)'; ctx.lineWidth = 2;
    const m = state.mouse;
    ctx.beginPath(); ctx.arc(m.x,m.y,12,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m.x-18,m.y); ctx.lineTo(m.x-6,m.y);
    ctx.moveTo(m.x+6,m.y); ctx.lineTo(m.x+18,m.y);
    ctx.moveTo(m.x,m.y-18); ctx.lineTo(m.x,m.y-6);
    ctx.moveTo(m.x,m.y+6); ctx.lineTo(m.x,m.y+18); ctx.stroke();
  }

  if(state.scene==='play' && state.paused) drawPauseOverlay();
}

function drawPauseOverlay(){
  ctx.fillStyle = 'rgba(13,13,24,0.55)';
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = '#ffcb1f';
  ctx.textAlign = 'center';
  ctx.font = "64px 'Bungee', sans-serif";
  ctx.fillText('PAUSED', W/2, H/2 - 6);
  ctx.fillStyle = '#cdd6f4';
  ctx.font = "26px 'VT323', monospace";
  ctx.fillText('press P or the ▶ button to resume', W/2, H/2 + 40);
  ctx.textAlign = 'left';
}

let cloudOffset = 0;
const clouds = [{x:120,y:80,s:1},{x:420,y:140,s:1.4},{x:680,y:70,s:0.9},{x:300,y:200,s:0.7}];
function drawClouds(){
  if(!state.paused) cloudOffset += 0.15;
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for(const c of clouds){
    const cx = (c.x + cloudOffset) % (W+200) - 100;
    const s = c.s;
    ctx.beginPath();
    ctx.arc(cx, c.y, 26*s, 0, Math.PI*2);
    ctx.arc(cx+30*s, c.y+6*s, 22*s, 0, Math.PI*2);
    ctx.arc(cx-28*s, c.y+8*s, 20*s, 0, Math.PI*2);
    ctx.arc(cx+8*s, c.y-14*s, 20*s, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawStatue(){
  const x = state.statueX, y = H-58;
  ctx.fillStyle = '#b9bcc4';
  ctx.fillRect(x-16, y-70, 32, 72);
  ctx.beginPath(); ctx.arc(x, y-84, 16, 0, Math.PI*2); ctx.fill();
  const ang = Math.atan2(state.mouse.y - state.statueY, state.mouse.x - state.statueX);
  ctx.save();
  ctx.translate(x, y-58);
  ctx.rotate(ang);
  ctx.fillStyle = '#aeb1ba';
  ctx.fillRect(0, -6, 40, 12);
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(34, -5, 26, 10);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(x+4, y-70, 12, 72);
}

function drawBird(b){
  const flapY = Math.sin(b.flap)*6;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.scale(b.dir, 1);
  ctx.fillStyle = b.color;
  ctx.beginPath(); ctx.ellipse(0,0,b.size*0.6,b.size*0.42,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-b.size*0.1, 0);
  ctx.quadraticCurveTo(-b.size*0.3, -b.size*0.5 - flapY, b.size*0.3, -flapY*0.3);
  ctx.quadraticCurveTo(0, b.size*0.1, -b.size*0.1, 0);
  ctx.fill();
  ctx.beginPath(); ctx.arc(b.size*0.5, -b.size*0.15, b.size*0.28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#f5a623';
  ctx.beginPath();
  ctx.moveTo(b.size*0.72, -b.size*0.15);
  ctx.lineTo(b.size*1.0, -b.size*0.05);
  ctx.lineTo(b.size*0.72, b.size*0.02);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(b.size*0.55, -b.size*0.22, b.size*0.09, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(b.size*0.57, -b.size*0.22, b.size*0.045, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  if(b.maxHp > 1 && b.hp < b.maxHp){
    const w = b.size*1.3;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(b.x-w/2, b.y-b.size*0.8, w, 5);
    ctx.fillStyle = '#7CFC00'; ctx.fillRect(b.x-w/2, b.y-b.size*0.8, w*(b.hp/b.maxHp), 5);
  }
}
