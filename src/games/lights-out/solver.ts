import { SIZE, type LightsBoard } from './board';

const N = SIZE * SIZE; // 25

// effect[p] = bitmask of cells toggled when pressing cell p (includes p).
function buildEffects(): number[] {
  const effect = new Array<number>(N).fill(0);
  for (let p = 0; p < N; p++) {
    const r = Math.floor(p / SIZE);
    const c = p % SIZE;
    let mask = 1 << p;
    if (r > 0) mask |= 1 << (p - SIZE);
    if (r < SIZE - 1) mask |= 1 << (p + SIZE);
    if (c > 0) mask |= 1 << (p - 1);
    if (c < SIZE - 1) mask |= 1 << (p + 1);
    effect[p] = mask;
  }
  return effect;
}

function popcount(x: number): number {
  let n = 0;
  while (x) {
    x &= x - 1;
    n++;
  }
  return n;
}

/**
 * Solve A x = b over GF(2), where A[i][p] = 1 iff pressing p toggles cell i.
 * Adjacency is symmetric, so row i of A equals effect[i]. We carry b in bit N.
 * Returns the minimum-Hamming-weight x (fewest presses), or null if inconsistent.
 */
export function solve(board: LightsBoard): number[] | null {
  const effect = buildEffects();

  // Augmented equations: bits 0..N-1 = coefficients over variables p; bit N = RHS.
  const eqs: number[] = [];
  for (let i = 0; i < N; i++) {
    eqs.push(effect[i] | (board[i] ? 1 << N : 0));
  }

  const pivotRowForCol: number[] = new Array(N).fill(-1);
  let row = 0;
  for (let col = 0; col < N && row < N; col++) {
    let sel = -1;
    for (let r = row; r < N; r++) {
      if (eqs[r] & (1 << col)) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    [eqs[row], eqs[sel]] = [eqs[sel], eqs[row]];
    for (let r = 0; r < N; r++) {
      if (r !== row && eqs[r] & (1 << col)) eqs[r] ^= eqs[row];
    }
    pivotRowForCol[col] = row;
    row++;
  }

  // Consistency: any all-zero coefficient row with RHS=1 → no solution.
  for (let r = 0; r < N; r++) {
    const coeff = eqs[r] & ((1 << N) - 1);
    const rhs = (eqs[r] >> N) & 1;
    if (coeff === 0 && rhs === 1) return null;
  }

  const freeCols: number[] = [];
  for (let col = 0; col < N; col++) {
    if (pivotRowForCol[col] === -1) freeCols.push(col);
  }

  // Enumerate all 2^freeCols assignments; keep the minimum-weight solution.
  let best: number | null = null;
  let bestWeight = Infinity;
  for (let mask = 0; mask < 1 << freeCols.length; mask++) {
    let x = 0;
    freeCols.forEach((col, k) => {
      if (mask & (1 << k)) x |= 1 << col;
    });
    // Back-substitute pivots: x_col = rhs(pivotRow) XOR (sum of free vars in that row).
    for (let col = 0; col < N; col++) {
      const pr = pivotRowForCol[col];
      if (pr === -1) continue;
      const eq = eqs[pr];
      const rhs = (eq >> N) & 1;
      let acc = rhs;
      for (const fc of freeCols) {
        if (eq & (1 << fc) && x & (1 << fc)) acc ^= 1;
      }
      if (acc) x |= 1 << col;
      else x &= ~(1 << col);
    }
    const w = popcount(x);
    if (w < bestWeight) {
      bestWeight = w;
      best = x;
    }
  }

  if (best === null) return null;
  const result: number[] = [];
  for (let i = 0; i < N; i++) if (best & (1 << i)) result.push(i);
  return result;
}
