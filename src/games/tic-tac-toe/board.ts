export type Player = 'X' | 'O';
export type Cell = Player | null;
export type TTTBoard = Cell[];

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // cols
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

export function emptyBoard(): TTTBoard {
  return new Array(9).fill(null);
}

export function other(p: Player): Player {
  return p === 'X' ? 'O' : 'X';
}

export function winner(b: TTTBoard): Player | 'draw' | null {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] as Player;
  }
  return b.every((cell) => cell !== null) ? 'draw' : null;
}

export function availableMoves(b: TTTBoard): number[] {
  const out: number[] = [];
  b.forEach((cell, i) => {
    if (cell === null) out.push(i);
  });
  return out;
}
