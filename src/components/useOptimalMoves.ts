import { useEffect, useRef, useState } from 'react';
import type { SlideBoard } from '../games/sliding/board';

type SolveResponse = { seq: number; length: number | null };

/**
 * Computes the optimal number of moves left to solve a sliding board, off the
 * main thread (the 4x4 solver can take ~1s on hard boards). Returns the latest
 * known distance plus a `computing` flag while a fresh result is pending. Stale
 * worker responses are discarded via a sequence id.
 */
export function useOptimalMoves(board: SlideBoard, n: number) {
  const [movesLeft, setMovesLeft] = useState<number | null>(null);
  const [computing, setComputing] = useState(true);
  const workerRef = useRef<Worker | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    const worker = new Worker(new URL('../games/sliding/solver.worker.ts', import.meta.url), {
      type: 'module',
    });
    worker.onmessage = (e: MessageEvent<SolveResponse>) => {
      if (e.data.seq === seqRef.current) {
        setMovesLeft(e.data.length);
        setComputing(false);
      }
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    const seq = seqRef.current + 1;
    seqRef.current = seq;
    setComputing(true);
    worker.postMessage({ seq, board, n });
  }, [board, n]);

  return { movesLeft, computing };
}
