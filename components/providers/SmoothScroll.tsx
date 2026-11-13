'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/gsap';

type ScrollTarget = string | number | HTMLElement;

type SmoothScrollContextType = {
  lenis: RefObject<Lenis | null>;
  scrollTo: (target: ScrollTarget, options?: { offset?: number }) => void;
  stop: () => void;
  start: () => void;
  getVelocity: () => number;
};

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);

export function useSmoothScroll(): SmoothScrollContextType | null {
  return useContext(SmoothScrollContext);
}

const ANCHOR_OFFSET = -80; // keep in sync with the offset used by the "Shop now" buttons

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    registerGsapPlugins();
    // Stops layout jumps when the mobile address bar collapses/expands
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Touch devices keep native scrolling (syncTouch: false)
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Pause smooth scrolling while something (sheet, drawer) locks the page with overflow:hidden on <html>
    const html = document.documentElement;
    const syncLock = () => {
      if (html.style.overflow === 'hidden') lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(html, { attributes: true, attributeFilter: ['style'] });
    syncLock();

    // In-page links (#shop, #story ...) glide with the header offset instead of jumping
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      let el: HTMLElement | null = null;
      try {
        el = document.querySelector<HTMLElement>(hash);
      } catch {
        return; // not a valid selector
      }
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: ANCHOR_OFFSET });
      history.pushState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      observer.disconnect();
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: ScrollTarget, options?: { offset?: number }) => {
    const offset = options?.offset ?? 0;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    // Native fallback (reduced motion): now respects the offset
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset, behavior });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior });
    }
  }, []);

  const stop = useCallback(() => lenisRef.current?.stop(), []);
  const start = useCallback(() => lenisRef.current?.start(), []);
  const getVelocity = useCallback(() => lenisRef.current?.velocity ?? 0, []);

  const value = useMemo(
    () => ({ lenis: lenisRef, scrollTo, stop, start, getVelocity }),
    [scrollTo, stop, start, getVelocity]
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}