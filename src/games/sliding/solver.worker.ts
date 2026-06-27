import { solveSliding } from './solver';
import type { SlideBoard } from './board';

type SolveRequest = { seq: number; board: SlideBoard; n: number };
type SolveResponse = { seq: number; length: number | null };

// Runs the (potentially slow, for 4x4) sliding solver off the main thread so the
// live "moves to solve" counter never blocks the UI. `length` is null if the
// board is unsolvable.
const ctx = self as unknown as Worker;

ctx.onmessage = (e: MessageEvent<SolveRequest>) => {
  const { seq, board, n } = e.data;
  let length: number | null;
  try {
    length = solveSliding(board, n).length;
  } catch {
    length = null;
  }
  const response: SolveResponse = { seq, length };
  ctx.postMessage(response);
};
