# Bro Squad

A top-down, permadeath twin-stick shooter. Placeholder shapes, no art yet.
Inspired by Gun Bros (early iOS).

## Run it

Part of the arcade site: served statically from `public/bro-squad/`, linked from the landing
page. During development, `npm run dev` and open `/bro-squad/index.html`. No build step — plain
ES modules.

## Controls

- **WASD / arrows** to move
- **Mouse** to aim; the gun fires automatically toward the cursor, no ammo to manage
- The Bro trails a few steps behind you and auto-fires at the nearest enemy in range

## Current mechanics

- **Permadeath run**: gold and levels carry forward as you clear rooms; dying resets everything
  back to level 1
- **Procedurally generated maps**: each level is a random, organic (non-rectangular) island,
  bigger than the visible screen; the camera scrolls with the player
- **Hard border**: a solid wall rings the edge of every island, so you can't wander off the
  world by accident
- **Chasm pits**: interior hazard, instant death if you (or an enemy you lure in) step in
- **Lava patches**: interior hazard, drains HP steadily while standing on it
- **Level clear**: killing the last enemy shows a CLEAR banner with a countdown; projectiles
  clear out and firing pauses, but you can still move around and grab leftover gold

## Known simplifications (not bugs, just not built yet)

- The Bro can't take damage or die. Chasm and lava count as solid walls for him instead of
  hazards. Once he gets real HP, this should change.
- No shop, gun variety, or power-ups yet; everything uses the default gun.
- The faint line from the player to the cursor is an aiming aid. Likely becomes a power-up
  (a temporary "laser sight") rather than a permanent feature.
- No sound.

## File layout

```
index.html        page structure; overlays and hud markup live here
css/style.css     all visual styling, including the canvas palette (--* variables)
js/config.js      gameplay tuning: sizes, speeds, damage, enemy stats, tile characters
js/island.js      procedural island generation
js/tile-map.js    tile queries, solidity rules, sliding collision movement
js/state.js       the mutable game/input state and entity factories
js/run.js         run & level lifecycle: start, advance, end
js/update.js      per-frame simulation: movement, guns, hazards, enemies
js/render.js      canvas drawing; reads its palette from the stylesheet
js/hud.js         DOM chrome: readouts, banner, overlays
js/main.js        wiring: canvas setup, input listeners, frame loop
```
