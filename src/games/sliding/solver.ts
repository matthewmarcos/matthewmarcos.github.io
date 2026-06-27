import {
  type SlideBoard, isSolved, applyMove, legalMoves, isSolvable,
} from './board';

// Manhattan distance + linear-conflict heuristic (admissible & consistent).
function heuristic(b: SlideBoard, n: number): number {
  let dist = 0;
  for (let i = 0; i < b.length; i++) {
    const v = b[i];
    if (v === 0) continue;
    const targetR = Math.floor((v - 1) / n);
    const targetC = (v - 1) % n;
    const r = Math.floor(i / n);
    const c = i % n;
    dist += Math.abs(r - targetR) + Math.abs(c - targetC);
  }
  // Linear conflicts in rows.
  for (let r = 0; r < n; r++) {
    for (let c1 = 0; c1 < n; c1++) {
      const v1 = b[r * n + c1];
      if (v1 === 0 || Math.floor((v1 - 1) / n) !== r) continue;
      for (let c2 = c1 + 1; c2 < n; c2++) {
        const v2 = b[r * n + c2];
        if (v2 === 0 || Math.floor((v2 - 1) / n) !== r) continue;
        if (v1 > v2) dist += 2;
      }
    }
  }
  // Linear conflicts in columns.
  for (let c = 0; c < n; c++) {
    for (let r1 = 0; r1 < n; r1++) {
      const v1 = b[r1 * n + c];
      if (v1 === 0 || (v1 - 1) % n !== c) continue;
      for (let r2 = r1 + 1; r2 < n; r2++) {
        const v2 = b[r2 * n + c];
        if (v2 === 0 || (v2 - 1) % n !== c) continue;
        if (v1 > v2) dist += 2;
      }
    }
  }
  return dist;
}

function aStar(start: SlideBoard, n: number): number[] {
  const key = (b: SlideBoard) => b.join(',');
  const startKey = key(start);
  const open = new Map<string, { board: SlideBoard; g: number; f: number }>();
  open.set(startKey, { board: start, g: 0, f: heuristic(start, n) });
  const cameFrom = new Map<string, { prev: string; tile: number }>();
  const gScore = new Map<string, number>([[startKey, 0]]);
  const closed = new Set<string>();

  while (open.size > 0) {
    let bestKey = '';
    let bestF = Infinity;
    for (const [k, v] of open) {
      if (v.f < bestF) {
        bestF = v.f;
        bestKey = k;
      }
    }
    const current = open.get(bestKey)!;
    open.delete(bestKey);
    closed.add(bestKey);

    if (isSolved(current.board, n)) {
      const moves: number[] = [];
      let k = bestKey;
      while (cameFrom.has(k)) {
        const step = cameFrom.get(k)!;
        moves.unshift(step.tile);
        k = step.prev;
      }
      return moves;
    }

    for (const tile of legalMoves(current.board, n)) {
      const nb = applyMove(current.board, tile, n);
      const nk = key(nb);
      if (closed.has(nk)) continue;
      const tentativeG = current.g + 1;
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, { prev: bestKey, tile });
        gScore.set(nk, tentativeG);
        open.set(nk, { board: nb, g: tentativeG, f: tentativeG + heuristic(nb, n) });
      }
    }
  }
  return [];
}

function idaStar(start: SlideBoard, n: number): number[] {
  let threshold = heuristic(start, n);
  const path: number[] = []; // tiles moved

  function search(board: SlideBoard, g: number, lastTile: number): number | true {
    const f = g + heuristic(board, n);
    if (f > threshold) return f;
    if (isSolved(board, n)) return true;
    let min = Infinity;
    for (const tile of legalMoves(board, n)) {
      // Skipping the tile we just moved prevents the only immediate cycle
      // (sliding it straight back into the blank).
      if (tile === lastTile) continue;
      const nb = applyMove(board, tile, n);
      path.push(tile);
      const t = search(nb, g + 1, tile);
      if (t === true) return true;
      if (typeof t === 'number' && t < min) min = t;
      path.pop();
    }
    return min;
  }

  for (;;) {
    const t = search(start, 0, -1);
    if (t === true) return path.slice();
    if (t === Infinity) return [];
    threshold = t;
  }
}

export function solveSliding(b: SlideBoard, n: number): number[] {
  if (!isSolvable(b, n)) throw new Error('unsolvable board');
  if (isSolved(b, n)) return [];
  return n <= 3 ? aStar(b, n) : idaStar(b, n);
}
