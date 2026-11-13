'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type RevealState = 'idle' | 'armed' | 'in';

/**
 * idle  = visible (server HTML, reduced motion, or already on screen)
 * armed = hidden, waiting below the fold
 * in    = revealed
 * Put `data-x={state}` on the element and style the armed/in states in CSS.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>('idle');

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState('armed');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('in');
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, state] as const;
}