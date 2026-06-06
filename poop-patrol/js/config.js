// ---- Core constants & static data ----
export const W = 900, H = 600;

// ---- Weapons ----
// fireRate = ms between shots. One trigger pull = 1 ammo (a shotgun shell fires
// many pellets but costs a single round).
export const GUNS = [
  { id:'pea',     name:'PEASHOOTER', dmg:1, fireRate:280, spread:0,    pellets:1, price:0,    desc:'1 dmg • slow' },
  { id:'revolver',name:'REVOLVER',   dmg:2, fireRate:230, spread:0,    pellets:1, price:120,  desc:'2 dmg • snappy' },
  { id:'shotgun', name:'SHOTGUN',    dmg:1, fireRate:480, spread:0.26, pellets:5, price:320,  desc:'5 pellets • wide' },
  { id:'smg',     name:'SMG',        dmg:1, fireRate:90,  spread:0.05, pellets:1, price:520,  desc:'1 dmg • rapid' },
  { id:'rifle',   name:'RIFLE',      dmg:4, fireRate:340, spread:0,    pellets:1, price:780,  desc:'4 dmg • punchy' },
  { id:'cannon',  name:'BOOMSTICK',  dmg:3, fireRate:360, spread:0.30, pellets:8, price:1200, desc:'8 pellets • beefy' },
];

// ---- Ammo economy (per gun) ----
// pack    = rounds granted per purchase
// price   = cost of one ammo pack
// starter = rounds granted for free when you first buy the gun
export const AMMO = {
  pea:      { pack:30, price:10,  starter:30 },
  revolver: { pack:20, price:45,  starter:20 },
  shotgun:  { pack:12, price:60,  starter:12 },
  smg:      { pack:60, price:75,  starter:40 },
  rifle:    { pack:15, price:90,  starter:12 },
  cannon:   { pack:10, price:150, starter:8  },
};

export const START_AMMO = { pea: 40 }; // what you begin a fresh run with

// Cleaning cost scales with how filthy you are.
export function washCost(filth){ return Math.ceil(filth * 2); }

// ---- Bird types ----
export const BIRD_TYPES = {
  pigeon:  { hp:1, speed:1.0, size:26, color:'#9aa0a8', poopRate:1.0, reward:10, points:1 },
  sparrow: { hp:1, speed:2.0, size:18, color:'#a87c4a', poopRate:1.2, reward:14, points:1 },
  crow:    { hp:3, speed:1.1, size:30, color:'#2b2b33', poopRate:0.9, reward:24, points:2 },
  gull:    { hp:5, speed:0.9, size:38, color:'#e8eef2', poopRate:1.4, reward:40, points:3 },
  hawk:    { hp:8, speed:1.5, size:44, color:'#6b4a2a', poopRate:1.1, reward:70, points:5 },
};

// ---- Level config ----
export function levelPlan(lv){
  const count = 6 + lv * 3;
  const pool = [];
  pool.push(...Array(Math.max(0, 5 - lv)).fill('pigeon'));
  pool.push(...Array(2 + lv).fill('pigeon'));
  if(lv >= 2) pool.push(...Array(lv).fill('sparrow'));
  if(lv >= 3) pool.push(...Array(lv-1).fill('crow'));
  if(lv >= 5) pool.push(...Array(Math.floor(lv/2)).fill('gull'));
  if(lv >= 7) pool.push(...Array(Math.floor(lv/3)).fill('hawk'));
  const spawnInterval = Math.max(420, 1300 - lv * 70);
  return { count, pool, spawnInterval };
}
