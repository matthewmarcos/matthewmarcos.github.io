import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { useStepPlayer } from '../components/useStepPlayer';
import { SIZE, press, isSolved, randomBoard, type LightsBoard } from '../games/lights-out/board';
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
    <PageShell
      title="💡 Lights Out"
      subtitle="Turn every light off. Pressing a cell flips it and its neighbors."
    >
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
        <button className="arcade-btn" onClick={handleSolve} disabled={player.running || solved}>
          Solve
        </button>
        <button
          className="arcade-btn secondary"
          onClick={handleHelp}
          disabled={player.running || solved}
        >
          Help
        </button>
        {player.running && (
          <button className="arcade-btn ghost" onClick={player.stop}>
            Stop
          </button>
        )}
        <button className="arcade-btn ghost" onClick={handleNew}>
          New board
        </button>
      </div>

      <p className="status">
        {solved ? '✨ Solved!' : `${remaining ? remaining.length : '—'} clicks to solve.`}
      </p>
    </PageShell>
  );
}
