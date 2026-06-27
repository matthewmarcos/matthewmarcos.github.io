# Arcade: TypeScript Migration + Four New Games — Design

**Date:** 2026-06-27
**Repo:** `matthewmarcos.github.io` (GitHub Pages user site, served at base path `/`)
**Branch:** `wt-20260627-arcade-ts-games`

## Summary

Migrate the hand-written static arcade site to a modern **Vite + React +
TypeScript** single-page app, deployed via **GitHub Actions**, and add four new
games — each backed by a classic search/optimization algorithm exposed as a
pure, unit-tested TypeScript module:

1. **Lights Out (5×5)** — solver via Gaussian elimination over GF(2).
2. **Sliding Puzzle game (3×3 & 4×4)** — solver via A* / IDA*.
3. **Sliding Puzzle solver tool** — type a board, get the click list.
4. **Tic-Tac-Toe** — unbeatable minimax (alpha-beta) opponent.

The existing **Poop Patrol** game is preserved verbatim as a static asset and
linked from the new landing page — it is **not** rewritten.

## Goals

- Introduce a real, statically-typed, transpiled build pipeline (TypeScript,
  bundling, hot-reload dev server) that deploys cleanly to GitHub Pages.
- Add four algorithmic games with clear separation between **pure game/solver
  logic** and **React UI**.
- Keep every solver a dependency-free, independently testable module.

## Non-Goals

- Rewriting Poop Patrol.
- Backend / persistence / accounts. Everything is client-side static.
- Mobile-app packaging.

## Architecture

Full migration to a Vite + React + TypeScript SPA rooted at the repo root.
Client-side routing uses **React Router `HashRouter`** so deep links work on
GitHub Pages with zero 404-fallback configuration.

```
matthewmarcos.github.io/
├─ index.html                 # Vite entry (single SPA shell)
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ .eslintrc / .prettierrc
├─ .github/workflows/deploy.yml
├─ public/
│  └─ poop-patrol/            # existing game, copied verbatim, untouched
├─ src/
│  ├─ main.tsx                # React root mount
│  ├─ App.tsx                 # router + route table
│  ├─ pages/                  # thin UI shells, one per route
│  │  ├─ Landing.tsx
│  │  ├─ LightsOut.tsx
│  │  ├─ SlidingGame.tsx
│  │  ├─ SlidingSolver.tsx
│  │  └─ TicTacToe.tsx
│  ├─ games/                  # PURE logic, no React imports, unit-tested
│  │  ├─ lights-out/
│  │  │  ├─ board.ts          # 5×5 state + press/toggle rules
│  │  │  └─ solver.ts         # GF(2) Gaussian elimination → minimal click set
│  │  ├─ sliding/
│  │  │  ├─ board.ts          # n×n state, legal moves, solvability parity
│  │  │  └─ solver.ts         # A* (3×3) / IDA* (4×4), Manhattan + linear conflict
│  │  └─ tic-tac-toe/
│  │     ├─ board.ts          # 3×3 state, win/draw detection
│  │     └─ minimax.ts        # minimax + alpha-beta, perfect play
│  ├─ components/             # shared neon UI: Grid, Button, Cell, PageShell…
│  └─ styles/                 # shared theme (reuse existing neon palette)
```

**Core principle:** each solver/algorithm is a pure TypeScript module with **no
React dependency**. The playable game page and (for sliding) the standalone
solver page both consume the same module. This keeps logic testable in isolation
and the boundaries clear: a page renders state and dispatches user intent; a
`board` module owns rules and transitions; a `solver` module computes solutions.

## Routes

| Route             | Page          | Description                                                                                       |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `/`               | Landing       | Arcade home; reuses the existing neon aesthetic. Cards link to each game (including Poop Patrol). |
| `/lights-out`     | LightsOut     | Playable 5×5 Lights Out with **Solve** (animated) and **Help** (one-step hint).                   |
| `/sliding`        | SlidingGame   | Playable sliding puzzle, 3×3 / 4×4 toggle, shuffle, **Solve** (animated) and **Help**.            |
| `/sliding-solver` | SlidingSolver | Standalone tool: type any board, get the ordered click list out.                                  |
| `/tic-tac-toe`    | TicTacToe     | Play vs unbeatable computer; choose side / who starts.                                            |

## Game Specifications

### 1. Lights Out (5×5)

- **Board:** 5×5 grid of lit/unlit cells. Pressing a cell toggles itself and its
  four orthogonal neighbors. Win = all cells unlit.
- **Generation:** start from all-off, apply a sequence of random presses → board
  is always solvable.
- **Solver (`solver.ts`):** Gaussian elimination over GF(2) on the 25×25 toggle
  matrix. The 5×5 null space is 2-dimensional → 4 valid solutions; return the
  **minimum-weight** one (fewest clicks). BFS is intentionally **not** used: 5×5
  has 2²⁵ ≈ 33M states, infeasible in-browser; GF(2) elimination is exact and
  instant.
