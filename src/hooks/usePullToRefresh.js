import { useRef, useCallback } from "react";

/**
 * Lightweight pull-to-refresh hook.
 * Attach the returned { onTouchStart, onTouchMove, onTouchEnd } to the
 * scrollable container. Calls `onRefresh` when the user pulls down ≥ threshold px
 * while the scroll position is at the top.
 */
export default function usePullToRefresh(onRefresh, threshold = 72) {
  const startY = useRef(null);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e) => {
    // Only activate when scrolled to top
    const el = e.currentTarget;
    if ((el.scrollTop ?? window.scrollY) <= 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, []);

  const onTouchMove = useCallback(() => {
    // Intentionally left minimal — native scroll handles visual feedback
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (delta >= threshold) {
      onRefresh();
    }
    startY.current = null;
    pulling.current = false;
  }, [onRefresh, threshold]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}