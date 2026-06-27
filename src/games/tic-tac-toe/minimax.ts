import { type TTTBoard, type Player, winner, availableMoves, other } from './board';

// Returns score from `me`'s perspective: +(10 - depth) win, -(10 - depth) loss, 0 draw.
function minimax(
  board: TTTBoard,
  toMove: Player,
  me: Player,
  depth: number,
  alpha: number,
  beta: number
): number {
  const w = winner(board);
  if (w === me) return 10 - depth;
  if (w === other(me)) return depth - 10;
  if (w === 'draw') return 0;

  const maximizing = toMove === me;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of availableMoves(board)) {
    const next = board.slice();
    next[move] = toMove;
    const score = minimax(next, other(toMove), me, depth + 1, alpha, beta);
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function bestMove(board: TTTBoard, player: Player): number {
  let bestScore = -Infinity;
  let move = availableMoves(board)[0];
  for (const candidate of availableMoves(board)) {
    const next = board.slice();
    next[candidate] = player;
    const score = minimax(next, other(player), player, 1, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      move = candidate;
    }
  }
  return move;
}
