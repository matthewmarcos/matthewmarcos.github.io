// Procedural island generation. Each level is one random, organic island on a
// WORLD_COLS x WORLD_ROWS grid: a drunkard's-walk blob of floor, scattered
// interior walls, chasm and lava patches, all sealed by a border ring so the
// only hazards are the deliberate interior ones.

import { TILE, WORLD_COLS, WORLD_ROWS } from './config.js';
import { tileCenter } from './tile-map.js';

// -- generation tuning --
const FLOOR_COVERAGE = 0.38; // fraction of the grid the walk tries to fill
const CARVE_RADIUS = 2; // floor blob stamped around each step of the walk
const WALK_TURN_CHANCE = 0.15; // chance per step to pick a fresh heading
const WALK_WOBBLE = 0.7; // radians of random sway added to the heading
const WALK_MAX_STEPS = 6000; // hard stop in case coverage is never reached
const WALL_CHANCE = 0.05; // per-floor-tile odds of an interior wall
const SPAWN_WALL_CLEARANCE = 2; // tiles around spawn kept free of walls
const SPAWN_HAZARD_CLEARANCE = 5; // tiles around spawn kept free of hazards
const HAZARD_BLOB_RADIUS = 1;
const HAZARD_BLOBS_PER_PATCH = 3; // each patch is a short chain of blobs
const LEVELS_PER_EXTRA_PATCH = 3; // one more patch of each hazard every N levels
const MAX_PATCHES_PER_HAZARD = 4;
const MAX_PLACEMENT_ATTEMPTS = 100;

export function generateIsland(levelNumber) {
  const tiles = makeGrid(TILE.VOID);
  const spawn = { col: Math.floor(WORLD_COLS / 2), row: Math.floor(WORLD_ROWS / 2) };

  carveFloor(tiles, spawn);
  scatterWalls(tiles, spawn);
  paintHazards(tiles, spawn, levelNumber);
  sealUnreachablePockets(tiles, spawn);
  buildBorderRing(tiles);

  return { tiles, spawn: tileCenter(spawn.col, spawn.row) };
}

// Drunkard's walk: stamp a blob of floor, wander a step, repeat until the
// island is big enough (or the step budget runs out).
function carveFloor(tiles, spawn) {
  const targetFloorTiles = Math.floor(WORLD_COLS * WORLD_ROWS * FLOOR_COVERAGE);
  let carved = carveFloorBlob(tiles, spawn.col, spawn.row);
  let col = spawn.col;
  let row = spawn.row;
  let heading = randomHeading();

  for (let step = 0; step < WALK_MAX_STEPS && carved < targetFloorTiles; step++) {
    if (Math.random() < WALK_TURN_CHANCE) heading = randomHeading();
    const angle = heading + (Math.random() - 0.5) * WALK_WOBBLE;
    col = clampToInterior(col + Math.round(Math.cos(angle)), WORLD_COLS);
    row = clampToInterior(row + Math.round(Math.sin(angle)), WORLD_ROWS);
    carved += carveFloorBlob(tiles, col, row);
  }
}

function carveFloorBlob(tiles, centerCol, centerRow) {
  let carved = 0;
  forEachTileInDisc(centerCol, centerRow, CARVE_RADIUS, (col, row) => {
    if (tiles[row][col] !== TILE.VOID) return;
    tiles[row][col] = TILE.FLOOR;
    carved++;
  });
  return carved;
}

function scatterWalls(tiles, spawn) {
  forEachInteriorTile((col, row) => {
    if (tiles[row][col] !== TILE.FLOOR) return;
    if (isNearSpawn(col, row, spawn, SPAWN_WALL_CLEARANCE)) return;
    if (Math.random() < WALL_CHANCE) tiles[row][col] = TILE.WALL;
  });
}

// Hazards scale gently: one more patch of each every few levels, capped.
function paintHazards(tiles, spawn, levelNumber) {
  const patchesPerHazard = Math.min(
    1 + Math.floor((levelNumber - 1) / LEVELS_PER_EXTRA_PATCH),
    MAX_PATCHES_PER_HAZARD,
  );
  for (const hazard of [TILE.CHASM, TILE.LAVA]) {
    for (let i = 0; i < patchesPerHazard; i++) paintHazardPatch(tiles, hazard, spawn);
  }
}

