'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SHOP } from '@/lib/config';
import { CloseIcon, PhoneIcon, WhatsAppIcon, InstagramIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useAnchorNav } from '@/hooks/useAnchorNav';
import { lockScroll, unlockScroll, trapFocus } from '@/lib/overlay';

const LINKS = [
  { href: '/#shop', label: 'Shop' },
  { href: '/#gifts', label: 'Gift Boxes' },
  { href: '/#story', label: 'Our Story' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/#contact', label: 'Enquire' },
] as const;

const STYLES = `
.mm{visibility:hidden;transition:visibility 0s linear .6s}
.mm[data-open="true"]{visibility:visible;transition-delay:0s}
.mm-panel{opacity:0;transform:translate3d(0,-10px,0);transition:opacity .45s ease,transform .6s cubic-bezier(.32,.72,0,1);outline:none}
.mm[data-open="true"] .mm-panel{opacity:1;transform:none}
.mm-item{opacity:0;transform:translate3d(0,30px,0);transition:opacity .45s ease,transform .5s ease}
.mm[data-open="true"] .mm-item{opacity:1;transform:none;transition:opacity .7s ease calc(120ms + var(--i,0) * 70ms),transform .9s cubic-bezier(.16,1,.3,1) calc(120ms + var(--i,0) * 70ms)}
.mm-link .mm-arrow{transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.mm-link:active .mm-arrow{transform:translate3d(6px,0,0)}
@media (prefers-reduced-motion:reduce){.mm,.mm-panel,.mm-item,.mm[data-open="true"] .mm-item,.mm-link .mm-arrow{transition:none!important}}
`;

const idx = (i: number) => ({ '--i': i }) as CSSProperties;

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { onNav } = useAnchorNav();

  // Closed = hidden AND inert (no tabbing into invisible links, hidden from screen readers)
  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    lockScroll();
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => panel?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      trapFocus(e, panel);
    };
    document.addEventListener('keydown', onKey);

    // Rotating a tablet / resizing to desktop: the mobile menu must not stay open
    const mq = window.matchMedia('(min-width: 768px)');
    const onMq = () => {
      if (mq.matches) onCloseRef.current();
    };
    mq.addEventListener('change', onMq);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      unlockScroll();
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <div ref={rootRef} data-open={open} className="mm fixed inset-0 z-[102] md:hidden">
      <style>{STYLES}</style>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        tabIndex={-1}
        className="mm-panel flex h-full flex-col"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex shrink-0 items-center justify-between px-5" style={{ height: 'var(--header-height)' }}>
          <span className="whitespace-nowrap font-display text-[17px] uppercase tracking-[0.1em]">{SHOP.name}</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="icon-btn">
            <CloseIcon />
          </button>
        </div>

        <nav
          aria-label="Menu"
          data-lenis-prevent
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5"
        >
          <ul className="border-t" style={{ borderColor: 'var(--border)' }}>
            {LINKS.map((link, i) => (
              <li key={link.href} className="mm-item border-b" style={{ ...idx(i), borderColor: 'var(--border)' }}>
                <Link
                  href={link.href}
                  onClick={(e) => {
                    onNav(e, link.href, 340); // scroll after the menu has closed and the page is unlocked
                    onClose();
                  }}
                  className="mm-link flex items-baseline justify-between gap-4 py-[18px]"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="w-6 text-[11px] tabular-nums tracking-[0.2em] text-[var(--accent)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-[2.4rem] font-light leading-none">{link.label}</span>
                  </span>
                  <ArrowRightIcon className="mm-arrow h-5 w-5 shrink-0 text-[var(--fg-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="mm-item shrink-0 space-y-5 px-5 pt-5"
          style={{ ...idx(LINKS.length), paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
        >
          <Link
            href="/checkout"
            onClick={onClose}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-full text-sm font-medium transition active:scale-[0.98]"
            style={{ background: 'var(--fg)', color: 'var(--bg)' }}
          >
            Checkout <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] uppercase leading-5 tracking-[0.2em] text-[var(--fg-muted)]">
              Open {SHOP.hours}
            </p>
            <div className="flex items-center gap-2">
              <a href={`tel:+${SHOP.phone}`} className="icon-btn" aria-label="Call us">
                <PhoneIcon />
              </a>
              <a
                href={`https://wa.me/${SHOP.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn"
                aria-label="WhatsApp us"
              >
                <WhatsAppIcon />
              </a>
              <a
                href={SHOP.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}