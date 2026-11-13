'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { SHOP } from '@/lib/config';
import { PhoneIcon, WhatsAppIcon, InstagramIcon } from '@/components/ui/icons';
import { useAnchorNav } from '@/hooks/useAnchorNav';
import { useReveal } from '@/hooks/useReveal';

const EXPLORE = [
  { href: '/#shop', label: 'All cakes' },
  { href: '/#gifts', label: 'Gift boxes' },
  { href: '/#story', label: 'Our story' },
  { href: '/#contact', label: 'Enquire' },
] as const;

const CREAM = 'rgba(255,253,248,';

const STYLES = `
.ft-rise{transition:opacity .9s cubic-bezier(.2,.8,.2,1) var(--d,0s),transform .9s cubic-bezier(.2,.8,.2,1) var(--d,0s)}
[data-ft="armed"] .ft-rise{opacity:0;transform:translate3d(0,26px,0)}
.ft-letter{transition:transform 1.1s cubic-bezier(.16,1,.3,1) calc(var(--i,0) * 45ms)}
[data-ft="armed"] .ft-letter{transform:translate3d(0,108%,0)}
.ft-mark{font-size:clamp(3.2rem,17vw,9rem);letter-spacing:-.02em}
@media (min-width:768px){.ft-mark{font-size:min(9.2vw,9rem)}}
.ft-link{color:${CREAM}.68);transition:color .3s ease}
@media (hover:hover) and (pointer:fine){.ft-link:hover{color:#fff}}
.ft-top{transition:transform .2s ease,background-color .3s ease,color .3s ease}
@media (hover:hover) and (pointer:fine){.ft-top:hover{background:${CREAM}.95);color:#1f3025}}
@media (prefers-reduced-motion:reduce){.ft-rise,.ft-letter,.ft-top{transition:none!important}[data-ft="armed"] .ft-rise,[data-ft="armed"] .ft-letter{opacity:1;transform:none}}
`;

const delay = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;
const idx = (i: number) => ({ '--i': i }) as CSSProperties;

export function Footer() {
  const { onNav, toTop } = useAnchorNav();
  const [contentRef, contentState] = useReveal<HTMLDivElement>(0.1);
  const [markRef, markState] = useReveal<HTMLDivElement>(0.2);

  const words = SHOP.name.split(' ');
  let letterIndex = 0;

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: '#1f3025', color: `${CREAM}.92)` }}
    >
      <style>{STYLES}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 45% at 50% 0%, rgba(240,68,37,0.16), transparent)' }}
      />

      <div className="relative mx-auto max-w-content px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-16 md:px-8 md:pb-10 md:pt-24">
        {/* ------------------------------ Columns ------------------------------ */}
        <div ref={contentRef} data-ft={contentState}>
          <div className="grid gap-12 md:grid-cols-[1.35fr_1fr_1fr_1fr] md:gap-10">
            <div className="ft-rise space-y-6" style={delay(0)}>
              <p className="max-w-xs font-display text-[1.9rem] font-light leading-[1.12] md:text-4xl">
                Cakes as a <em className="h2-italic">patient</em> craft.
              </p>
              <a
                href={`https://wa.me/${SHOP.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-3 rounded-full px-6 text-sm font-medium transition active:scale-[0.97]"
                style={{ background: `${CREAM}.95)`, color: '#1f3025' }}
              >
                <WhatsAppIcon className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>

            <div className="ft-rise space-y-4" style={delay(0.08)}>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em]" style={{ color: `${CREAM}.45)` }}>
                Contact
              </p>
              <a href={`tel:+${SHOP.phone}`} className="ft-link flex items-center gap-3 text-sm">
                <PhoneIcon className="h-4 w-4" /> +{SHOP.phone}
              </a>
              <a
                href={`https://wa.me/${SHOP.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ft-link flex items-center gap-3 text-sm"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={SHOP.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="ft-link flex items-center gap-3 text-sm"
              >
                <InstagramIcon className="h-4 w-4" /> {SHOP.instagramHandle}
              </a>
            </div>

            <div className="ft-rise space-y-4" style={delay(0.16)}>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em]" style={{ color: `${CREAM}.45)` }}>
                Explore
              </p>
              <ul className="space-y-3">
                {EXPLORE.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={(e) => onNav(e, l.href)} className="ft-link text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ft-rise space-y-4" style={delay(0.24)}>
              <p className="text-[10px] font-medium uppercase tracking-[0.3em]" style={{ color: `${CREAM}.45)` }}>
                Delivery
              </p>
              <p className="ft-link text-sm leading-6">{SHOP.area}</p>
              <p className="ft-link text-sm">Open {SHOP.hours}</p>
              <p className="ft-link text-sm">Free delivery above ₹{SHOP.freeDeliveryAbove}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SHOP.pincodes.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border px-2.5 py-1 text-[11px] tabular-nums"
                    style={{ borderColor: `${CREAM}.2)`, color: `${CREAM}.6)` }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------ Wordmark ------------------------------ */}
        <div
          ref={markRef}
          data-ft={markState}
          aria-hidden="true"
          className="mt-16 flex select-none flex-col items-center md:mt-24 md:flex-row md:justify-center md:gap-[0.3em]"
        >
          {words.map((word, wi) => (
            <span
              key={wi}
              className="ft-mark flex overflow-hidden pb-[0.1em] font-display font-light uppercase leading-[0.95]"
              style={{ color: 'transparent', WebkitTextStroke: `1px ${CREAM}.3)` }}
            >
              {word.split('').map((ch) => {
                const i = letterIndex++;
                return (
                  <span key={i} className="ft-letter inline-block" style={idx(i)}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </div>

        {/* ------------------------------ Bottom bar ------------------------------ */}
        <div
          className="mt-10 flex flex-col items-center gap-6 border-t pt-8 md:flex-row md:justify-between"
          style={{ borderColor: `${CREAM}.12)` }}
        >
          <p className="text-xs" style={{ color: `${CREAM}.5)` }}>
            &copy; {new Date().getFullYear()} {SHOP.name}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={toTop}
            aria-label="Back to top"
            className="ft-top flex h-12 w-12 items-center justify-center rounded-full border active:scale-95 md:order-last"
            style={{ borderColor: `${CREAM}.28)` }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>

          <Link href="/admin" className="ft-link text-[11px]" style={{ opacity: 0.55 }}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}