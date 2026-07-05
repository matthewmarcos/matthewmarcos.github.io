// Everything DOM: the hud readouts, the level banner, the CLEAR overlay, and
// the start / game-over screens. Only reads game state, never mutates it.

import { PLAYER } from './config.js';
import { game } from './state.js';

const BANNER_DURATION_MS = 1400;

// Copy per cause of death, shown on the game-over screen.
const GAME_OVER_COPY = {
  combat: {
    headline: 'RUN OVER',
    flavor: "Permadeath means everything resets. Here's how far you got:",
  },
  chasm: {
    headline: 'YOU FELL IN',
    flavor: 'The chasm does not care about your HP bar. Permadeath means everything resets.',
  },
  lava: {
    headline: 'BURNED UP',
    flavor: 'Standing in lava adds up fast. Permadeath means everything resets.',
  },
};

const hpBarFill = document.getElementById('hp-bar-fill');
const hpText = document.getElementById('hp-text');
const goldText = document.getElementById('gold-text');
const levelText = document.getElementById('level-text');
const enemyCountText = document.getElementById('enemy-count');
const banner = document.getElementById('banner');
const clearOverlay = document.getElementById('clear-overlay');
const clearCountdownText = document.getElementById('clear-countdown');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverHeadline = document.getElementById('game-over-headline');
const gameOverFlavor = document.getElementById('game-over-flavor');
const gameOverStats = document.getElementById('game-over-stats');

let bannerHideTimer = 0;

export function updateHud() {
  const player = game.player;
  const hpPercent = Math.max(0, (player.hp / PLAYER.maxHp) * 100);
  hpBarFill.style.width = `${hpPercent}%`;
  hpText.textContent = `${Math.round(Math.max(0, player.hp))}/${PLAYER.maxHp}`;
  goldText.textContent = player.gold;
  levelText.textContent = game.levelNumber;
  enemyCountText.textContent = game.enemies.length;
}

export function showBanner(message) {
  banner.textContent = message;
  banner.classList.add('show');
  clearTimeout(bannerHideTimer);
  bannerHideTimer = setTimeout(() => banner.classList.remove('show'), BANNER_DURATION_MS);
}

export function showLevelClearOverlay(secondsLeft) {
  updateLevelClearCountdown(secondsLeft);
  clearOverlay.classList.add('show');
}

export function updateLevelClearCountdown(secondsLeft) {
  clearCountdownText.textContent = `next level in ${Math.max(1, Math.ceil(secondsLeft))}`;
}

export function hideLevelClearOverlay() {
  clearOverlay.classList.remove('show');
}

export function showGameOverScreen(cause) {
  const copy = GAME_OVER_COPY[cause] ?? GAME_OVER_COPY.combat;
  gameOverHeadline.textContent = copy.headline;
  gameOverFlavor.textContent = copy.flavor;
  gameOverStats.textContent = `Reached level ${game.levelNumber} • ${game.player.gold} gold collected`;
  hideLevelClearOverlay();
  gameOverScreen.classList.remove('hidden');
}

export function hideGameOverScreen() {
  gameOverScreen.classList.add('hidden');
}

export function hideStartScreen() {
  startScreen.classList.add('hidden');
}
