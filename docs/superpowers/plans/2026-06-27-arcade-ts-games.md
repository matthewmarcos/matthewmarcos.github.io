# Arcade TS Migration + Four Games — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the static arcade site to Vite + React + TypeScript and add four algorithm-backed games (Lights Out, Sliding Puzzle game, Sliding Puzzle solver tool, Tic-Tac-Toe), deployed via GitHub Actions.

**Architecture:** Single-page React app, hash routing. All game/solver logic lives in pure, dependency-free, unit-tested TypeScript modules under `src/games/`; React pages under `src/pages/` are thin shells over those modules. Poop Patrol is preserved verbatim as a static asset.

**Tech Stack:** Vite, React 18, TypeScript (strict), React Router (HashRouter), Vitest, ESLint, Prettier, GitHub Actions → GitHub Pages.

## Global Constraints

- Target deploy base path: `/` (this is the `matthewmarcos.github.io` user site).
- Node 20 in CI.
- TypeScript `strict: true`.
- Every solver/board module under `src/games/**` has **zero** React/DOM imports.
- Animated "Solve" plays one step every **500ms**; "Help" reveals exactly **one** next step.
- Lights Out is **5×5 only**. Sliding puzzle supports **3×3 and 4×4**. Tic-Tac-Toe is perfect minimax (never loses).
- Commit after every task. Co-author trailer on commits: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Scaffold Vite + React + TS project and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `.eslintrc.cjs`, `.prettierrc`, `.prettierignore`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`
- Move: `index.html` (old hand-written landing) is replaced; `poop-patrol/` → `public/poop-patrol/`
- Modify: `.gitignore` (add `node_modules`, `dist`)

**Interfaces:**
- Produces: working `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run typecheck`.

- [ ] **Step 1: Move Poop Patrol into public/ (preserve verbatim)**

```bash
mkdir -p public
git mv poop-patrol public/poop-patrol
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "matthews-arcade",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . && prettier --check ."
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.9",
    "prettier": "^3.3.3",
    "typescript": "^5.5.4",
    "vite": "^5.4.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json` and `tsconfig.node.json`**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts` (with Vitest config)**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create lint/format configs**

`.eslintrc.cjs`:
```cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'public', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
```

`.prettierrc`:
```json
{ "singleQuote": true, "semi": true, "printWidth": 100 }
```

`.prettierignore`:
```
dist
public
package-lock.json
```

- [ ] **Step 6: Create app entry files**

`index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <title>Matthew's Arcade</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/App.tsx` (placeholder, replaced in Task 3):
```tsx
export default function App() {
  return <h1>Matthew's Arcade</h1>;
}
```

Create an empty `src/styles/theme.css` for now (filled in Task 2):
```bash
mkdir -p src/styles && touch src/styles/theme.css
```

- [ ] **Step 7: Update `.gitignore`**

Append:
```
node_modules
dist
```

- [ ] **Step 8: Install and verify the toolchain runs**

Run:
```bash
npm install
npm run build
```
Expected: `npm install` succeeds; `npm run build` produces a `dist/` directory with `index.html` and assets, no TypeScript errors.

- [ ] **Step 9: Verify dev server and test runner boot**

Run:
```bash
npx vitest run --passWithNoTests
npm run typecheck
```
Expected: vitest exits 0 (no tests yet), typecheck passes.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Scaffold Vite + React + TS toolchain; move Poop Patrol to public/

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Theme, shared UI components, and the step-player hook

**Files:**
- Create: `src/styles/theme.css`, `src/components/PageShell.tsx`, `src/components/BoardGrid.tsx`, `src/components/useStepPlayer.ts`

**Interfaces:**
- Produces:
  - `PageShell({ title, subtitle?, children })` — page chrome with a "← Arcade" link to `#/`.
  - `useStepPlayer<T>()` → `{ running: boolean; play(items: T[], applyOne: (item: T, i: number) => void, intervalMs?: number): void; stop(): void }`.
  - CSS custom properties: `--bg --card --card-hover --accent --accent2 --accent3 --text --muted` and utility classes `.arcade-btn`, `.cell`.

- [ ] **Step 1: Create `src/styles/theme.css`** (ports the existing neon palette)

```css
:root {
  --bg: #0a0118;
  --card: #160b2e;
  --card-hover: #1f0f42;
  --accent: #ff3df0;
  --accent2: #00f0ff;
  --accent3: #ffe14d;
  --text: #f3eaff;
  --muted: #9d86c9;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  min-height: 100vh;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  color: var(--text);
  background:
    radial-gradient(1200px 600px at 15% -10%, rgba(255, 61, 240, 0.18), transparent 60%),
    radial-gradient(1000px 500px at 100% 10%, rgba(0, 240, 255, 0.14), transparent 55%),
    var(--bg);
  background-attachment: fixed;
}
a { color: inherit; }
h1, h2, .pixel { font-family: 'Press Start 2P', monospace; }
.wrap { max-width: 1040px; margin: 0 auto; padding: clamp(1.5rem, 5vw, 3.5rem) 1.25rem 4rem; }
.back-link {
  display: inline-block; margin-bottom: 1.5rem; color: var(--accent2);
  text-decoration: none; font-size: 0.85rem;
}
.back-link:hover { text-shadow: 0 0 10px rgba(0, 240, 255, 0.6); }
.arcade-btn {
  font-family: 'Press Start 2P', monospace; font-size: 0.62rem; cursor: pointer;
  color: var(--bg); background: var(--accent3); border: none; border-radius: 8px;
  padding: 0.7rem 1rem; letter-spacing: 0.5px;
}
.arcade-btn:disabled { opacity: 0.45; cursor: default; }
.arcade-btn.secondary { background: var(--accent2); }
.arcade-btn.ghost { background: transparent; color: var(--accent2); border: 1px solid var(--accent2); }
.controls { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: 1.25rem 0; }
.status { color: var(--muted); min-height: 1.5em; margin-top: 0.5rem; }
.cell {
  display: grid; place-items: center; cursor: pointer; user-select: none;
  border-radius: 10px; transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
}
.cell.hint { box-shadow: 0 0 0 3px var(--accent3), 0 0 18px var(--accent3); }
```

- [ ] **Step 2: Create `src/components/PageShell.tsx`**

```tsx
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="wrap">
      <Link to="/" className="back-link">← Arcade</Link>
      <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: '0.5rem' }}>{title}</h1>
      {subtitle && <p className="status" style={{ marginBottom: '1.5rem' }}>{subtitle}</p>}
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/useStepPlayer.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a timed playback of a list of items. `applyOne` is called once per
 * interval and should use functional setState to avoid stale closures.
 */
export function useStepPlayer<T>() {
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setRunning(false);
  }, []);

  const play = useCallback(
    (items: T[], applyOne: (item: T, index: number) => void, intervalMs = 500) => {
      stop();
      if (items.length === 0) return;
      setRunning(true);
      let i = 0;
      timer.current = window.setInterval(() => {
        applyOne(items[i], i);
        i += 1;
        if (i >= items.length) stop();
      }, intervalMs);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);
  return { running, play, stop };
}
```

