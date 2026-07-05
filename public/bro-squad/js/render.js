// Canvas drawing. Reads game state; never mutates it. All colors come from
// the stylesheet so the canvas and the page can't drift apart.

import { BULLET, ENEMY_TYPES, TILE, TILE_SIZE, VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { SCENE, game, input } from './state.js';

const LAVA_FLICKER_MS = 180;
const ENEMY_HP_BAR_HEIGHT = 4;
const ENEMY_HP_BAR_LIFT = 8; // gap between an enemy's top edge and its hp bar
const HP_BAR_TRACK_COLOR = '#000';
const AIM_TRACER_STYLE = 'rgba(79, 195, 247, 0.25)'; // --accent at low alpha

let ctx;
let palette;

export function initRender(context) {
  ctx = context;
  palette = readPalette();
}

function readPalette() {
  const rootStyles = getComputedStyle(document.documentElement);
  const color = (name) => rootStyles.getPropertyValue(name).trim();
  return {
    void: color('--void'),
    floor: color('--floor'),
    wall: color('--wall'),
    border: color('--border'),
    lavaDim: color('--lava-dim'),
    lavaBright: color('--lava-bright'),
    player: color('--accent'),
    gold: color('--accent-2'),
    bro: color('--bro'),
    broBullet: color('--bro-bullet'),
    enemyHp: color('--enemy-hp'),
    enemy: Object.fromEntries(
      Object.keys(ENEMY_TYPES).map((type) => [type, color(`--enemy-${type}`)]),
    ),
  };
}

export function render() {
  ctx.fillStyle = palette.void;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  if (game.scene === SCENE.START) return;

  drawTiles();
  drawGoldPickups();
  drawEnemies();
  drawBullets();

  // on the game-over screen the world stays visible, but the squad is gone
  if (game.scene !== SCENE.PLAYING) return;
  drawBro();
  drawAimTracer();
  drawPlayer();
}

function drawTiles() {
  const { tiles, camera } = game;
  // draw only the tiles in view, plus a one-tile margin for partial tiles
  const firstCol = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
  const lastCol = Math.min(tiles[0].length - 1, Math.ceil((camera.x + VIEW_WIDTH) / TILE_SIZE));
  const firstRow = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
  const lastRow = Math.min(tiles.length - 1, Math.ceil((camera.y + VIEW_HEIGHT) / TILE_SIZE));

  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      const color = tileColor(tiles[row][col], row, col);
      if (color === null) continue; // void and chasm stay canvas-black
      ctx.fillStyle = color;
      ctx.fillRect(col * TILE_SIZE - camera.x, row * TILE_SIZE - camera.y, TILE_SIZE, TILE_SIZE);
    }
  }
}

function tileColor(tile, row, col) {
  switch (tile) {
    case TILE.FLOOR:
      return palette.floor;
    case TILE.WALL:
      return palette.wall;
    case TILE.BORDER:
      return palette.border;
    case TILE.LAVA:
      return lavaColor(row, col);
    default:
      return null;
  }
}

// Lava alternates two shades on a fixed clock, offset per tile for a shimmer.
function lavaColor(row, col) {
  const phase = Math.floor(performance.now() / LAVA_FLICKER_MS) + row + col;
  return phase % 2 === 0 ? palette.lavaDim : palette.lavaBright;
}

function drawGoldPickups() {
  for (const pickup of game.goldPickups) {
    drawCircle(pickup, pickup.radius, palette.gold);
  }
}

function drawEnemies() {
  for (const enemy of game.enemies) {
    drawCircle(enemy, enemy.radius, palette.enemy[enemy.type]);
    drawEnemyHpBar(enemy);
  }
}

function drawEnemyHpBar(enemy) {
  const width = enemy.radius * 2;
  const x = enemy.x - game.camera.x - enemy.radius;
  const y = enemy.y - game.camera.y - enemy.radius - ENEMY_HP_BAR_LIFT;
  ctx.fillStyle = HP_BAR_TRACK_COLOR;
  ctx.fillRect(x, y, width, ENEMY_HP_BAR_HEIGHT);
  ctx.fillStyle = palette.enemyHp;
  ctx.fillRect(x, y, width * Math.max(0, enemy.hp / enemy.maxHp), ENEMY_HP_BAR_HEIGHT);
}

function drawBullets() {
  for (const bullet of game.bullets) {
    const color = bullet.firedBy === 'player' ? palette.player : palette.broBullet;
    drawCircle(bullet, BULLET.radius, color);
  }
}

function drawBro() {
  drawSquare(game.bro, game.bro.radius, palette.bro);
}

function drawPlayer() {
  drawSquare(game.player, game.player.radius, palette.player);
}

// Faint player-to-cursor line, kept from the prototype as an aiming aid.
// Likely becomes a "laser sight" power-up later rather than staying always-on.
function drawAimTracer() {
  ctx.strokeStyle = AIM_TRACER_STYLE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(game.player.x - game.camera.x, game.player.y - game.camera.y);
  ctx.lineTo(input.mouse.x, input.mouse.y);
  ctx.stroke();
}

function drawCircle(worldPoint, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(worldPoint.x - game.camera.x, worldPoint.y - game.camera.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSquare(worldPoint, halfSize, color) {
  ctx.fillStyle = color;
  ctx.fillRect(
    worldPoint.x - game.camera.x - halfSize,
    worldPoint.y - game.camera.y - halfSize,
    halfSize * 2,
    halfSize * 2,
  );
}
