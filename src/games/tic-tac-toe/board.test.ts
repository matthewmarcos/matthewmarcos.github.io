import { describe, it, expect } from 'vitest';
import { emptyBoard, winner, availableMoves, other, type TTTBoard } from './board';

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

  it('detects a column win', () => {
    const b: TTTBoard = ['X', null, null, 'X', null, null, 'X', null, null];
    expect(winner(b)).toBe('X');
  });

  it('detects a diagonal win', () => {
    const b: TTTBoard = ['O', null, null, null, 'O', null, null, null, 'O'];
    expect(winner(b)).toBe('O');
  });

  it('detects a draw', () => {
    const b: TTTBoard = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(winner(b)).toBe('draw');
  });

  it('other flips the player', () => {
    expect(other('X')).toBe('O');
    expect(other('O')).toBe('X');
  });
});
