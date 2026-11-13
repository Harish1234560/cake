'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FRAME_COUNT } from '@/lib/config';
import { useMediaQuery } from './useMediaQuery';

type LoadState = {
  loaded: boolean[];
  progress: number;
  ready: boolean;
};

export function useFrameSequence(
  basePath: string,
  isMobile: boolean
): {
  images: (HTMLImageElement | null)[];
  progress: number;
  ready: boolean;
  total: number;
} {
  const [state, setState] = useState<LoadState>({
    loaded: [],
    progress: 0,
    ready: false,
  });

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const total = isMobile ? FRAME_COUNT.mobile : FRAME_COUNT.desktop;
  const paddedBase = `${basePath}/${isMobile ? 'mobile' : 'desktop'}`;

  const loadFrame = useCallback(
    (idx: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const num = String(idx + 1).padStart(4, '0');
        const img = new Image();
        img.src = `${paddedBase}/${num}.webp`;
        img.onload = () => {
          imagesRef.current[idx] = img;
          resolve(img);
        };
        img.onerror = () => reject(new Error(`Failed to load frame ${idx + 1}`));
      });
    },
    [paddedBase]
  );

  useEffect(() => {
    let cancelled = false;
    imagesRef.current = new Array(total).fill(null);

    async function loadAll() {
      try {
        const poster = await loadFrame(0);
        if (cancelled) return;

        const loadedArr = new Array(total).fill(false);
        loadedArr[0] = true;
        setState({ loaded: loadedArr, progress: 1 / total, ready: false });

        const batchSize = 10;
        for (let start = 1; start < total; start += batchSize) {
          if (cancelled) return;
          const end = Math.min(start + batchSize, total);
          const batch = Array.from({ length: end - start }, (_, i) => loadFrame(start + i));
          await Promise.all(batch);
          await new Promise((r) => requestAnimationFrame(() => r(null)));

          if (cancelled) return;
          for (let i = start; i < end; i++) loadedArr[i] = true;
          const progress = loadedArr.filter(Boolean).length / total;
          setState({ loaded: [...loadedArr], progress, ready: progress >= 0.3 });
        }

        if (cancelled) return;
        setState({ loaded: loadedArr, progress: 1, ready: true });
      } catch {
        // frames may be missing; keep what loaded
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [total, loadFrame]);

  return {
    images: imagesRef.current,
    progress: state.progress,
    ready: state.ready,
    total,
  };
}
