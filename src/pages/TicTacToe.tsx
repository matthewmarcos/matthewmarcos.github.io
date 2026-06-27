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
