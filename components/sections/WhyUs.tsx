'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/gsap';
import { WHY_US } from '@/lib/config';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

const ICONS = [
  <svg key="0" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="16" r="10" /><path d="M12 16l3 3 6-6" /></svg>,
  <svg key="1" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 22L16 6l10 16z" /><path d="M16 6v16" /></svg>,
  <svg key="2" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><circle cx="16" cy="16" r="10" /><path d="M16 6v10l6 4" /></svg>,
  <svg key="3" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><rect x="6" y="10" width="20" height="14" rx="2" /><path d="M10 10V6h12v4" /><circle cx="16" cy="17" r="3" /></svg>,
  <svg key="4" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><path d="M5 18l5 5 12-12" /><path d="M5 24h22" /></svg>,
  <svg key="5" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><path d="M8 8h16v16H8z" /><path d="M12 14h8M12 18h5" /></svg>,
];

export function WhyUs() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    registerGsapPlugins();
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const tiles = ref.current!.querySelectorAll('.why-tile');
      gsap.set(tiles, { y: 24, opacity: 0 });
      ScrollTrigger.batch(tiles, {
        start: 'top 85%',
        onEnter: (els) => {
          gsap.to(els, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
          els.forEach((el) => {
            const paths = el.querySelectorAll('svg path, svg circle, svg rect, svg line');
            gsap.fromTo(paths, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out', stagger: 0.05 });
          });
        },
        once: true,
      });
    }, ref);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  };

  return (
    <section className="py-20 px-4 md:py-32 md:px-8 layered-bg" style={{ background: 'var(--surface-1)' }}>
      <div ref={ref} className="mx-auto max-w-content">
        <div className="accent-line" />
        <h2 className="section-heading mb-12">Why <em className="h2-italic">Us</em></h2>

        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 border border-[var(--border)] rounded-[28px] overflow-hidden" style={{ background: 'var(--border)' }}>
          {WHY_US.map((item, i) => (
            <div
              key={item.title}
              className="why-tile p-6 md:p-8 space-y-4 relative overflow-hidden transition-colors"
              style={{ background: 'var(--surface-2)', '--mx': '50%', '--my': '50%' } as React.CSSProperties}
              onPointerMove={handlePointerMove}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300" style={{ background: 'radial-gradient(200px circle at var(--mx) var(--my), rgba(200,149,90,0.08), transparent)' }} />
              <div className="relative" onMouseEnter={(e) => e.currentTarget.parentElement?.querySelector('.spotlight')?.classList.add('opacity-100')}>
                {ICONS[i]}
              </div>
              <p className="caption relative">{item.title}</p>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed relative">{item.text}</p>
              <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500" style={{ background: 'radial-gradient(300px circle at var(--mx) var(--my), rgba(200,149,90,0.06), transparent)' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