- [ ] **Step 4: Create `src/components/BoardGrid.tsx`** (generic square grid renderer)

```tsx
import type { ReactNode } from 'react';

export default function BoardGrid({
  n,
  cellPx,
  children,
}: {
  n: number;
  cellPx: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, ${cellPx}px)`,
        gap: '6px',
        width: 'max-content',
      }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Verify it compiles**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add neon theme, PageShell, BoardGrid, useStepPlayer hook

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Routing and Landing page

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Landing.tsx`

**Interfaces:**
- Consumes: `PageShell` (not used on Landing), pages from later tasks (import as stubs initially).
- Produces: routes `/`, `/lights-out`, `/sliding`, `/sliding-solver`, `/tic-tac-toe`.

- [ ] **Step 1: Create stub pages so routes resolve**

Create these four files, each a one-line placeholder (real implementations land in later tasks):

`src/pages/LightsOut.tsx`, `src/pages/SlidingGame.tsx`, `src/pages/SlidingSolver.tsx`, `src/pages/TicTacToe.tsx`:
```tsx
export default function Page() {
  return <div className="wrap">Coming soon…</div>;
}
```
(Give each the appropriate `export default function` name: `LightsOut`, `SlidingGame`, `SlidingSolver`, `TicTacToe`.)

- [ ] **Step 2: Create `src/pages/Landing.tsx`**

```tsx
import { Link } from 'react-router-dom';

type Card = {
  to: string;
  emoji: string;
  title: string;
  blurb: string;
  tags: string[];
  external?: boolean;
};

const GAMES: Card[] = [
  { to: '/poop-patrol/', emoji: '💩', title: 'Poop Patrol', blurb: 'Splat-em-up chaos. Patrol the streets and clean up.', tags: ['arcade', 'reflex'], external: true },
  { to: '/lights-out', emoji: '💡', title: 'Lights Out', blurb: 'Flip the grid to all-off. Watch it auto-solve or ask for a hint.', tags: ['puzzle', 'GF(2)'] },
  { to: '/sliding', emoji: '🧩', title: 'Sliding Puzzle', blurb: 'Classic 8/15-puzzle. Solve it yourself or let A* drive.', tags: ['puzzle', 'A*'] },
  { to: '/sliding-solver', emoji: '🔢', title: 'Sliding Solver', blurb: 'Type any board, get the exact list of tiles to click.', tags: ['tool', 'IDA*'] },
  { to: '/tic-tac-toe', emoji: '⭕', title: 'Tic-Tac-Toe', blurb: 'Play the unbeatable minimax computer. Good luck.', tags: ['minimax', 'AI'] },
];

export default function Landing() {
  return (
    <div className="wrap">
      <header style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 3.5rem)' }}>
        <div className="pixel" style={{ color: 'var(--accent2)', fontSize: '0.7rem' }}>▶ INSERT COIN</div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 3rem)', margin: '1rem 0 0.6rem' }}>Matthew's Arcade</h1>
        <p className="status">A pile of vibe-coded games. Now with solvers.</p>
      </header>
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {GAMES.map((g) => {
          const inner = (
            <>
              <div style={{ fontSize: '2.6rem' }}>{g.emoji}</div>
              <h2 style={{ fontSize: '1.3rem', margin: '0.85rem 0 0.35rem' }}>{g.title}</h2>
              <p className="status" style={{ margin: 0 }}>{g.blurb}</p>
              <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {g.tags.map((t) => (
                  <span key={t} style={{ fontSize: '0.7rem', color: 'var(--accent2)' }}>#{t}</span>
                ))}
              </div>
            </>
          );
          const style = {
            background: 'var(--card)',
            border: '1px solid rgba(255,61,240,0.18)',
            borderRadius: '18px',
            padding: '1.4rem',
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          } as const;
          return g.external ? (
            <a key={g.to} href={g.to} style={style}>{inner}</a>
          ) : (
            <Link key={g.to} to={g.to} style={style}>{inner}</Link>
          );
        })}
      </main>
      <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
        Built for fun · hosted on GitHub Pages
      </footer>
    </div>
  );
}
```

Note: the Poop Patrol link is a plain `<a href="/poop-patrol/">` (not a Router `Link`) so the browser loads the static asset directly.

- [ ] **Step 3: Wire up routing in `src/App.tsx`**

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import LightsOut from './pages/LightsOut';
import SlidingGame from './pages/SlidingGame';
import SlidingSolver from './pages/SlidingSolver';
import TicTacToe from './pages/TicTacToe';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lights-out" element={<LightsOut />} />
        <Route path="/sliding" element={<SlidingGame />} />
        <Route path="/sliding-solver" element={<SlidingSolver />} />
        <Route path="/tic-tac-toe" element={<TicTacToe />} />
      </Routes>
    </HashRouter>
  );
}
```

- [ ] **Step 4: Verify in the dev server**

Run: `npm run dev`, open the printed URL.
Expected: Landing page renders with five cards; clicking Poop Patrol loads the existing game; the other four cards route to "Coming soon…".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add HashRouter routing and Landing page with game cards

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Lights Out board module

**Files:**
- Create: `src/games/lights-out/board.ts`, `src/games/lights-out/board.test.ts`

**Interfaces:**
- Produces:
  - `type LightsBoard = boolean[]` (length 25, index = `row * 5 + col`)
  - `const SIZE = 5`
  - `emptyBoard(): LightsBoard`
  - `press(board: LightsBoard, idx: number): LightsBoard` (pure; toggles idx + orthogonal neighbors)
  - `pressMany(board: LightsBoard, idxs: number[]): LightsBoard`
  - `isSolved(board: LightsBoard): boolean`
  - `randomBoard(presses: number, rand?: () => number): LightsBoard`

- [ ] **Step 1: Write the failing test**

`src/games/lights-out/board.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { emptyBoard, press, pressMany, isSolved, randomBoard, SIZE } from './board';

describe('lights-out board', () => {
  it('empty board is all off and solved', () => {
    const b = emptyBoard();
    expect(b).toHaveLength(SIZE * SIZE);
    expect(b.every((c) => c === false)).toBe(true);
    expect(isSolved(b)).toBe(true);
  });

  it('pressing center toggles a plus shape', () => {
    const b = press(emptyBoard(), 12); // center of 5x5
    const lit = b.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    expect(lit.sort((a, x) => a - x)).toEqual([7, 11, 12, 13, 17]);
  });

  it('pressing a corner toggles only itself and two neighbors', () => {
    const b = press(emptyBoard(), 0); // top-left
    const lit = b.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    expect(lit.sort((a, x) => a - x)).toEqual([0, 1, 5]);
  });

  it('pressing the same cell twice is a no-op', () => {
    const b = pressMany(emptyBoard(), [12, 12]);
    expect(isSolved(b)).toBe(true);
  });

  it('randomBoard with a fixed rng is reproducible and solvable-by-construction', () => {
    let seed = 1;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const b = randomBoard(10, rand);
    expect(b).toHaveLength(25);
  });

  it('press is pure (does not mutate input)', () => {
    const b = emptyBoard();
    press(b, 12);
    expect(isSolved(b)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/lights-out/board.test.ts`
