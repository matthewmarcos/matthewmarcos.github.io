import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { useStepPlayer } from '../components/useStepPlayer';
import { usePersistentState } from '../components/usePersistentState';
import { useOptimalMoves } from '../components/useOptimalMoves';
import { shuffle, applyMove, isSolved, legalMoves, type SlideBoard } from '../games/sliding/board';
import { solveSliding } from '../games/sliding/solver';

export default function SlidingGame() {
  const [n, setN] = usePersistentState('sliding.n', 3);
  const [board, setBoard] = usePersistentState<SlideBoard>('sliding.board', () => shuffle(3, 60));
  const [moves, setMoves] = usePersistentState('sliding.moves', 0);
  const [hint, setHint] = useState<number | null>(null);
  const [error, setError] = useState('');
  const player = useStepPlayer<number>();
  const { movesLeft } = useOptimalMoves(board, n);

  const solved = isSolved(board, n);
  const movable = new Set(legalMoves(board, n));

  // Clear the red highlight once the puzzle is solved.
  useEffect(() => {
    if (solved) setHint(null);
  }, [solved]);

  function reset(size: number) {
    player.stop();
    setHint(null);
    setError('');
    setN(size);
    setMoves(0);
    setBoard(shuffle(size, size === 3 ? 60 : 80));
  }

  function clickTile(tile: number) {
    if (player.running || !movable.has(tile)) return;
    setHint(null);
    setMoves((m) => m + 1);
    setBoard((b) => applyMove(b, tile, n));
  }

  function handleSolve() {
    setHint(null);
    setError('');
    try {
      const moves = solveSliding(board, n);
      // Highlight the next tile to slide one tick ahead of the move.
      player.play(moves, (tile) => setBoard((b) => applyMove(b, tile, n)), {
        intervalMs: 500,
        preview: (tile) => setHint(tile),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleStop() {
    player.stop();
    setHint(null);
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
    <PageShell
      title="🧩 Sliding Puzzle"
      subtitle="Slide tiles into order. Let it auto-solve or ask for one hint."
      centered
    >
      <div className="controls">
        <button className={`arcade-btn ${n === 3 ? '' : 'ghost'}`} onClick={() => reset(3)}>
          3×3
        </button>
        <button className={`arcade-btn ${n === 4 ? '' : 'ghost'}`} onClick={() => reset(4)}>
          4×4
        </button>
      </div>

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
            {moves}
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--muted)' }}>
            MOVES
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="pixel" style={{ fontSize: '2.4rem', color: 'var(--accent3)' }}>
            {solved ? 0 : (movesLeft ?? '…')}
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '1px', color: 'var(--muted)' }}>
            TO SOLVE
          </div>
        </div>
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
              background:
                tile === 0 ? 'transparent' : hint === tile ? 'var(--hint)' : 'var(--accent2)',
              cursor: movable.has(tile) && !player.running ? 'pointer' : 'default',
            }}
          >
            {tile === 0 ? '' : tile}
          </button>
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
          <button className="arcade-btn ghost" onClick={handleStop}>
            Stop
          </button>
        )}
        <button className="arcade-btn ghost" onClick={() => reset(n)}>
          Shuffle
        </button>
      </div>

      <p className="status">
        {error ? `⚠ ${error}` : solved ? '✨ Solved!' : player.running ? 'Auto-solving…' : ''}
      </p>
    </PageShell>
  );
}
