import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Drives a timed playback of a list of items. `applyOne` is called once per
 * interval and should use functional setState to avoid stale closures.
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
    (items: T[], applyOne: (item: T, index: number) => void, intervalMs = 500) => {
      stop();
      if (items.length === 0) return;
      setRunning(true);
      let i = 0;
      timer.current = window.setInterval(() => {
        applyOne(items[i], i);
        i += 1;
        if (i >= items.length) stop();
      }, intervalMs);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);
  return { running, play, stop };
}
