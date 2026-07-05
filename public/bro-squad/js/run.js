// Run and level lifecycle: starting a fresh run, advancing to the next level,
// and ending the run. A "run" is one permadeath attempt — levels within it
// share the same player (HP and gold carry over), death resets everything.

import { ENEMY_TYPES } from './config.js';
import { generateIsland } from './island.js';
import { randomFloorPosition } from './tile-map.js';
import { SCENE, createBro, createPlayer, game, resetTrail } from './state.js';
import { hideLevelClearOverlay, showBanner, showGameOverScreen } from './hud.js';

// -- difficulty scaling per level --
const BASE_ENEMY_COUNT = 4;
const ENEMY_COUNT_PER_LEVEL = 1.5;
const MAX_ENEMY_COUNT = 20;
const ENEMY_HP_GROWTH_PER_LEVEL = 0.18;
const ENEMY_SPEED_GROWTH_PER_LEVEL = 0.05;
const MAX_ENEMY_SPEED_MULTIPLIER = 1.6;
const BRUTE_MIN_LEVEL = 3;
const BRUTE_CHANCE = 0.25;
const GRUNT_CHANCE = 0.55; // everything past brutes and grunts is a runner

const ENEMY_MIN_SPAWN_DISTANCE = 200; // no enemy starts closer to the player

export function startRun() {
  game.levelNumber = 1;
  const spawn = buildLevel();
  game.player = createPlayer(spawn);
  game.scene = SCENE.PLAYING;
  showBanner('RUN START — LEVEL 1');
}

export function startNextLevel() {
  game.levelNumber += 1;
  const spawn = buildLevel();
  game.player.x = spawn.x;
  game.player.y = spawn.y;
  game.player.fireCooldown = 0;
  showBanner(`LEVEL ${game.levelNumber}`);
}

export function endRun(cause) {
  game.scene = SCENE.GAME_OVER;
  showGameOverScreen(cause);
}

// Generates a fresh island and repopulates everything on it except the
// player, whom the callers above either create or carry over.
function buildLevel() {
  const { tiles, spawn } = generateIsland(game.levelNumber);
  game.tiles = tiles;
  game.enemies = spawnEnemies(tiles, spawn);
  game.bullets = [];
  game.goldPickups = [];
  game.bro = createBro(spawn);
  game.clearCountdown = 0;
  resetTrail(spawn);
  hideLevelClearOverlay();
  return spawn;
}

function spawnEnemies(tiles, spawn) {
  const level = game.levelNumber;
  const count = Math.min(
    BASE_ENEMY_COUNT + Math.round(level * ENEMY_COUNT_PER_LEVEL),
    MAX_ENEMY_COUNT,
  );
  const hpMultiplier = 1 + (level - 1) * ENEMY_HP_GROWTH_PER_LEVEL;
  const speedMultiplier = Math.min(
    1 + (level - 1) * ENEMY_SPEED_GROWTH_PER_LEVEL,
    MAX_ENEMY_SPEED_MULTIPLIER,
  );

  return Array.from({ length: count }, () => {
    const type = rollEnemyType(level);
    const stats = ENEMY_TYPES[type];
    const position = randomFloorPosition(tiles, spawn, ENEMY_MIN_SPAWN_DISTANCE);
    const hp = Math.round(stats.hp * hpMultiplier);
    return {
      type,
      x: position.x,
      y: position.y,
      radius: stats.radius,
      speed: stats.speed * speedMultiplier,
      hp,
      maxHp: hp,
      goldValue: stats.gold,
      contactCooldown: 0,
      lavaCooldown: 0,
    };
  });
}

function rollEnemyType(level) {
  const roll = Math.random();
  if (level >= BRUTE_MIN_LEVEL && roll < BRUTE_CHANCE) return 'brute';
  if (roll < GRUNT_CHANCE) return 'grunt';
  return 'runner';
}
