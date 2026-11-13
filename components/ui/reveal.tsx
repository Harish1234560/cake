'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type RevealProps = {
  children: ReactNode;
  delay?: number; // seconds
  y?: number; // px the element rises from
  className?: string;
};

export function Reveal({ children, delay = 0, y = 28, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already on screen: leave it visible (no hide/show flash)
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    let timer = 0;

    el.style.opacity = '0';
    el.style.transform = `translate3d(0, ${y}px, 0)`;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        el.style.transition = `opacity 0.9s ${ease} ${delay}s, transform 0.9s ${ease} ${delay}s`;
        el.style.opacity = '';
        el.style.transform = '';
        timer = window.setTimeout(() => {
          el.style.transition = '';
        }, (0.9 + delay) * 1000 + 100);
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      el.style.opacity = '';
      el.style.transform = '';
      el.style.transition = '';
    };
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
