# Matthew's Arcade

Small browser games and puzzle solvers, deployed to GitHub Pages at
[matthewmarcos.github.io](https://matthewmarcos.github.io).

## What's in here

**React + TypeScript pages** (routed by `HashRouter` in [src/App.tsx](src/App.tsx)):

| Route             | What it is                                           |
| ----------------- | ---------------------------------------------------- |
| `/lights-out`     | Lights Out, with a GF(2) solver for hints/auto-solve |
| `/sliding`        | 8/15-puzzle, with an A\* auto-solver                 |
| `/sliding-solver` | Standalone solver: paste a board, get the moves      |
| `/tic-tac-toe`    | Unbeatable minimax opponent                          |

**Standalone vanilla-JS games** served straight out of [public/](public/):

- `/poop-patrol/index.html` — splat-em-up, inspired by Damn Birds
- `/bro-squad/index.html` — twin-stick roguelite, inspired by Gun Bros

Game logic lives in [src/games/](src/games/) as plain TypeScript modules with no React
imports, so it's unit-testable on its own — that's where the tests are.

## Development

```sh
npm install      # also points git at .githooks (pre-commit lint + typecheck)
npm run dev      # vite dev server
npm test         # vitest
npm run lint     # eslint + prettier --check
npm run format   # prettier --write
npm run build    # tsc -b && vite build
```

Note: in dev, link to the vanilla games by full file path (`/bro-squad/index.html`),
not the bare directory — Vite's SPA fallback otherwise serves the app shell.

## CI/CD

- [ci.yml](.github/workflows/ci.yml) — lint, typecheck, test on every PR.
- [deploy.yml](.github/workflows/deploy.yml) — builds and publishes to GitHub Pages on
  push to `main`.
