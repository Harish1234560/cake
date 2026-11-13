'use client';

import { useEffect, useRef, useState } from 'react';
import { SHOP } from '@/lib/config';

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min(scrollTop / docHeight, 1);
      if (ref.current) {
        ref.current.style.transform = `scaleX(${progress})`;
      }
      setVisible(scrollTop > 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed left-0 top-0 z-[150] h-[2px] w-full origin-left transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'var(--gold-gradient)', transformOrigin: 'left', transform: 'scaleX(0)' }}
      ref={ref}
      aria-hidden="true"
    />
  );
}