- **Solve interaction:** compute the minimal click set, then **auto-play it step
  by step at 0.5s per step**, visibly toggling each pressed cell. A
  stop/pause control lets the player cancel mid-playback.
- **Help interaction:** highlight **only the next cell to press** (one hint). The
  hint recomputes after every player move so it always points at a valid next
  step toward a solution.

### 2. Sliding Puzzle — Game (`/sliding`)

- **Sizes:** 3×3 (8-puzzle) and 4×4 (15-puzzle), user-toggleable.
- **Play:** click a tile adjacent to the blank to slide it. Win = tiles in
  order with blank last.
- **Shuffle:** generate only **solvable** scrambles (correct permutation parity
  for the grid size).
- **Solver (`solver.ts`, shared):**
  - 3×3 → **A\*** with Manhattan-distance + linear-conflict heuristic. Returns a
    short/optimal move list, instant.
  - 4×4 → **IDA\*** with the same heuristic. BFS/DFS is mathematically infeasible
    (~10¹³ states). Most scrambles solve quickly; pathological ones may take a
    moment (acceptable, surfaced via a "solving…" state).
  - Output: ordered list of **tiles to click** (each move = the tile that slides
    into the blank).
- **Solve / Help interactions:** identical pattern to Lights Out — **Solve**
  auto-plays the move list at 0.5s/step with a stop control; **Help** highlights
  the single next tile to click and recomputes after each move.

### 3. Sliding Puzzle — Solver Tool (`/sliding-solver`)

- **Input:** an editable grid. 3×3 accepts 1–8 + one blank; 4×4 accepts 1–15 +
  one blank.
- **Validation:** must be a valid permutation (each value once, exactly one
  blank) and a **solvable** configuration (parity check). Invalid input shows a
  clear inline error.
- **Output:** runs the shared sliding `solver.ts` and renders the **ordered list
  of tiles to click** to solve from the entered position.
- Reuses the exact same solver module as the game — no duplicate logic.

### 4. Tic-Tac-Toe (`/tic-tac-toe`)

- **Play:** human vs computer on a 3×3 board. Player chooses X/O and who moves
  first.
- **Opponent (`minimax.ts`):** full minimax with alpha-beta pruning. **Perfect
  play only — the computer never loses** (wins or draws every game). No
  difficulty toggle.

## Build, Deployment & Tooling

- **Vite** produces a static `dist/` bundle; base path `/` (user site).
  - `npm run dev` — hot-reload dev server.
  - `npm run build` — production bundle to `dist/`.
  - `npm run preview` — serve the built bundle locally.
  - `npm run test` — Vitest.
- **GitHub Actions — deploy (`.github/workflows/deploy.yml`):** on push to
  `main`, install deps → build → upload the `dist/` artifact → deploy to GitHub
  Pages. Build output is **not** committed; the source tree stays clean.
- **GitHub Actions — CI (`.github/workflows/ci.yml`):** on `pull_request`, install
  deps → run **lint** (ESLint + Prettier check) → typecheck → tests. Reports pass/
  fail status on the PR. Note: the user is **not** enabling branch protection on
  `main`, so this check is **informational** (visible on the PR) rather than a
  merge-blocking gate.
- **One-time manual step (user):** repo **Settings → Pages → Source → "GitHub
  Actions"**. (Switches Pages from branch-serving to the Actions artifact.)
- **Best-practices kit:**
  - TypeScript `strict` mode.
  - ESLint + Prettier.
  - **Vitest** unit tests for the three solver modules.

## Testing Strategy

The pure solver modules are the high-value test targets (ideal for TDD):

- **Lights Out solver:** for randomly generated solvable boards, applying the
  returned click set yields an all-off board; returned set is minimal-weight.
- **Sliding solver:** for random solvable scrambles (3×3 and 4×4), applying the
  returned move list reaches the goal state; each move is legal.
- **Sliding board:** parity/solvability checks accept solvable boards and reject
  unsolvable ones.
- **Tic-tac-toe minimax:** across exhaustive/perfect self-play and adversarial
  play, the minimax player never loses.

UI pages are thin shells over tested logic and verified manually (and via the
running dev server).

## Migration Safety

- Poop Patrol is copied verbatim into `public/poop-patrol/` and linked from the
  landing page. It is not modified or rewritten — zero gameplay regression risk.
- The hand-written root `index.html` is replaced by the React landing page, which
  carries the same visual identity (neon palette, Press Start 2P / Space Grotesk
  fonts, card grid).

## Open Decisions (resolved)

- Lights Out grid: **5×5 only** (classic) → forces GF(2) solver.
- Sliding sizes: **both 3×3 and 4×4** → A* / IDA*.
- Sliding game vs solver: **two separate pages**, shared solver module.
- Solve/Help pattern: applies to **both** Lights Out and the sliding game.
- Tic-tac-toe: **perfect minimax only**, never loses.
- Poop Patrol: **kept as-is** (static).
- Stack: **Vite + React + TypeScript**, **GitHub Actions** deploy, whole-site
  migration.
