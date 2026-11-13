'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';
import { SHOP } from '@/lib/config';
import { BagIcon, MenuIcon } from '@/components/ui/icons';
import { BagDrawer } from './BagDrawer';
import { MobileMenu } from './MobileMenu';
import { useAnchorNav } from '@/hooks/useAnchorNav';
import { useMounted } from '@/hooks/useMounted';

const NAV = [
  { href: '/#shop', label: 'Shop' },
  { href: '/#gifts', label: 'Gift Boxes' },
  { href: '/#story', label: 'Our Story' },
  { href: '/#contact', label: 'Enquire' },
] as const;

const STYLES = `
.hd{border-bottom:1px solid transparent;will-change:transform;transition:transform .5s cubic-bezier(.32,.72,0,1),background-color .4s ease,box-shadow .4s ease,border-color .4s ease}
.hd[data-scrolled="true"]{background:rgba(255,253,248,.97);border-bottom-color:var(--border);box-shadow:0 10px 26px -20px rgba(31,48,37,.4)}
.hd[data-hidden="true"]{transform:translate3d(0,-100%,0)}
.hd-link{position:relative;padding:6px 0;font-size:12.5px;font-weight:500;letter-spacing:.16em;text-transform:uppercase}
.hd-link::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--accent);transform:scaleX(0);transform-origin:right;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
@media (hover:hover) and (pointer:fine){.hd-link:hover::after{transform:scaleX(1);transform-origin:left}}
@keyframes hdPop{0%{transform:scale(1.55)}100%{transform:scale(1)}}
.hd-badge{animation:hdPop .5s cubic-bezier(.34,1.56,.64,1)}
@media (prefers-reduced-motion:reduce){.hd,.hd-link::after{transition:none}.hd-badge{animation:none}}
`;

export function Header() {
  const pathname = usePathname();
  const { onNav, toTop } = useAnchorNav();
  const mounted = useMounted();
  const rawCount = useCart((s) => s.count());
  const count = mounted ? rawCount : 0;

  const [bagOpen, setBagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Close overlays when the route changes (client-side navigation keeps the header mounted)
  useEffect(() => {
    setBagOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Lets the sticky bag bar open the drawer
  useEffect(() => {
    const open = () => setBagOpen(true);
    window.addEventListener('open-bag', open);
    return () => window.removeEventListener('open-bag', open);
  }, []);

  // Scrolled state, hide-on-scroll-down, progress line. One rAF-throttled passive listener.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let lastY = Math.max(0, window.scrollY);
    let hidden = false;
    let scrolled = false;

    const show = () => {
      if (!hidden) return;
      hidden = false;
      header.dataset.hidden = 'false';
    };

    const update = () => {
      raf = 0;
      const y = Math.max(0, window.scrollY);

      const nextScrolled = y > 16;
      if (nextScrolled !== scrolled) {
        scrolled = nextScrolled;
        header.dataset.scrolled = String(scrolled); // works with reduced motion too
      }

      const dy = y - lastY;
      if (!reduce) {
        if (dy > 6 && y > 240 && !hidden) {
          hidden = true;
          header.dataset.hidden = 'true';
        } else if (dy < -6 || y < 240) {
          show();
        }
      }
      if (Math.abs(dy) > 6) lastY = y;

      const bar = progressRef.current;
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    header.addEventListener('focusin', show); // keyboard users never lose the header
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      header.removeEventListener('focusin', show);
    };
  }, []);

  const logo = (className: string) => (
    <Link
      href="/"
      onClick={(e) => {
        if (pathname === '/' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          toTop();
        }
      }}
      className={`whitespace-nowrap font-display text-[17px] uppercase tracking-[0.1em] transition-colors hover:text-[var(--accent)] md:text-xl ${className}`}
    >
      {SHOP.name}
    </Link>
  );

  return (
    <>
      <style>{STYLES}</style>
      <header
        ref={headerRef}
        data-scrolled="false"
        data-hidden="false"
        className="hd fixed left-0 top-0 z-50 w-full"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="mx-auto grid h-full max-w-content grid-cols-[1fr_auto_1fr] items-center px-3 md:px-8">
          <div className="flex items-center justify-start">
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
            {logo('hidden md:block')}
          </div>

          <div className="flex justify-center">
            {logo('md:hidden')}
            <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} onClick={(e) => onNav(e, l.href)} className="hd-link">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-end">
            {/* ProductSheet's fly-to-bag animation finds this button by aria-label starting with "Bag". Keep it. */}
            <button
              type="button"
              className="icon-btn relative"
              aria-label={`Bag with ${count} items`}
              aria-haspopup="dialog"
              aria-expanded={bagOpen}
              onClick={() => setBagOpen(true)}
            >
              <BagIcon />
              {count > 0 && (
                <span
                  key={count}
                  className="hd-badge absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {count}
                </span>
              )}
            </button>
            <span className="sr-only" aria-live="polite">
              {count > 0 ? `${count} ${count === 1 ? 'item' : 'items'} in bag` : ''}
            </span>
          </div>
        </div>

        <div
          ref={progressRef}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left"
          style={{ background: 'var(--gold-gradient)', transform: 'scaleX(0)' }}
        />
      </header>

      <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}