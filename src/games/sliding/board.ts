export type SlideBoard = number[];

export function goal(n: number): SlideBoard {
  const b: SlideBoard = [];
  for (let i = 1; i < n * n; i++) b.push(i);
  b.push(0);
  return b;
}

export function isSolved(b: SlideBoard, n: number): boolean {
  const g = goal(n);
  return b.every((v, i) => v === g[i]);
}

export function blankIndex(b: SlideBoard): number {
  return b.indexOf(0);
}

export function legalMoves(b: SlideBoard, n: number): number[] {
  const blank = blankIndex(b);
  const r = Math.floor(blank / n);
  const c = blank % n;
  const idxs: number[] = [];
  if (r > 0) idxs.push(blank - n);
  if (r < n - 1) idxs.push(blank + n);
  if (c > 0) idxs.push(blank - 1);
  if (c < n - 1) idxs.push(blank + 1);
  return idxs.map((i) => b[i]); // tile values
}

export function applyMove(b: SlideBoard, tile: number, n: number): SlideBoard {
  const next = b.slice();
  const blank = blankIndex(next);
  const tileIdx = next.indexOf(tile);
  // Only legal if tile is orthogonally adjacent to the blank.
  const adjacent =
    (Math.floor(blank / n) === Math.floor(tileIdx / n) && Math.abs(blank - tileIdx) === 1) ||
    Math.abs(blank - tileIdx) === n;
  if (!adjacent) return b;
  [next[blank], next[tileIdx]] = [next[tileIdx], next[blank]];
  return next;
}

export function inversions(b: SlideBoard): number {
  const seq = b.filter((v) => v !== 0);
  let inv = 0;
  for (let i = 0; i < seq.length; i++) {
    for (let j = i + 1; j < seq.length; j++) {
      if (seq[i] > seq[j]) inv++;
    }
  }
  return inv;
}

export function isSolvable(b: SlideBoard, n: number): boolean {
  const inv = inversions(b);
  if (n % 2 === 1) {
    return inv % 2 === 0;
  }
  // Even width: solvable iff (inversions + rowOfBlankFromBottom) is odd.
  const blankRowFromTop = Math.floor(blankIndex(b) / n);
  const blankRowFromBottom = n - blankRowFromTop;
  return (inv + blankRowFromBottom) % 2 === 1;
}

export function shuffle(n: number, steps: number, rand: () => number = Math.random): SlideBoard {
  // Random walk from the goal guarantees solvability.
  let b = goal(n);
  let prevBlank = -1;
  for (let i = 0; i < steps; i++) {
    const moves = legalMoves(b, n).filter((tile) => b.indexOf(tile) !== prevBlank);
    const tile = moves[Math.floor(rand() * moves.length)];
    prevBlank = blankIndex(b);
    b = applyMove(b, tile, n);
  }
  return b;
}
