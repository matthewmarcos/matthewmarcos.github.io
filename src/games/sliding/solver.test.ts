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
