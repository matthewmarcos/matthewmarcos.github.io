import { useState } from 'react';
import PageShell from '../components/PageShell';
import BoardGrid from '../components/BoardGrid';
import { goal, isSolvable, type SlideBoard } from '../games/sliding/board';
import { solveSliding } from '../games/sliding/solver';

export default function SlidingSolver() {
  const [n, setN] = useState(3);
  const [cells, setCells] = useState<string[]>(() =>
    goal(3).map((v) => (v === 0 ? '' : String(v))),
  );
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
      setError(
        `Enter each number 1–${n * n - 1} exactly once, leaving one cell blank for the gap.`,
      );
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
      centered
    >
      <div className="controls">
        <button className={`arcade-btn ${n === 3 ? '' : 'ghost'}`} onClick={() => resize(3)}>
          3×3
        </button>
        <button className={`arcade-btn ${n === 4 ? '' : 'ghost'}`} onClick={() => resize(4)}>
          4×4
        </button>
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
        <button className="arcade-btn" onClick={handleSolve}>
          Solve
        </button>
      </div>

      {error && <p className="status">⚠ {error}</p>}
      {result && (
        <div className="status">
          {result.length === 0 ? (
            'Already solved — nothing to click.'
          ) : (
            <>
              <strong>{result.length} clicks:</strong>
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}
              >
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
