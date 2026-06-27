import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { useStepPlayer } from '../components/useStepPlayer';
import { usePersistentState } from '../components/usePersistentState';
import { SIZE, press, isSolved, randomBoard, type LightsBoard } from '../games/lights-out/board';
import { solve } from '../games/lights-out/solver';

export default function LightsOut() {
  const [board, setBoard] = usePersistentState<LightsBoard>('lightsout.board', () =>
    randomBoard(8),
  );
  const [hint, setHint] = useState<number | null>(null);
  const [clicks, setClicks] = usePersistentState('lightsout.clicks', 0);
  const player = useStepPlayer<number>();

  const solved = isSolved(board);
  const remaining = useMemo(() => solve(board), [board]);

  // Clear the red highlight once the board is fully cleared.
  useEffect(() => {
    if (solved) setHint(null);
  }, [solved]);

  function handlePress(idx: number) {
    if (player.running) return;
    setHint(null);
    setClicks((c) => c + 1);
    setBoard((b) => press(b, idx));
  }

  function handleNew() {
    player.stop();
    setHint(null);
    setClicks(0);
    setBoard(randomBoard(8));
  }

  function handleSolve() {
    const sol = solve(board);
    if (!sol || sol.length === 0) return;
    // Highlight each cell in red the instant the auto-solver clicks it.
    player.play(
      sol,
      (idx) => {
        setHint(idx);
        setBoard((b) => press(b, idx));
      },
      500,
    );
  }

  function handleStop() {
    player.stop();
    setHint(null);
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="pixel" style={{ fontSize: '2.4rem', color: 'var(--accent2)' }}>
            {clicks}
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--muted)' }}>
            CLICKS
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="pixel" style={{ fontSize: '2.4rem', color: 'var(--accent3)' }}>
            {solved ? 0 : (remaining?.length ?? '—')}
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--muted)' }}>
            TO SOLVE
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BoardGrid n={SIZE} cellPx={56}>
          {board.map((lit, idx) => {
            const isHint = hint === idx;
            return (
              <button
                key={idx}
                className={`cell${isHint ? ' hint' : ''}`}
                onClick={() => handlePress(idx)}
                style={{
                  height: 56,
                  border: 'none',
                  background: isHint ? 'var(--hint)' : lit ? 'var(--accent3)' : 'var(--card)',
                  boxShadow: isHint
                    ? '0 0 18px var(--hint)'
                    : lit
                      ? '0 0 14px var(--accent3)'
                      : undefined,
                }}
                aria-label={`cell ${idx} ${lit ? 'on' : 'off'}${isHint ? ' (click next)' : ''}`}
              />
            );
          })}
        </BoardGrid>
      </div>

      <div className="controls" style={{ justifyContent: 'center' }}>
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
          <button className="arcade-btn ghost" onClick={handleStop}>
            Stop
          </button>
        )}
        <button className="arcade-btn ghost" onClick={handleNew}>
          New board
        </button>
      </div>

      {solved && (
        <p className="status" style={{ textAlign: 'center' }}>
          ✨ Solved!
        </p>
      )}
    </PageShell>
  );
}
