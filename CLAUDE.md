# CLAUDE.md

Arcade site deployed to GitHub Pages. See [README.md](README.md) for the tour.

## Layout

- `src/games/<game>/` — pure TS game logic and solvers. **No React imports here.** This
  is the only code with tests (`*.test.ts`, run under vitest in a `node` environment).
- `src/pages/` — one React component per route; wiring and rendering only.
- `src/components/` — shared UI + hooks (`PageShell`, `BoardGrid`, `usePersistentState`,
  `useStepPlayer`, `useOptimalMoves`).
- `public/<game>/` — self-contained vanilla-JS games, copied verbatim to the build. They
  are not typechecked or linted with the rest of the app; keep them dependency-free.

New logic goes in `src/games/` with a test. If a page component grows an algorithm,
that's a sign it belongs in `src/games/`.

## Commands

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck` · `npm run build`

A pre-commit hook (`.githooks/pre-commit`, installed by `npm install`) runs lint +
typecheck. Same checks as CI, so a clean commit is a green PR.

## Conventions

- Routing is `HashRouter` — Pages has no server-side rewrites. Don't switch to
  `BrowserRouter`.
- Links to `public/` games must include `index.html`; the dev server's SPA fallback
  swallows bare directory requests.
- Prettier owns formatting (`npm run format`); don't hand-format.
- Solvers run on the main thread except sliding, which uses
  `src/games/sliding/solver.worker.ts`. Keep long searches off the main thread.
