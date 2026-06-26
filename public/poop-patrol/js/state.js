import { W, H, START_AMMO } from './config.js';

export const state = {
  scene: 'start',      // start | play | shop | over
  paused: false,
  cash: 0,
  level: 1,
  filth: 0,            // carries between levels unless washed off
  filthMax: 100,
  owned: ['pea'],
  equipped: 'pea',
  ammo: { ...START_AMMO },   // rounds per gun id
  birds: [],
  poops: [],
  pellets: [],
  particles: [],
  splats: [],
  floats: [],
  toSpawn: 0,
  spawned: 0,
  killed: 0,
  spawnTimer: 0,
  lastShot: 0,
  statueX: W/2,
  statueY: H - 70,
  mouse: { x: W/2, y: H/2 },
};

// Wipe everything for a brand-new run.
export function resetRun(){
  state.scene = 'start';
  state.paused = false;
  state.cash = 0;
  state.level = 1;
  state.filth = 0;
  state.owned = ['pea'];
  state.equipped = 'pea';
  state.ammo = { ...START_AMMO };
  state.birds = []; state.poops = []; state.pellets = [];
  state.particles = []; state.splats = []; state.floats = [];
}