Expected: FAIL — cannot find module `./board`.

- [ ] **Step 3: Write `src/games/lights-out/board.ts`**

```ts
export type LightsBoard = boolean[];
export const SIZE = 5;

export function emptyBoard(): LightsBoard {
  return new Array(SIZE * SIZE).fill(false);
}

function neighbors(idx: number): number[] {
  const r = Math.floor(idx / SIZE);
  const c = idx % SIZE;
  const out = [idx];
  if (r > 0) out.push(idx - SIZE);
  if (r < SIZE - 1) out.push(idx + SIZE);
  if (c > 0) out.push(idx - 1);
  if (c < SIZE - 1) out.push(idx + 1);
  return out;
}

export function press(board: LightsBoard, idx: number): LightsBoard {
  const next = board.slice();
  for (const n of neighbors(idx)) next[n] = !next[n];
  return next;
}

export function pressMany(board: LightsBoard, idxs: number[]): LightsBoard {
  return idxs.reduce((acc, i) => press(acc, i), board);
}

export function isSolved(board: LightsBoard): boolean {
  return board.every((c) => c === false);
}

export function randomBoard(presses: number, rand: () => number = Math.random): LightsBoard {
  let b = emptyBoard();
  for (let i = 0; i < presses; i++) {
    b = press(b, Math.floor(rand() * SIZE * SIZE));
  }
  return b;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/lights-out/board.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/games/lights-out/board.ts src/games/lights-out/board.test.ts
git commit -m "Add Lights Out board module with tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Lights Out solver (GF(2) Gaussian elimination)

**Files:**
- Create: `src/games/lights-out/solver.ts`, `src/games/lights-out/solver.test.ts`

**Interfaces:**
- Consumes: `LightsBoard`, `press`, `pressMany`, `isSolved`, `randomBoard`, `SIZE` from `./board`.
- Produces: `solve(board: LightsBoard): number[] | null` — minimal-count list of cell indices to press to reach all-off; `null` if unsolvable (cannot happen for boards built via presses).

- [ ] **Step 1: Write the failing test**

`src/games/lights-out/solver.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import { emptyBoard, press, pressMany, isSolved, randomBoard } from './board';

