import { describe, it, expect } from 'vitest';
import { goal, isSolved, legalMoves, applyMove, isSolvable, shuffle, blankIndex } from './board';

describe('sliding board', () => {
  it('goal board is solved', () => {
    expect(goal(3)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);
    expect(isSolved(goal(3), 3)).toBe(true);
    expect(isSolved(goal(4), 4)).toBe(true);
  });

  it('legalMoves returns tiles adjacent to the blank', () => {
    // goal(3): blank at index 8 (bottom-right); neighbors are tiles 6 (idx7) and 8(value at idx5=6)...
    const b = goal(3); // [1,2,3,4,5,6,7,8,0], blank idx 8
    expect(blankIndex(b)).toBe(8);
    expect(legalMoves(b, 3).sort((a, c) => a - c)).toEqual([6, 8]); // tiles at idx5(=6) and idx7(=8)
  });

  it('applyMove slides the chosen tile into the blank', () => {
    const b = goal(3);
    const after = applyMove(b, 8, 3); // tile 8 (idx7) slides to idx8
    expect(after[8]).toBe(8);
    expect(after[7]).toBe(0);
  });

  it('applyMove is pure', () => {
    const b = goal(3);
    applyMove(b, 8, 3);
    expect(b).toEqual(goal(3));
  });

  it('goal is solvable; a single swap of two tiles is not (3x3)', () => {
    expect(isSolvable(goal(3), 3)).toBe(true);
    const bad = goal(3).slice();
    [bad[0], bad[1]] = [bad[1], bad[0]]; // one inversion → unsolvable for odd width
    expect(isSolvable(bad, 3)).toBe(false);
  });

  it('shuffle always yields a solvable board', () => {
    let seed = 7;
    const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let t = 0; t < 20; t++) {
      expect(isSolvable(shuffle(3, 40, rand), 3)).toBe(true);
      expect(isSolvable(shuffle(4, 60, rand), 4)).toBe(true);
    }
  });
});
