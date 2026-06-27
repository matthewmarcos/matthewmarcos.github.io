import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import { emptyBoard, press, pressMany, isSolved, randomBoard } from './board';

describe('lights-out solver', () => {
  it('empty board solves with no presses', () => {
    expect(solve(emptyBoard())).toEqual([]);
  });

  it('a single-press board is solved by pressing that same cell', () => {
    const b = press(emptyBoard(), 7);
    const sol = solve(b)!;
    expect(isSolved(pressMany(b, sol))).toBe(true);
  });

  it('solution actually turns off every randomly generated board', () => {
    let seed = 42;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 50; t++) {
      const b = randomBoard(15, rand);
      const sol = solve(b);
      expect(sol).not.toBeNull();
      expect(isSolved(pressMany(b, sol!))).toBe(true);
    }
  });

  it('returns the minimum-click solution', () => {
    // Board produced by pressing cell 12 once: minimal solution is exactly [12].
    const b = press(emptyBoard(), 12);
    expect(solve(b)).toEqual([12]);
  });
});
