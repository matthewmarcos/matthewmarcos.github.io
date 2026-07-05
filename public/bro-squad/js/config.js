// All gameplay tuning lives here. Distances are in pixels, durations in
// seconds, and speeds in pixels per second unless a name says otherwise.

export const TILE_SIZE = 40;
export const WORLD_COLS = 36;
export const WORLD_ROWS = 26;
export const VIEW_WIDTH = 800;
export const VIEW_HEIGHT = 600;

// Characters used in the generated tile grid (see island.js).
export const TILE = {
  VOID: ' ', // exterior beyond the island; solid and unreachable
  FLOOR: '.', // walkable, safe
  WALL: '#', // interior obstacle; solid, harmless
  BORDER: 'B', // solid ring sealing the island's outer edge
  CHASM: 'V', // interior pit; walkable but instantly fatal
  LAVA: '~', // interior patch; walkable, drains HP while stood on
};

export const PLAYER = {
  speed: 220,
  radius: 14,
  maxHp: 100,
  fireCooldown: 0.22,
  bulletDamage: 12,
};

// The Bro: an invincible companion who trails the player and auto-fires at
// the nearest enemy in range.
export const BRO = {
  radius: 12,
  fireCooldown: 0.5,
  bulletDamage: 8,
  aggroRange: 260,
};

// The Bro walks toward where the player was lagSamples samples ago. Sampling
// on a fixed clock keeps his lag the same at any frame rate.
export const BRO_TRAIL = {
  sampleIntervalMs: 60,
  lagSamples: 10,
};

export const BULLET = {
  speed: 480,
  radius: 4,
};

// Base stats per enemy type; hp and speed scale with the level number at
// spawn time (see run.js). Colors live in the stylesheet as --enemy-<type>.
export const ENEMY_TYPES = {
  grunt: { radius: 14, speed: 75, hp: 20, gold: 5 },
  runner: { radius: 10, speed: 135, hp: 10, gold: 3 },
  brute: { radius: 22, speed: 42, hp: 60, gold: 15 },
};

export const ENEMY_CONTACT_DAMAGE = 8;
export const ENEMY_CONTACT_COOLDOWN = 0.6;

export const LAVA_DAMAGE_PER_TICK = 6;
export const LAVA_TICK_INTERVAL = 0.4;

export const LEVEL_CLEAR_PAUSE_SECONDS = 3;

export const GOLD_PICKUP_RADIUS = 6;
