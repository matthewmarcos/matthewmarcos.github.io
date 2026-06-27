import { describe, it, expect } from 'vitest';
import { emptyBoard, press, pressMany, isSolved, randomBoard, SIZE } from './board';

describe('lights-out board', () => {
  it('empty board is all off and solved', () => {
    const b = emptyBoard();
    expect(b).toHaveLength(SIZE * SIZE);
    expect(b.every((c) => c === false)).toBe(true);
    expect(isSolved(b)).toBe(true);
  });

  it('pressing center toggles a plus shape', () => {
    const b = press(emptyBoard(), 12); // center of 5x5
    const lit = b.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    expect(lit.sort((a, x) => a - x)).toEqual([7, 11, 12, 13, 17]);
  });

  it('pressing a corner toggles only itself and two neighbors', () => {
    const b = press(emptyBoard(), 0); // top-left
    const lit = b.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    expect(lit.sort((a, x) => a - x)).toEqual([0, 1, 5]);
  });

  it('pressing the same cell twice is a no-op', () => {
    const b = pressMany(emptyBoard(), [12, 12]);
    expect(isSolved(b)).toBe(true);
  });

  it('randomBoard with a fixed rng is reproducible and solvable-by-construction', () => {
    let seed = 1;
    const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    const b = randomBoard(10, rand);
    expect(b).toHaveLength(25);
  });

  it('press is pure (does not mutate input)', () => {
    const b = emptyBoard();
    press(b, 12);
    expect(isSolved(b)).toBe(true);
  });
});
