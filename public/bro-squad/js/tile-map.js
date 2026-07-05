// Pixel-space queries against the tile grid, and the collision rules shared
// by everything that moves.

import { TILE, TILE_SIZE } from './config.js';

const MAX_SPAWN_ATTEMPTS = 300;

// Returns the tile character at a pixel position, or null off-grid.
export function tileAt(tiles, x, y) {
  const col = Math.floor(x / TILE_SIZE);
  const row = Math.floor(y / TILE_SIZE);
  if (row < 0 || row >= tiles.length || col < 0 || col >= tiles[0].length) return null;
  return tiles[row][col];
}

// Walls, the border ring, and the exterior void stop everything. The chasm is
// open air: bullets fly over it and walkers can step in (fatally — checked
// after moving, not here).
export function isSolidTerrain(tile) {
  return tile === null || tile === TILE.WALL || tile === TILE.BORDER || tile === TILE.VOID;
}

// The Bro has no death system yet, so for him the chasm counts as a wall.
export function isSolidForBro(tile) {
  return isSolidTerrain(tile) || tile === TILE.CHASM;
}

export function isChasmAt(tiles, x, y) {
  return tileAt(tiles, x, y) === TILE.CHASM;
}

export function isLavaAt(tiles, x, y) {
  return tileAt(tiles, x, y) === TILE.LAVA;
}

export function tileCenter(col, row) {
  return {
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
  };
}

// Moves a circular body one axis at a time, so it slides along walls instead
// of sticking to them.
export function moveWithCollision(tiles, body, dx, dy, isBlocked = isSolidTerrain) {
  if (!overlapsBlockedTile(tiles, body.x + dx, body.y, body.radius, isBlocked)) body.x += dx;
  if (!overlapsBlockedTile(tiles, body.x, body.y + dy, body.radius, isBlocked)) body.y += dy;
}

// Checks the four edge points of the body's bounding circle.
function overlapsBlockedTile(tiles, x, y, radius, isBlocked) {
  return (
    isBlocked(tileAt(tiles, x - radius, y)) ||
    isBlocked(tileAt(tiles, x + radius, y)) ||
    isBlocked(tileAt(tiles, x, y - radius)) ||
    isBlocked(tileAt(tiles, x, y + radius))
  );
}

// Picks a random floor tile at least minDistance away from `awayFrom`. Falls
// back to `awayFrom` itself if nothing turns up, which on a healthy island
// effectively never happens.
export function randomFloorPosition(tiles, awayFrom, minDistance) {
  const rows = tiles.length;
  const cols = tiles[0].length;
  for (let attempt = 0; attempt < MAX_SPAWN_ATTEMPTS; attempt++) {
    const col = 1 + Math.floor(Math.random() * (cols - 2));
    const row = 1 + Math.floor(Math.random() * (rows - 2));
    if (tiles[row][col] !== TILE.FLOOR) continue;
    const position = tileCenter(col, row);
    if (Math.hypot(position.x - awayFrom.x, position.y - awayFrom.y) >= minDistance) {
      return position;
    }
  }
  return { x: awayFrom.x, y: awayFrom.y };
}
