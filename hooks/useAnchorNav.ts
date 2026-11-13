'use client';

import { useCallback, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';

const OFFSET = -80; // fixed header

export function useAnchorNav() {
  const pathname = usePathname();
  const smooth = useSmoothScroll();

  /**
   * On the home page: glide to the section.
   * On any other page: do nothing, so <Link href="/#shop"> navigates normally.
   */
  const onNav = useCallback(
    (e: MouseEvent<HTMLElement>, href: string, delay = 0) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!href.startsWith('/#') || pathname !== '/') return;
      const hash = href.slice(1);
      if (!document.querySelector(hash)) return;
      e.preventDefault();
      const go = () => {
        if (smooth) smooth.scrollTo(hash, { offset: OFFSET });
        else document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', hash);
      };
      if (delay > 0) window.setTimeout(go, delay);
      else go();
    },
    [pathname, smooth]
  );

  const toTop = useCallback(() => {
    if (smooth) smooth.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [smooth]);

  return useMemo(() => ({ onNav, toTop }), [onNav, toTop]);
}