// A patch is a short chain of blobs drifting from a random start, giving an
// irregular pool instead of a neat circle.
function paintHazardPatch(tiles, hazard, spawn) {
  const start = randomFloorTileAwayFromSpawn(tiles, spawn);
  if (!start) return; // no room found; better to skip a patch than crowd the spawn

  let { col, row } = start;
  for (let blob = 0; blob < HAZARD_BLOBS_PER_PATCH; blob++) {
    forEachTileInDisc(col, row, HAZARD_BLOB_RADIUS, (c, r) => {
      if (tiles[r][c] === TILE.FLOOR) tiles[r][c] = hazard;
    });
    col = clampToInterior(col + randomDrift(), WORLD_COLS);
    row = clampToInterior(row + randomDrift(), WORLD_ROWS);
  }
}

function randomFloorTileAwayFromSpawn(tiles, spawn) {
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const col = 1 + Math.floor(Math.random() * (WORLD_COLS - 2));
    const row = 1 + Math.floor(Math.random() * (WORLD_ROWS - 2));
    if (tiles[row][col] !== TILE.FLOOR) continue;
    if (isNearSpawn(col, row, spawn, SPAWN_HAZARD_CLEARANCE)) continue;
    return { col, row };
  }
  return null;
}

// Anything walkable that can't be reached from spawn is filled back in as
// void, so nothing ever spawns in a sealed-off pocket. The chasm is not a
// path — crossing it is fatal — so it deliberately doesn't connect regions.
function sealUnreachablePockets(tiles, spawn) {
  const reachable = makeGrid(false);
  const stack = [[spawn.row, spawn.col]];
  while (stack.length > 0) {
    const [row, col] = stack.pop();
    if (row < 0 || row >= WORLD_ROWS || col < 0 || col >= WORLD_COLS) continue;
    if (reachable[row][col] || !isWalkableGround(tiles[row][col])) continue;
    reachable[row][col] = true;
    stack.push([row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]);
  }

  forEachTile((col, row) => {
    if (isWalkableGround(tiles[row][col]) && !reachable[row][col]) tiles[row][col] = TILE.VOID;
  });
}

// Turns every void tile touching walkable ground into solid border, walling
// off the island's true exterior. Chasm edges are left open on purpose:
// falling in is meant to be possible, walking off the island is not.
function buildBorderRing(tiles) {
  const needsBorder = makeGrid(false);
  forEachTile((col, row) => {
    if (!isWalkableGround(tiles[row][col])) return;
    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];
    for (const [r, c] of neighbors) {
      if (r < 0 || r >= WORLD_ROWS || c < 0 || c >= WORLD_COLS) continue;
      if (tiles[r][c] === TILE.VOID) needsBorder[r][c] = true;
    }
  });

  forEachTile((col, row) => {
    if (needsBorder[row][col]) tiles[row][col] = TILE.BORDER;
  });
}

// -- small helpers --

function makeGrid(fill) {
  return Array.from({ length: WORLD_ROWS }, () => Array(WORLD_COLS).fill(fill));
}

function isWalkableGround(tile) {
  return tile === TILE.FLOOR || tile === TILE.LAVA;
}

function isNearSpawn(col, row, spawn, clearance) {
  return Math.abs(col - spawn.col) <= clearance && Math.abs(row - spawn.row) <= clearance;
}

function randomHeading() {
  return Math.random() * Math.PI * 2;
}

// -2..2 tiles of sideways wander between hazard blobs.
function randomDrift() {
  return Math.round((Math.random() - 0.5) * 3);
}

// Keeps a coordinate away from the outermost two rings, which stay void so
// the border always has room to close.
function clampToInterior(value, size) {
  return Math.max(2, Math.min(size - 3, value));
}

function forEachTile(visit) {
  for (let row = 0; row < WORLD_ROWS; row++) {
    for (let col = 0; col < WORLD_COLS; col++) visit(col, row);
  }
}

function forEachInteriorTile(visit) {
  for (let row = 1; row < WORLD_ROWS - 1; row++) {
    for (let col = 1; col < WORLD_COLS - 1; col++) visit(col, row);
  }
}

// Visits grid cells within `radius` of the center, clipped to the interior.
function forEachTileInDisc(centerCol, centerRow, radius, visit) {
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const col = centerCol + dx;
      const row = centerRow + dy;
      if (col < 1 || col >= WORLD_COLS - 1 || row < 1 || row >= WORLD_ROWS - 1) continue;
      visit(col, row);
    }
  }
}
