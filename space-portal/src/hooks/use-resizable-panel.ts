'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseResizablePanelOptions {
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  /** Which edge the resize handle sits on */
  edge: 'left' | 'right';
}

export function useResizablePanel({
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth,
  edge,
}: UseResizablePanelOptions) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(defaultWidth);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setWidth(Math.min(maxWidth, Math.max(minWidth, parsed)));
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  const persistWidth = useCallback(
    (w: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, String(w));
      }
    },
    [storageKey]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startX.current = e.clientX;
      startWidth.current = width;
    },
    [width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX.current;
      const next =
        edge === 'left'
          ? startWidth.current - delta
          : startWidth.current + delta;
      const clamped = Math.min(maxWidth, Math.max(minWidth, next));
      setWidth(clamped);
    };

    const onUp = () => {
      setIsResizing(false);
      setWidth((w) => {
        persistWidth(w);
        return w;
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, edge, minWidth, maxWidth, persistWidth]);

  return { width, isResizing, handleMouseDown };
}
