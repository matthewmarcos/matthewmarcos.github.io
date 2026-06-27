import { describe, it, expect } from 'vitest';
import { bestMove } from './minimax';
import { emptyBoard, winner, availableMoves, other, type Player, type TTTBoard } from './board';

describe('tic-tac-toe minimax', () => {
  it('takes an immediate winning move', () => {
    const b: TTTBoard = ['X', 'X', null, null, 'O', null, null, 'O', null];
    expect(bestMove(b, 'X')).toBe(2);
  });

  it("blocks the opponent's winning move", () => {
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
