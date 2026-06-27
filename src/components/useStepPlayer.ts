import { useCallback, useEffect, useRef, useState } from 'react';

type PlayOptions<T> = {
  intervalMs?: number;
  /**
   * Highlights the move that is *about* to run. Called immediately with the
   * first item (so it's red before the first delay), then after each move with
   * the next item, and finally with `null` once the sequence finishes.
   */
  preview?: (item: T | null, index: number) => void;
};

/**
 * Drives a timed playback of a list of items. `apply` runs one move per
 * interval and should use functional setState to avoid stale closures. With a
 * `preview` callback, the upcoming move is highlighted one tick ahead: the
 * highlight appears immediately, the move fires after the delay, and the
 * highlight jumps straight to the next item.
 */
export function useStepPlayer<T>() {
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setRunning(false);
  }, []);

  const play = useCallback(
    (items: T[], apply: (item: T, index: number) => void, opts: PlayOptions<T> = {}) => {
      stop();
      if (items.length === 0) return;
      const { intervalMs = 500, preview } = opts;
      setRunning(true);
      let i = 0;
      preview?.(items[0], 0); // highlight the first move before any delay
      timer.current = window.setInterval(() => {
        apply(items[i], i);
        i += 1;
        if (i < items.length) {
          preview?.(items[i], i); // move done — highlight the next immediately
        } else {
          preview?.(null, i); // sequence finished — clear the highlight
          stop();
        }
      }, intervalMs);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { running, play, stop };
}
