// The per-frame simulation. update(dt) reads input, moves everything, applies
// damage, and hands lifecycle changes (next level, death) to run.js.

import {
  BRO,
  BRO_TRAIL,
  BULLET,
  ENEMY_CONTACT_COOLDOWN,
  ENEMY_CONTACT_DAMAGE,
  GOLD_PICKUP_RADIUS,
  LAVA_DAMAGE_PER_TICK,
  LAVA_TICK_INTERVAL,
  LEVEL_CLEAR_PAUSE_SECONDS,
  PLAYER,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';
import {
  isChasmAt,
  isLavaAt,
  isSolidForBro,
  isSolidTerrain,
  moveWithCollision,
  tileAt,
} from './tile-map.js';
import { SCENE, game, input } from './state.js';
import { endRun, startNextLevel } from './run.js';
import { showLevelClearOverlay, updateHud, updateLevelClearCountdown } from './hud.js';

export function update(dt) {
  if (game.scene !== SCENE.PLAYING) return;

  movePlayer(dt);
  applyTerrainHazardsToPlayer(dt);
  if (endRunIfDead()) return;

  game.camera = cameraCenteredOn(game.player);
  recordPlayerTrail(dt);
  moveBroAlongTrail();
  collectGoldPickups(); // even mid-pause, leftover gold is still collectible

  if (game.clearCountdown > 0) {
    tickLevelClearPause(dt);
  } else {
    runCombatPhase(dt);
    if (endRunIfDead()) return;
  }

  updateHud();
}

function runCombatPhase(dt) {
  firePlayerGun(dt);
  fireBroGun(dt);
  moveBullets(dt);
  moveEnemies(dt);
  if (game.player.hp > 0 && game.enemies.length === 0) beginLevelClearPause();
}

function endRunIfDead() {
  if (game.player.hp > 0) return false;
  endRun(game.player.deathCause);
  return true;
}

// -- player --

const MOVE_BINDINGS = [
  { keys: ['w', 'arrowup'], x: 0, y: -1 },
  { keys: ['s', 'arrowdown'], x: 0, y: 1 },
  { keys: ['a', 'arrowleft'], x: -1, y: 0 },
  { keys: ['d', 'arrowright'], x: 1, y: 0 },
];

function movePlayer(dt) {
  const direction = heldMoveDirection();
  if (!direction) return;
  moveWithCollision(
    game.tiles,
    game.player,
    direction.x * PLAYER.speed * dt,
    direction.y * PLAYER.speed * dt,
  );
}

// Combines the held movement keys into a unit vector, or null when idle.
function heldMoveDirection() {
  let x = 0;
  let y = 0;
  for (const binding of MOVE_BINDINGS) {
    if (binding.keys.some((key) => input.pressedKeys.has(key))) {
      x += binding.x;
      y += binding.y;
    }
  }
  if (x === 0 && y === 0) return null;
  const length = Math.hypot(x, y);
  return { x: x / length, y: y / length };
}

function applyTerrainHazardsToPlayer(dt) {
  const player = game.player;
  if (isChasmAt(game.tiles, player.x, player.y)) {
    killPlayer('chasm');
    return;
  }
  player.lavaCooldown -= dt;
  if (isLavaAt(game.tiles, player.x, player.y) && player.lavaCooldown <= 0) {
    player.lavaCooldown = LAVA_TICK_INTERVAL;
    hurtPlayer(LAVA_DAMAGE_PER_TICK, 'lava');
  }
}

function hurtPlayer(amount, cause) {
  game.player.hp -= amount;
  if (game.player.hp <= 0) killPlayer(cause);
}

// The first fatal hit decides the game-over copy; later hits can't rewrite it.
function killPlayer(cause) {
  const player = game.player;
  player.hp = 0;
  player.deathCause = player.deathCause ?? cause;
}

function collectGoldPickups() {
  const player = game.player;
  const remaining = [];
  for (const pickup of game.goldPickups) {
    if (distanceBetween(player, pickup) < player.radius + pickup.radius) {
      player.gold += pickup.value;
    } else {
      remaining.push(pickup);
    }
  }
  game.goldPickups = remaining;
}

// -- the Bro --

// The Bro follows a breadcrumb trail of the player's recent positions,
// sampled on a fixed clock so his lag is the same at any frame rate.
function recordPlayerTrail(dt) {
  game.trailTimer += dt * 1000;
  while (game.trailTimer >= BRO_TRAIL.sampleIntervalMs) {
    game.trailTimer -= BRO_TRAIL.sampleIntervalMs;
    game.trail.push({ x: game.player.x, y: game.player.y });
    if (game.trail.length > BRO_TRAIL.lagSamples) game.trail.shift();
  }
}

function moveBroAlongTrail() {
  const bro = game.bro;
  const oldestBreadcrumb = game.trail[0];
  moveWithCollision(
    game.tiles,
    bro,
    oldestBreadcrumb.x - bro.x,
    oldestBreadcrumb.y - bro.y,
    isSolidForBro,
  );
}

// -- guns and bullets --

function firePlayerGun(dt) {
  const player = game.player;
  player.fireCooldown -= dt;
  if (player.fireCooldown > 0) return;
  player.fireCooldown = PLAYER.fireCooldown;
  fireBullet(player, mouseWorldPosition(), PLAYER.bulletDamage, 'player');
}

function fireBroGun(dt) {
  const bro = game.bro;
  bro.fireCooldown -= dt;
  if (bro.fireCooldown > 0) return;
  const target = nearestEnemyWithin(bro, BRO.aggroRange);
  if (!target) return; // hold fire until something wanders into range
  bro.fireCooldown = BRO.fireCooldown;
  fireBullet(bro, target, BRO.bulletDamage, 'bro');
}

function fireBullet(from, toward, damage, firedBy) {
  const angle = Math.atan2(toward.y - from.y, toward.x - from.x);
  game.bullets.push({
    x: from.x,
    y: from.y,
    vx: Math.cos(angle) * BULLET.speed,
    vy: Math.sin(angle) * BULLET.speed,
    damage,
    firedBy,
  });
}

// Solid terrain absorbs bullets; the chasm is open air, so they fly across it.
function moveBullets(dt) {
  const inFlight = [];
  for (const bullet of game.bullets) {
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    if (isSolidTerrain(tileAt(game.tiles, bullet.x, bullet.y))) continue;
    const victim = game.enemies.find(
      (enemy) => enemy.hp > 0 && distanceBetween(bullet, enemy) < enemy.radius + BULLET.radius,
    );
    if (victim) {
      victim.hp -= bullet.damage;
      continue; // the bullet is spent on impact
    }
    inFlight.push(bullet);
  }
  game.bullets = inFlight;
  buryDeadEnemies();
}

// -- enemies --

function moveEnemies(dt) {
  for (const enemy of game.enemies) {
    chaseNearestTarget(enemy, dt);
    applyTerrainHazardsToEnemy(enemy, dt);
    if (enemy.hp <= 0) continue; // the dead don't bite
    applyContactDamage(enemy, dt);
  }
  buryDeadEnemies();
}

function chaseNearestTarget(enemy, dt) {
  const target =
    distanceBetween(enemy, game.bro) < distanceBetween(enemy, game.player) ? game.bro : game.player;
  const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
  const step = enemy.speed * dt;
  moveWithCollision(game.tiles, enemy, Math.cos(angle) * step, Math.sin(angle) * step);
}

function applyTerrainHazardsToEnemy(enemy, dt) {
  if (isChasmAt(game.tiles, enemy.x, enemy.y)) {
    enemy.hp = 0;
    enemy.fellIntoChasm = true;
    return;
  }
  enemy.lavaCooldown -= dt;
  if (isLavaAt(game.tiles, enemy.x, enemy.y) && enemy.lavaCooldown <= 0) {
    enemy.lavaCooldown = LAVA_TICK_INTERVAL;
    enemy.hp -= LAVA_DAMAGE_PER_TICK;
  }
}

function applyContactDamage(enemy, dt) {
  enemy.contactCooldown -= dt;
  if (enemy.contactCooldown > 0) return;
  if (distanceBetween(enemy, game.player) >= enemy.radius + game.player.radius) return;
  enemy.contactCooldown = ENEMY_CONTACT_COOLDOWN;
  hurtPlayer(ENEMY_CONTACT_DAMAGE, 'combat');
}

// Chasm deaths drop nothing — the gold went down with them.
function buryDeadEnemies() {
  for (const enemy of game.enemies) {
    if (enemy.hp <= 0 && !enemy.fellIntoChasm) dropGold(enemy);
  }
  game.enemies = game.enemies.filter((enemy) => enemy.hp > 0);
}

function dropGold(enemy) {
  game.goldPickups.push({
    x: enemy.x,
    y: enemy.y,
    value: enemy.goldValue,
    radius: GOLD_PICKUP_RADIUS,
  });
}

function nearestEnemyWithin(point, range) {
  let nearest = null;
  let nearestDistance = range;
  for (const enemy of game.enemies) {
    const distance = distanceBetween(point, enemy);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = enemy;
    }
  }
  return nearest;
}

// -- level-clear pause --

// Once the last enemy dies, combat stops for a short celebration: projectiles
// vanish, guns hold fire, but the player can still wander and grab gold.
function beginLevelClearPause() {
  game.clearCountdown = LEVEL_CLEAR_PAUSE_SECONDS;
  game.bullets = [];
  showLevelClearOverlay(LEVEL_CLEAR_PAUSE_SECONDS);
}

function tickLevelClearPause(dt) {
  game.clearCountdown -= dt;
  if (game.clearCountdown > 0) {
    updateLevelClearCountdown(game.clearCountdown);
    return;
  }
  startNextLevel();
}

// -- geometry --

// Deliberately unclamped: near the island's edge the view shows the void
// beyond it, rather than pinning the camera and letting the player drift
// off-center.
function cameraCenteredOn(point) {
  return { x: point.x - VIEW_WIDTH / 2, y: point.y - VIEW_HEIGHT / 2 };
}

// The mouse lives in screen space; aiming needs it in world space.
function mouseWorldPosition() {
  return { x: input.mouse.x + game.camera.x, y: input.mouse.y + game.camera.y };
}

function distanceBetween(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
