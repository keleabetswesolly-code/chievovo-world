import { useRef, useCallback, useState } from "react";

/**
 * Pull-to-refresh hook with visual indicator support.
 * Returns touch handlers + `pulling` state (boolean) + `pullProgress` (0–1).
 * Spread the handlers onto the scrollable container.
 */
export default function usePullToRefresh(onRefresh, threshold = 72) {
  const startY = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  const onTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if ((el.scrollTop ?? window.scrollY) <= 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPullProgress(Math.min(delta / threshold, 1));
    }
  }, [threshold]);

  const onTouchEnd = useCallback(async (e) => {
    if (startY.current === null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    startY.current = null;
    if (delta >= threshold) {
      setIsRefreshing(true);
      setPullProgress(0);
      await onRefresh();
      setIsRefreshing(false);
    } else {
      setPullProgress(0);
    }
  }, [onRefresh, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd, isRefreshing, pullProgress };
}