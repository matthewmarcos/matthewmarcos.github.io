// The single mutable state of the session. run.js owns lifecycle transitions,
// update.js mutates it frame by frame, render.js and hud.js only read it.

import { BRO, BRO_TRAIL, PLAYER, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';

export const SCENE = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'game-over',
};

export const game = {
  scene: SCENE.START,
  levelNumber: 1,
  tiles: [],
  player: null,
  bro: null,
  enemies: [],
  bullets: [],
  goldPickups: [],
  camera: { x: 0, y: 0 },
  // breadcrumb trail of recent player positions that the Bro follows
  trail: [],
  trailTimer: 0,
  // counts down the post-clear pause; 0 while combat is live
  clearCountdown: 0,
};

// Raw input state, written only by the listeners in main.js.
export const input = {
  pressedKeys: new Set(),
  mouse: { x: VIEW_WIDTH / 2, y: VIEW_HEIGHT / 2 },
};

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: PLAYER.radius,
    hp: PLAYER.maxHp,
    gold: 0,
    fireCooldown: 0,
    lavaCooldown: 0,
    deathCause: null, // 'combat' | 'chasm' | 'lava', set when hp reaches 0
  };
}

export function createBro(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: BRO.radius,
    fireCooldown: 0,
  };
}

export function resetTrail(spawn) {
  game.trail = Array.from({ length: BRO_TRAIL.lagSamples }, () => ({ x: spawn.x, y: spawn.y }));
  game.trailTimer = 0;
}