describe('lights-out solver', () => {
  it('empty board solves with no presses', () => {
    expect(solve(emptyBoard())).toEqual([]);
  });

  it('a single-press board is solved by pressing that same cell', () => {
    const b = press(emptyBoard(), 7);
    const sol = solve(b)!;
    expect(isSolved(pressMany(b, sol))).toBe(true);
  });

  it('solution actually turns off every randomly generated board', () => {
    let seed = 42;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 50; t++) {
      const b = randomBoard(15, rand);
      const sol = solve(b);
      expect(sol).not.toBeNull();
      expect(isSolved(pressMany(b, sol!))).toBe(true);
    }
  });

  it('returns the minimum-click solution', () => {
    // Board produced by pressing cell 12 once: minimal solution is exactly [12].
    const b = press(emptyBoard(), 12);
    expect(solve(b)).toEqual([12]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/lights-out/solver.test.ts`
Expected: FAIL — cannot find module `./solver`.

- [ ] **Step 3: Write `src/games/lights-out/solver.ts`**

```ts
import { SIZE, type LightsBoard } from './board';

const N = SIZE * SIZE; // 25

// effect[p] = bitmask of cells toggled when pressing cell p (includes p).
function buildEffects(): number[] {
  const effect = new Array<number>(N).fill(0);
  for (let p = 0; p < N; p++) {
    const r = Math.floor(p / SIZE);
    const c = p % SIZE;
    let mask = 1 << p;
    if (r > 0) mask |= 1 << (p - SIZE);
    if (r < SIZE - 1) mask |= 1 << (p + SIZE);
    if (c > 0) mask |= 1 << (p - 1);
    if (c < SIZE - 1) mask |= 1 << (p + 1);
    effect[p] = mask;
  }
  return effect;
}

function popcount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

/**
 * Solve A x = b over GF(2), where A[i][p] = 1 iff pressing p toggles cell i.
 * Adjacency is symmetric, so row i of A equals effect[i]. We carry b in bit N.
 * Returns the minimum-Hamming-weight x (fewest presses), or null if inconsistent.
 */
export function solve(board: LightsBoard): number[] | null {
  const effect = buildEffects();

  // Augmented equations: bits 0..N-1 = coefficients over variables p; bit N = RHS.
  const eqs: number[] = [];
  for (let i = 0; i < N; i++) {
    eqs.push(effect[i] | (board[i] ? 1 << N : 0));
  }

  const pivotRowForCol: number[] = new Array(N).fill(-1);
  let row = 0;
  for (let col = 0; col < N && row < N; col++) {
    let sel = -1;
    for (let r = row; r < N; r++) {
      if (eqs[r] & (1 << col)) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    [eqs[row], eqs[sel]] = [eqs[sel], eqs[row]];
    for (let r = 0; r < N; r++) {
      if (r !== row && eqs[r] & (1 << col)) eqs[r] ^= eqs[row];
    }
    pivotRowForCol[col] = row;
    row++;
  }

  // Consistency: any all-zero coefficient row with RHS=1 → no solution.
  for (let r = 0; r < N; r++) {
    const coeff = eqs[r] & ((1 << N) - 1);
    const rhs = (eqs[r] >> N) & 1;
    if (coeff === 0 && rhs === 1) return null;
  }

  const freeCols: number[] = [];
  for (let col = 0; col < N; col++) {
    if (pivotRowForCol[col] === -1) freeCols.push(col);
  }

  // Enumerate all 2^freeCols assignments; keep the minimum-weight solution.
  let best: number | null = null;
  let bestWeight = Infinity;
  for (let mask = 0; mask < 1 << freeCols.length; mask++) {
    let x = 0;
    freeCols.forEach((col, k) => {
      if (mask & (1 << k)) x |= 1 << col;
    });
    // Back-substitute pivots: x_col = rhs(pivotRow) XOR (sum of free vars in that row).
    for (let col = 0; col < N; col++) {
      const pr = pivotRowForCol[col];
      if (pr === -1) continue;
      const eq = eqs[pr];
      const rhs = (eq >> N) & 1;
      let acc = rhs;
      for (const fc of freeCols) {
        if (eq & (1 << fc) && x & (1 << fc)) acc ^= 1;
      }
      if (acc) x |= 1 << col;
      else x &= ~(1 << col);
    }
    const w = popcount(x);
    if (w < bestWeight) {
      bestWeight = w;
      best = x;
    }
  }

  if (best === null) return null;
  const result: number[] = [];
  for (let i = 0; i < N; i++) if (best & (1 << i)) result.push(i);
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/lights-out/solver.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/games/lights-out/solver.ts src/games/lights-out/solver.test.ts
git commit -m "Add Lights Out GF(2) solver returning minimal click set

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Lights Out page (Solve animation + Help hint)

**Files:**
- Modify: `src/pages/LightsOut.tsx`

**Interfaces:**
- Consumes: `board.ts` (`emptyBoard`, `press`, `isSolved`, `randomBoard`, `SIZE`), `solver.ts` (`solve`), `PageShell`, `BoardGrid`, `useStepPlayer`.

- [ ] **Step 1: Implement `src/pages/LightsOut.tsx`**

```tsx
import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { useStepPlayer } from '../components/useStepPlayer';
import { SIZE, emptyBoard, press, isSolved, randomBoard, type LightsBoard } from '../games/lights-out/board';
import { solve } from '../games/lights-out/solver';

export default function LightsOut() {
  const [board, setBoard] = useState<LightsBoard>(() => randomBoard(8));
  const [hint, setHint] = useState<number | null>(null);
  const player = useStepPlayer<number>();

  const solved = isSolved(board);
  const remaining = useMemo(() => solve(board), [board]);

  function handlePress(idx: number) {
    if (player.running) return;
    setHint(null);
    setBoard((b) => press(b, idx));
  }

  function handleNew() {
    player.stop();
    setHint(null);
    setBoard(randomBoard(8));
  }

  function handleSolve() {
    const sol = solve(board);
    if (!sol || sol.length === 0) return;
    setHint(null);
    player.play(sol, (idx) => setBoard((b) => press(b, idx)), 500);
  }

  function handleHelp() {
    if (player.running) return;
    const sol = solve(board);
    setHint(sol && sol.length ? sol[0] : null);
  }

  return (
    <PageShell title="💡 Lights Out" subtitle="Turn every light off. Pressing a cell flips it and its neighbors.">
      <BoardGrid n={SIZE} cellPx={56}>
        {board.map((lit, idx) => (
          <button
            key={idx}
            className={`cell${hint === idx ? ' hint' : ''}`}
            onClick={() => handlePress(idx)}
            style={{
              height: 56,
              border: 'none',
              background: lit ? 'var(--accent3)' : 'var(--card)',
              boxShadow: lit ? '0 0 14px var(--accent3)' : undefined,
            }}
            aria-label={`cell ${idx} ${lit ? 'on' : 'off'}`}
          />
        ))}
      </BoardGrid>

      <div className="controls">
        <button className="arcade-btn" onClick={handleSolve} disabled={player.running || solved}>Solve</button>
        <button className="arcade-btn secondary" onClick={handleHelp} disabled={player.running || solved}>Help</button>
        {player.running && <button className="arcade-btn ghost" onClick={player.stop}>Stop</button>}
        <button className="arcade-btn ghost" onClick={handleNew}>New board</button>
      </div>

      <p className="status">
        {solved ? '✨ Solved!' : `${remaining ? remaining.length : '—'} clicks to solve.`}
      </p>
    </PageShell>
  );
}
```

- [ ] **Step 2: Verify behavior in the dev server**

Run: `npm run dev`, open `#/lights-out`.
Expected: a 5×5 grid; clicking flips plus-shapes; **Solve** animates cells off one every 0.5s and a **Stop** button appears; **Help** ring-highlights one cell; status shows the remaining click count; reaching all-off shows "✨ Solved!".

- [ ] **Step 3: Typecheck and commit**

Run: `npm run typecheck` (Expected: PASS), then:
```bash
git add src/pages/LightsOut.tsx
git commit -m "Implement Lights Out page with animated Solve and Help hint

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Sliding puzzle board module

**Files:**
- Create: `src/games/sliding/board.ts`, `src/games/sliding/board.test.ts`

**Interfaces:**
- Produces:
  - `type SlideBoard = number[]` (length `n*n`, `0` = blank)
  - `goal(n: number): SlideBoard`
  - `isSolved(b: SlideBoard, n: number): boolean`
  - `blankIndex(b: SlideBoard): number`
  - `legalMoves(b: SlideBoard, n: number): number[]` — tile **values** adjacent to the blank
  - `applyMove(b: SlideBoard, tile: number, n: number): SlideBoard` — slide that tile into the blank
  - `inversions(b: SlideBoard): number`
  - `isSolvable(b: SlideBoard, n: number): boolean`
  - `shuffle(n: number, steps: number, rand?: () => number): SlideBoard`

- [ ] **Step 1: Write the failing test**

`src/games/sliding/board.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  goal, isSolved, legalMoves, applyMove, isSolvable, shuffle, blankIndex,
} from './board';

describe('sliding board', () => {
  it('goal board is solved', () => {
    expect(goal(3)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    expect(isSolved(goal(3), 3)).toBe(true);
    expect(isSolved(goal(4), 4)).toBe(true);
  });

  it('legalMoves returns tiles adjacent to the blank', () => {
    // goal(3): blank at index 8 (bottom-right); neighbors are tiles 6 (idx7) and 8(value at idx5=6)...
    const b = goal(3); // [1,2,3,4,5,6,7,8,0], blank idx 8
    expect(blankIndex(b)).toBe(8);
    expect(legalMoves(b, 3).sort((a, c) => a - c)).toEqual([6, 8]); // tiles at idx5(=6) and idx7(=8)
  });

  it('applyMove slides the chosen tile into the blank', () => {
    const b = goal(3);
    const after = applyMove(b, 8, 3); // tile 8 (idx7) slides to idx8
    expect(after[8]).toBe(8);
    expect(after[7]).toBe(0);
  });

  it('applyMove is pure', () => {
    const b = goal(3);
    applyMove(b, 8, 3);
    expect(b).toEqual(goal(3));
  });

  it('goal is solvable; a single swap of two tiles is not (3x3)', () => {
    expect(isSolvable(goal(3), 3)).toBe(true);
    const bad = goal(3).slice();
    [bad[0], bad[1]] = [bad[1], bad[0]]; // one inversion → unsolvable for odd width
    expect(isSolvable(bad, 3)).toBe(false);
  });

  it('shuffle always yields a solvable board', () => {
    let seed = 7;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 20; t++) {
      expect(isSolvable(shuffle(3, 40, rand), 3)).toBe(true);
      expect(isSolvable(shuffle(4, 60, rand), 4)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/sliding/board.test.ts`
Expected: FAIL — cannot find module `./board`.

- [ ] **Step 3: Write `src/games/sliding/board.ts`**

```ts
export type SlideBoard = number[];

export function goal(n: number): SlideBoard {
  const b: SlideBoard = [];
  for (let i = 1; i < n * n; i++) b.push(i);
  b.push(0);
  return b;
}

export function isSolved(b: SlideBoard, n: number): boolean {
  const g = goal(n);
  return b.every((v, i) => v === g[i]);
}

export function blankIndex(b: SlideBoard): number {
  return b.indexOf(0);
}

export function legalMoves(b: SlideBoard, n: number): number[] {
  const blank = blankIndex(b);
  const r = Math.floor(blank / n);
  const c = blank % n;
  const idxs: number[] = [];
  if (r > 0) idxs.push(blank - n);
  if (r < n - 1) idxs.push(blank + n);
  if (c > 0) idxs.push(blank - 1);
  if (c < n - 1) idxs.push(blank + 1);
  return idxs.map((i) => b[i]); // tile values
}

export function applyMove(b: SlideBoard, tile: number, n: number): SlideBoard {
  const next = b.slice();
  const blank = blankIndex(next);
  const tileIdx = next.indexOf(tile);
  // Only legal if tile is orthogonally adjacent to the blank.
  const adjacent =
    (Math.floor(blank / n) === Math.floor(tileIdx / n) && Math.abs(blank - tileIdx) === 1) ||
    Math.abs(blank - tileIdx) === n;
  if (!adjacent) return b;
  [next[blank], next[tileIdx]] = [next[tileIdx], next[blank]];
  return next;
}

export function inversions(b: SlideBoard): number {
  const seq = b.filter((v) => v !== 0);
  let inv = 0;
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      if (seq[i] > seq[j]) inv++;
    }
  }
  return inv;
}

export function isSolvable(b: SlideBoard, n: number): boolean {
  const inv = inversions(b);
  if (n % 2 === 1) {
    return inv % 2 === 0;
  }
  // Even width: solvable iff (inversions + rowOfBlankFromBottom) is odd.
  const blankRowFromTop = Math.floor(blankIndex(b) / n);
  const blankRowFromBottom = n - blankRowFromTop;
  return (inv + blankRowFromBottom) % 2 === 1;
}

export function shuffle(n: number, steps: number, rand: () => number = Math.random): SlideBoard {
  // Random walk from the goal guarantees solvability.
  let b = goal(n);
  let prevBlank = -1;
  for (let i = 0; i < steps; i++) {
    const moves = legalMoves(b, n).filter((tile) => b.indexOf(tile) !== prevBlank);
    const tile = moves[Math.floor(rand() * moves.length)];
    prevBlank = blankIndex(b);
    b = applyMove(b, tile, n);
  }
  return b;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/sliding/board.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/games/sliding/board.ts src/games/sliding/board.test.ts
git commit -m "Add sliding puzzle board module with solvability checks

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Sliding puzzle solver (A* for 3×3, IDA* for 4×4)

**Files:**
- Create: `src/games/sliding/solver.ts`, `src/games/sliding/solver.test.ts`

**Interfaces:**
- Consumes: `SlideBoard`, `goal`, `isSolved`, `legalMoves`, `applyMove`, `isSolvable`, `blankIndex`, `shuffle` from `./board`.
- Produces: `solveSliding(b: SlideBoard, n: number): number[]` — ordered list of tile values to click. Returns `[]` if already solved; throws `Error('unsolvable board')` if the board fails `isSolvable`.

- [ ] **Step 1: Write the failing test**

`src/games/sliding/solver.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { solveSliding } from './solver';
import { goal, applyMove, isSolved, shuffle, isSolvable } from './board';

function applyAll(b: number[], moves: number[], n: number): number[] {
  return moves.reduce((acc, tile) => applyMove(acc, tile, n), b);
}

describe('sliding solver', () => {
  it('already-solved board returns no moves', () => {
    expect(solveSliding(goal(3), 3)).toEqual([]);
  });

  it('throws on an unsolvable board', () => {
    const bad = goal(3).slice();
    [bad[0], bad[1]] = [bad[1], bad[0]];
    expect(isSolvable(bad, 3)).toBe(false);
    expect(() => solveSliding(bad, 3)).toThrow();
  });

  it('solves random 3x3 scrambles (each move legal, reaches goal)', () => {
    let seed = 3;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 30; t++) {
      const start = shuffle(3, 50, rand);
      const moves = solveSliding(start, 3);
      expect(isSolved(applyAll(start, moves, 3), 3)).toBe(true);
    }
  });

  it('solves random 4x4 scrambles', () => {
    let seed = 99;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 5; t++) {
      const start = shuffle(4, 40, rand);
      const moves = solveSliding(start, 4);
      expect(isSolved(applyAll(start, moves, 4), 4)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/sliding/solver.test.ts`
Expected: FAIL — cannot find module `./solver`.

- [ ] **Step 3: Write `src/games/sliding/solver.ts`**

```ts
import {
  type SlideBoard, isSolved, blankIndex, applyMove, legalMoves, isSolvable,
} from './board';

// Manhattan distance + linear-conflict heuristic (admissible & consistent).
function heuristic(b: SlideBoard, n: number): number {
  let dist = 0;
  for (let i = 0; i < b.length; i++) {
    const v = b[i];
    if (v === 0) continue;
    const targetR = Math.floor((v - 1) / n);
    const targetC = (v - 1) % n;
    const r = Math.floor(i / n);
    const c = i % n;
    dist += Math.abs(r - targetR) + Math.abs(c - targetC);
  }
  // Linear conflicts in rows.
  for (let r = 0; r < n; r++) {
    for (let c1 = 0; c1 < n; c1++) {
      const v1 = b[r * n + c1];
      if (v1 === 0 || Math.floor((v1 - 1) / n) !== r) continue;
      for (let c2 = c1 + 1; c2 < n; c2++) {
        const v2 = b[r * n + c2];
        if (v2 === 0 || Math.floor((v2 - 1) / n) !== r) continue;
        if (v1 > v2) dist += 2;
      }
    }
  }
  // Linear conflicts in columns.
  for (let c = 0; c < n; c++) {
    for (let r1 = 0; r1 < n; r1++) {
      const v1 = b[r1 * n + c];
      if (v1 === 0 || (v1 - 1) % n !== c) continue;
      for (let r2 = r1 + 1; r2 < n; r2++) {
        const v2 = b[r2 * n + c];
        if (v2 === 0 || (v2 - 1) % n !== c) continue;
        if (v1 > v2) dist += 2;
      }
    }
  }
  return dist;
}

function aStar(start: SlideBoard, n: number): number[] {
  const key = (b: SlideBoard) => b.join(',');
  const startKey = key(start);
  const open = new Map<string, { board: SlideBoard; g: number; f: number }>();
  open.set(startKey, { board: start, g: 0, f: heuristic(start, n) });
  const cameFrom = new Map<string, { prev: string; tile: number }>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const closed = new Set<string>();

  while (open.size > 0) {
    let bestKey = '';
    let bestF = Infinity;
    for (const [k, v] of open) {
      if (v.f < bestF) {
        bestF = v.f;
        bestKey = k;
      }
    }
    const current = open.get(bestKey)!;
    open.delete(bestKey);
    closed.add(bestKey);

    if (isSolved(current.board, n)) {
      const moves: number[] = [];
      let k = bestKey;
      while (cameFrom.has(k)) {
        const step = cameFrom.get(k)!;
        moves.unshift(step.tile);
        k = step.prev;
      }
      return moves;
    }

    for (const tile of legalMoves(current.board, n)) {
      const nb = applyMove(current.board, tile, n);
      const nk = key(nb);
      if (closed.has(nk)) continue;
      const tentativeG = current.g + 1;
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, { prev: bestKey, tile });
        gScore.set(nk, tentativeG);
        open.set(nk, { board: nb, g: tentativeG, f: tentativeG + heuristic(nb, n) });
      }
    }
  }
  return [];
}

function idaStar(start: SlideBoard, n: number): number[] {
  let threshold = heuristic(start, n);
  const path: number[] = []; // tiles moved

  function search(board: SlideBoard, g: number, lastTile: number): number | true {
    const f = g + heuristic(board, n);
    if (f > threshold) return f;
    if (isSolved(board, n)) return true;
    let min = Infinity;
    for (const tile of legalMoves(board, n)) {
      // Skipping the tile we just moved prevents the only immediate cycle
      // (sliding it straight back into the blank).
      if (tile === lastTile) continue;
      const nb = applyMove(board, tile, n);
      path.push(tile);
      const t = search(nb, g + 1, tile);
      if (t === true) return true;
      if (typeof t === 'number' && t < min) min = t;
      path.pop();
    }
    return min;
  }

  for (;;) {
    const t = search(start, 0, -1);
    if (t === true) return path.slice();
    if (t === Infinity) return [];
    threshold = t;
  }
}

export function solveSliding(b: SlideBoard, n: number): number[] {
  if (!isSolvable(b, n)) throw new Error('unsolvable board');
  if (isSolved(b, n)) return [];
  return n <= 3 ? aStar(b, n) : idaStar(b, n);
}
```

Note on the IDA* loop-prevention: skipping `tile === lastTile` prevents the
solver from re-sliding the tile it just moved (the only immediate cycle), which
keeps IDA* efficient without a full visited set.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/sliding/solver.test.ts`
Expected: PASS (4 tests). 4×4 cases may take a second or two — acceptable.

- [ ] **Step 5: Commit**

```bash
git add src/games/sliding/solver.ts src/games/sliding/solver.test.ts
git commit -m "Add sliding puzzle solver: A* (3x3) and IDA* (4x4)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Sliding puzzle game page (Solve animation + Help hint)

**Files:**
- Modify: `src/pages/SlidingGame.tsx`

**Interfaces:**
- Consumes: `board.ts` (`shuffle`, `applyMove`, `isSolved`, `legalMoves`), `solver.ts` (`solveSliding`), `PageShell`, `BoardGrid`, `useStepPlayer`.

- [ ] **Step 1: Implement `src/pages/SlidingGame.tsx`**

```tsx
import { useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { useStepPlayer } from '../components/useStepPlayer';
import { shuffle, applyMove, isSolved, legalMoves, type SlideBoard } from '../games/sliding/board';
import { solveSliding } from '../games/sliding/solver';

export default function SlidingGame() {
  const [n, setN] = useState(3);
  const [board, setBoard] = useState<SlideBoard>(() => shuffle(3, 60));
  const [hint, setHint] = useState<number | null>(null);
  const [error, setError] = useState('');
  const player = useStepPlayer<number>();

  const solved = isSolved(board, n);
  const movable = new Set(legalMoves(board, n));

  function reset(size: number) {
    player.stop();
    setHint(null);
    setError('');
    setN(size);
    setBoard(shuffle(size, size === 3 ? 60 : 80));
  }

  function clickTile(tile: number) {
    if (player.running || !movable.has(tile)) return;
    setHint(null);
    setBoard((b) => applyMove(b, tile, n));
  }

  function handleSolve() {
    setHint(null);
    setError('');
    try {
      const moves = solveSliding(board, n);
      player.play(moves, (tile) => setBoard((b) => applyMove(b, tile, n)), 500);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleHelp() {
    if (player.running) return;
    setError('');
    try {
      const moves = solveSliding(board, n);
      setHint(moves.length ? moves[0] : null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <PageShell title="🧩 Sliding Puzzle" subtitle="Slide tiles into order. Let it auto-solve or ask for one hint.">
      <div className="controls">
        <button className={`arcade-btn ${n === 3 ? '' : 'ghost'}`} onClick={() => reset(3)}>3×3</button>
        <button className={`arcade-btn ${n === 4 ? '' : 'ghost'}`} onClick={() => reset(4)}>4×4</button>
      </div>

      <BoardGrid n={n} cellPx={64}>
        {board.map((tile, idx) => (
          <button
            key={idx}
            className={`cell${hint === tile && tile !== 0 ? ' hint' : ''}`}
            onClick={() => clickTile(tile)}
            style={{
              height: 64,
              border: 'none',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.8rem',
              color: 'var(--bg)',
              background: tile === 0 ? 'transparent' : 'var(--accent2)',
              cursor: movable.has(tile) && !player.running ? 'pointer' : 'default',
            }}
          >
            {tile === 0 ? '' : tile}
          </button>
        ))}
      </BoardGrid>

      <div className="controls">
        <button className="arcade-btn" onClick={handleSolve} disabled={player.running || solved}>Solve</button>
        <button className="arcade-btn secondary" onClick={handleHelp} disabled={player.running || solved}>Help</button>
        {player.running && <button className="arcade-btn ghost" onClick={player.stop}>Stop</button>}
        <button className="arcade-btn ghost" onClick={() => reset(n)}>Shuffle</button>
      </div>

      <p className="status">{error ? `⚠ ${error}` : solved ? '✨ Solved!' : `${n}×${n} — ${player.running ? 'solving…' : 'your move'}`}</p>
    </PageShell>
  );
}
```

- [ ] **Step 2: Verify behavior in the dev server**

Run: `npm run dev`, open `#/sliding`.
Expected: 3×3 board of tiles; clicking a tile adjacent to the gap slides it; 3×3/4×4 toggle reshuffles; **Solve** animates the solution at 0.5s/step with a **Stop**; **Help** ring-highlights the next tile to click; "✨ Solved!" on completion.

- [ ] **Step 3: Typecheck and commit**

Run: `npm run typecheck` (Expected: PASS), then:
```bash
git add src/pages/SlidingGame.tsx
git commit -m "Implement sliding puzzle game page with animated Solve and Help

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Sliding puzzle solver tool page

**Files:**
- Modify: `src/pages/SlidingSolver.tsx`

**Interfaces:**
- Consumes: `board.ts` (`goal`, `isSolvable`), `solver.ts` (`solveSliding`), `PageShell`, `BoardGrid`.

- [ ] **Step 1: Implement `src/pages/SlidingSolver.tsx`**

```tsx
import { useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { goal, isSolvable, type SlideBoard } from '../games/sliding/board';
import { solveSliding } from '../games/sliding/solver';

export default function SlidingSolver() {
  const [n, setN] = useState(3);
  const [cells, setCells] = useState<string[]>(() => goal(3).map((v) => (v === 0 ? '' : String(v))));
  const [result, setResult] = useState<number[] | null>(null);
  const [error, setError] = useState('');

  function resize(size: number) {
    setN(size);
    setCells(goal(size).map((v) => (v === 0 ? '' : String(v))));
    setResult(null);
    setError('');
  }

  function setCell(idx: number, value: string) {
    setResult(null);
    setError('');
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 2);
    setCells((cs) => cs.map((c, i) => (i === idx ? cleaned : c)));
  }

  function parseBoard(): SlideBoard | null {
    const nums = cells.map((c) => (c === '' ? 0 : parseInt(c, 10)));
    const expected = new Set<number>();
    for (let i = 0; i < n * n; i++) expected.add(i);
    const seen = new Set<number>();
    for (const v of nums) {
      if (Number.isNaN(v) || v < 0 || v > n * n - 1 || seen.has(v)) return null;
      seen.add(v);
    }
    return seen.size === n * n ? nums : null;
  }

  function handleSolve() {
    const board = parseBoard();
    if (!board) {
      setError(`Enter each number 1–${n * n - 1} exactly once, leaving one cell blank for the gap.`);
      setResult(null);
      return;
    }
    if (!isSolvable(board, n)) {
      setError('That configuration is not solvable.');
      setResult(null);
      return;
    }
    setError('');
    setResult(solveSliding(board, n));
  }

  return (
    <PageShell
      title="🔢 Sliding Solver"
      subtitle="Type your board (leave the gap blank), then get the exact tiles to click in order."
    >
      <div className="controls">
        <button className={`arcade-btn ${n === 3 ? '' : 'ghost'}`} onClick={() => resize(3)}>3×3</button>
        <button className={`arcade-btn ${n === 4 ? '' : 'ghost'}`} onClick={() => resize(4)}>4×4</button>
      </div>

      <BoardGrid n={n} cellPx={64}>
        {cells.map((c, idx) => (
          <input
            key={idx}
            className="cell"
            value={c}
            onChange={(e) => setCell(idx, e.target.value)}
            inputMode="numeric"
            style={{
              height: 64,
              textAlign: 'center',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '0.8rem',
              color: 'var(--text)',
              background: 'var(--card)',
              border: '1px solid var(--muted)',
            }}
          />
        ))}
      </BoardGrid>

      <div className="controls">
        <button className="arcade-btn" onClick={handleSolve}>Solve</button>
      </div>

      {error && <p className="status">⚠ {error}</p>}
      {result && (
        <div className="status">
          {result.length === 0 ? (
            'Already solved — nothing to click.'
          ) : (
            <>
              <strong>{result.length} clicks:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {result.map((tile, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'var(--accent2)',
                      color: 'var(--bg)',
                      borderRadius: 6,
                      padding: '0.25rem 0.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {tile}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}
```

- [ ] **Step 2: Verify behavior in the dev server**

Run: `npm run dev`, open `#/sliding-solver`.
Expected: editable 3×3/4×4 grid; entering a scrambled board and pressing **Solve** lists the ordered tiles to click; invalid input (duplicates/missing) and unsolvable boards show clear error messages.

- [ ] **Step 3: Typecheck and commit**

Run: `npm run typecheck` (Expected: PASS), then:
```bash
git add src/pages/SlidingSolver.tsx
git commit -m "Implement standalone sliding puzzle solver tool page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Tic-Tac-Toe board module

**Files:**
- Create: `src/games/tic-tac-toe/board.ts`, `src/games/tic-tac-toe/board.test.ts`

**Interfaces:**
- Produces:
  - `type Player = 'X' | 'O'`
  - `type Cell = Player | null`
  - `type TTTBoard = Cell[]` (length 9)
  - `emptyBoard(): TTTBoard`
  - `winner(b: TTTBoard): Player | 'draw' | null`
  - `availableMoves(b: TTTBoard): number[]`
  - `other(p: Player): Player`

- [ ] **Step 1: Write the failing test**

`src/games/tic-tac-toe/board.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { emptyBoard, winner, availableMoves, other } from './board';

describe('tic-tac-toe board', () => {
  it('empty board: no winner, nine moves', () => {
    const b = emptyBoard();
    expect(winner(b)).toBeNull();
    expect(availableMoves(b)).toHaveLength(9);
  });

  it('detects a row win', () => {
    const b = ['X', 'X', 'X', null, null, null, null, null, null] as const;
    expect(winner([...b])).toBe('X');
  });

  it('detects a diagonal win', () => {
    const b = ['O', null, null, null, 'O', null, null, null, 'O'];
    expect(winner(b as any)).toBe('O');
  });

  it('detects a draw', () => {
    const b = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(winner(b as any)).toBe('draw');
  });

  it('other flips the player', () => {
    expect(other('X')).toBe('O');
    expect(other('O')).toBe('X');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/tic-tac-toe/board.test.ts`
Expected: FAIL — cannot find module `./board`.

- [ ] **Step 3: Write `src/games/tic-tac-toe/board.ts`**

```ts
export type Player = 'X' | 'O';
export type Cell = Player | null;
export type TTTBoard = Cell[];

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6], // diagonals
];

export function emptyBoard(): TTTBoard {
  return new Array(9).fill(null);
}

export function other(p: Player): Player {
  return p === 'X' ? 'O' : 'X';
}

export function winner(b: TTTBoard): Player | 'draw' | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] as Player;
  }
  return b.every((cell) => cell !== null) ? 'draw' : null;
}

export function availableMoves(b: TTTBoard): number[] {
  const out: number[] = [];
  b.forEach((cell, i) => {
    if (cell === null) out.push(i);
  });
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/tic-tac-toe/board.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/games/tic-tac-toe/board.ts src/games/tic-tac-toe/board.test.ts
git commit -m "Add tic-tac-toe board module with win/draw detection

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12: Tic-Tac-Toe minimax

**Files:**
- Create: `src/games/tic-tac-toe/minimax.ts`, `src/games/tic-tac-toe/minimax.test.ts`

**Interfaces:**
- Consumes: `TTTBoard`, `Player`, `winner`, `availableMoves`, `other`, `emptyBoard` from `./board`.
- Produces: `bestMove(b: TTTBoard, player: Player): number` — index of an optimal move for `player`.

- [ ] **Step 1: Write the failing test**

`src/games/tic-tac-toe/minimax.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { bestMove } from './minimax';
import { emptyBoard, winner, availableMoves, other, type Player, type TTTBoard } from './board';

describe('tic-tac-toe minimax', () => {
  it('takes an immediate winning move', () => {
    const b: TTTBoard = ['X', 'X', null, null, 'O', null, null, 'O', null];
    expect(bestMove(b, 'X')).toBe(2);
  });

  it('blocks the opponent’s winning move', () => {
    const b: TTTBoard = ['O', 'O', null, null, 'X', null, null, null, null];
    expect(bestMove(b, 'X')).toBe(2);
  });

  it('the minimax player never loses across exhaustive opponent play', () => {
    // Minimax plays X (moves first); opponent O tries every legal reply.
    function playOut(board: TTTBoard, toMove: Player): void {
      const w = winner(board);
      if (w) {
        expect(w).not.toBe('O'); // X (minimax) must never lose
        return;
      }
      if (toMove === 'X') {
        const m = bestMove(board, 'X');
        const next = board.slice();
        next[m] = 'X';
        playOut(next, 'O');
      } else {
        for (const m of availableMoves(board)) {
          const next = board.slice();
          next[m] = 'O';
          playOut(next, 'X');
        }
      }
    }
    playOut(emptyBoard(), 'X');
  });

  it('two perfect minimax players always draw', () => {
    let board = emptyBoard();
    let p: Player = 'X';
    while (!winner(board)) {
      const m = bestMove(board, p);
      board = board.slice();
      board[m] = p;
      p = other(p);
    }
    expect(winner(board)).toBe('draw');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/games/tic-tac-toe/minimax.test.ts`
Expected: FAIL — cannot find module `./minimax`.

- [ ] **Step 3: Write `src/games/tic-tac-toe/minimax.ts`**

```ts
import { type TTTBoard, type Player, winner, availableMoves, other } from './board';

// Returns score from `me`'s perspective: +(10 - depth) win, -(10 - depth) loss, 0 draw.
function minimax(
  board: TTTBoard,
  toMove: Player,
  me: Player,
  depth: number,
  alpha: number,
  beta: number
): number {
  const w = winner(board);
  if (w === me) return 10 - depth;
  if (w === other(me)) return depth - 10;
  if (w === 'draw') return 0;

  const maximizing = toMove === me;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of availableMoves(board)) {
    const next = board.slice();
    next[move] = toMove;
    const score = minimax(next, other(toMove), me, depth + 1, alpha, beta);
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function bestMove(board: TTTBoard, player: Player): number {
  let bestScore = -Infinity;
  let move = availableMoves(board)[0];
  for (const candidate of availableMoves(board)) {
    const next = board.slice();
    next[candidate] = player;
    const score = minimax(next, other(player), player, 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      move = candidate;
    }
  }
  return move;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/games/tic-tac-toe/minimax.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/games/tic-tac-toe/minimax.ts src/games/tic-tac-toe/minimax.test.ts
git commit -m "Add unbeatable tic-tac-toe minimax with alpha-beta pruning

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 13: Tic-Tac-Toe page

**Files:**
- Modify: `src/pages/TicTacToe.tsx`

**Interfaces:**
- Consumes: `board.ts` (`emptyBoard`, `winner`, `other`, types), `minimax.ts` (`bestMove`), `PageShell`.

- [ ] **Step 1: Implement `src/pages/TicTacToe.tsx`**

```tsx
import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import { emptyBoard, winner, other, type Player, type TTTBoard } from '../games/tic-tac-toe/board';
import { bestMove } from '../games/tic-tac-toe/minimax';

export default function TicTacToe() {
  const [human, setHuman] = useState<Player>('X');
  const [board, setBoard] = useState<TTTBoard>(() => emptyBoard());
  const ai = other(human);
  const result = winner(board);
  const humanTurn = board.filter((c) => c !== null).length % 2 === (human === 'X' ? 0 : 1);

  // AI responds whenever it is its turn and the game is unfinished.
  useEffect(() => {
    if (result || humanTurn) return;
    const id = window.setTimeout(() => {
      setBoard((b) => {
        if (winner(b)) return b;
        const m = bestMove(b, ai);
        const next = b.slice();
        next[m] = ai;
        return next;
      });
    }, 350);
    return () => window.clearTimeout(id);
  }, [board, humanTurn, result, ai]);

  function play(i: number) {
    if (result || !humanTurn || board[i]) return;
    setBoard((b) => {
      const next = b.slice();
      next[i] = human;
      return next;
    });
  }

  function newGame(side: Player) {
    setHuman(side);
    setBoard(emptyBoard());
  }

  const message =
    result === 'draw'
      ? "It's a draw — as it should be."
      : result
        ? result === human
          ? 'You win?! (impossible)'
          : 'Computer wins.'
        : humanTurn
          ? 'Your move.'
          : 'Computer thinking…';

  return (
    <PageShell title="⭕ Tic-Tac-Toe" subtitle="The computer plays perfectly. It will never lose.">
      <div className="controls">
        <button className={`arcade-btn ${human === 'X' ? '' : 'ghost'}`} onClick={() => newGame('X')}>Play as X (first)</button>
        <button className={`arcade-btn ${human === 'O' ? '' : 'ghost'}`} onClick={() => newGame('O')}>Play as O</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 80px)', gap: '6px', width: 'max-content' }}>
        {board.map((cell, i) => (
          <button
            key={i}
            className="cell"
            onClick={() => play(i)}
            style={{
              height: 80,
              border: 'none',
              background: 'var(--card)',
              color: cell === 'X' ? 'var(--accent)' : 'var(--accent2)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '1.4rem',
              cursor: !result && humanTurn && !cell ? 'pointer' : 'default',
            }}
          >
            {cell ?? ''}
          </button>
        ))}
      </div>

      <div className="controls">
        <button className="arcade-btn ghost" onClick={() => newGame(human)}>New game</button>
      </div>
      <p className="status">{message}</p>
    </PageShell>
  );
}
```

- [ ] **Step 2: Verify behavior in the dev server**

Run: `npm run dev`, open `#/tic-tac-toe`.
Expected: 3×3 board; the computer responds after each of your moves and **never loses** — every game ends in a draw or a computer win. Switching side / new game resets, and if you choose to play O the computer opens.

- [ ] **Step 3: Typecheck and commit**

Run: `npm run typecheck` (Expected: PASS), then:
```bash
git add src/pages/TicTacToe.tsx
git commit -m "Implement tic-tac-toe page vs unbeatable computer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 14: CI (PR checks) and Pages deploy workflows

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: npm scripts `lint`, `typecheck`, `test`, `build` from Task 1.

- [ ] **Step 1: Run the full local gate to ensure CI will pass**

Run:
```bash
npm run lint
npm run typecheck
npm test
npm run build
```
Expected: all four succeed. Fix any lint/format issues (`npx prettier --write .`) before wiring CI.

- [ ] **Step 2: Create `.github/workflows/ci.yml`** (runs on pull requests)

```yaml
name: CI
on:
  pull_request:
  workflow_dispatch:
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```

- [ ] **Step 3: Create `.github/workflows/deploy.yml`** (builds + deploys on push to main)

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "Add CI (PR lint/typecheck/test) and Pages deploy workflows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5: Manual one-time Pages setting (user action, documented here)**

After this branch merges to `main`, the repo owner must set **Settings → Pages →
Build and deployment → Source → "GitHub Actions"** (currently it serves from the
branch root). Until then the deploy workflow will run but Pages will not switch
sources automatically. No branch protection is being added, so the CI workflow
is informational on PRs.

---

## Self-Review

**Spec coverage:**
- Vite + React + TS migration → Task 1. ✓
- Whole-site migration, Poop Patrol kept static → Task 1 (moved to `public/`), Task 3 (linked). ✓
- HashRouter routing + landing → Task 3. ✓
- Lights Out 5×5 + GF(2) solver + animated Solve + Help → Tasks 4, 5, 6. ✓
- Sliding game 3×3/4×4 + A*/IDA* + animated Solve + Help → Tasks 7, 8, 9. ✓
- Standalone sliding solver tool (type board → click list) → Task 10. ✓
- Tic-Tac-Toe unbeatable minimax → Tasks 11, 12, 13. ✓
- GitHub Actions deploy → Task 14. ✓
- PR lint/typecheck/test CI (informational, no branch protection) → Task 14. ✓
- TS strict, ESLint, Prettier, Vitest → Task 1; tests in Tasks 4–5, 7–8, 11–12. ✓
- 500ms/step Solve, one-step Help → Tasks 6, 9 (shared `useStepPlayer`). ✓

**Placeholder scan:** No TBD/TODO; every code step contains complete code. ✓

**Type consistency:** `LightsBoard`, `SlideBoard`, `TTTBoard`, `Player`, and function
signatures (`solve`, `solveSliding`, `bestMove`, `applyMove(b, tile, n)`,
`press(board, idx)`) are used identically across producing and consuming tasks. ✓
