export type LightsBoard = boolean[];
export const SIZE = 5;

export function emptyBoard(): LightsBoard {
  return new Array(SIZE * SIZE).fill(false);
}

function neighbors(idx: number): number[] {
  const r = Math.floor(idx / SIZE);
  const c = idx % SIZE;
  const out = [idx];
  if (r > 0) out.push(idx - SIZE);
  if (r < SIZE - 1) out.push(idx + SIZE);
  if (c > 0) out.push(idx - 1);
  if (c < SIZE - 1) out.push(idx + 1);
  return out;
}

export function press(board: LightsBoard, idx: number): LightsBoard {
  const next = board.slice();
  for (const n of neighbors(idx)) next[n] = !next[n];
  return next;
}

export function pressMany(board: LightsBoard, idxs: number[]): LightsBoard {
  return idxs.reduce((acc, i) => press(acc, i), board);
}

export function isSolved(board: LightsBoard): boolean {
  return board.every((c) => c === false);
}

export function randomBoard(presses: number, rand: () => number = Math.random): LightsBoard {
  let b = emptyBoard();
  for (let i = 0; i < presses; i++) {
    b = press(b, Math.floor(rand() * SIZE * SIZE));
  }
  return b;
}
