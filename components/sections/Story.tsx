'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { SHOP, WHY_US } from '@/lib/config';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const fmt = (n: number) => n.toLocaleString('en-IN');

const HEADLINE: string = SHOP.tagline;
const WORDS = HEADLINE.split(' ');
const PULL_QUOTE = WHY_US[0].text;

// Edit these to real numbers. The JSX renders the final values, so nobody ever sees "0".
const STATS = [
  { value: 5000, suffix: '+', label: 'cakes delivered' },
  { value: 100, suffix: '%', label: 'fresh, never frozen' },
  { value: SHOP.minNoticeCustom, suffix: 'h', label: 'notice for custom cakes' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Styles: reveal states are CSS. JS only flips idle → armed → in.            */
/* -------------------------------------------------------------------------- */
const STYLES = `
.st-rise{transition:opacity .9s cubic-bezier(.2,.8,.2,1) var(--d,0s),transform .9s cubic-bezier(.2,.8,.2,1) var(--d,0s)}
[data-st="armed"] .st-rise{opacity:0;transform:translate3d(0,26px,0)}
.st-word{transition:transform 1.1s cubic-bezier(.16,1,.3,1) calc(var(--i,0) * 70ms)}
[data-st="armed"] .st-word{transform:translate3d(0,115%,0)}
.st-zoom{transition:transform 1.9s cubic-bezier(.16,1,.3,1)}
[data-st="armed"] .st-zoom{transform:scale(1.22)}
@keyframes stSpin{to{transform:rotate(360deg)}}
.st-spin{animation:stSpin 26s linear infinite}
.st-cta svg{transition:transform .4s cubic-bezier(.2,.8,.2,1)}
@media (hover:hover) and (pointer:fine){.st-cta:hover svg{transform:translate3d(4px,0,0)}}
@media (prefers-reduced-motion:reduce){
  .st-rise,.st-word,.st-zoom{transition:none!important}
  [data-st="armed"] .st-rise,[data-st="armed"] .st-word,[data-st="armed"] .st-zoom{opacity:1;transform:none}
  .st-spin{animation:none}
}
`;

/* -------------------------------------------------------------------------- */
/*  useReveal: idle (visible) → armed (hidden, below the fold) → in (revealed) */
/* -------------------------------------------------------------------------- */
type RevealState = 'idle' | 'armed' | 'in';

function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>('idle');

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already on screen (or above it): leave it visible, no hide/show flash
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

/* -------------------------------------------------------------------------- */
/*  CountUp: React renders the final number; rAF animates it from 0            */
/* -------------------------------------------------------------------------- */
function CountUp({ value, start }: { value: number; start: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!start) return;
    const el = ref.current;
    if (!el) return;

    const t0 = performance.now();
    const dur = 2000;
    let raf = 0;
    el.textContent = '0';
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      el.textContent = fmt(value); // never leave a half-counted number behind
    };
  }, [start, value]);

  return <span ref={ref}>{fmt(value)}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Rotating text badge                                                         */
/* -------------------------------------------------------------------------- */
function SpinBadge({ pathId }: { pathId: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute -bottom-7 -right-1 h-[112px] w-[112px] md:-right-9 md:h-[132px] md:w-[132px]"
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--bg)', boxShadow: '0 14px 30px -14px rgba(31,48,37,0.4)' }}
      />
      <svg viewBox="0 0 120 120" className="st-spin absolute inset-0 h-full w-full text-[var(--fg)]">
        <defs>
          <path id={pathId} d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
        </defs>
        <text fontSize="9.5" fontWeight="500" fill="currentColor">
          <textPath href={`#${pathId}`} textLength="284" lengthAdjust="spacing">
            BAKED EACH MORNING · SMALL BATCHES ·
          </textPath>
        </text>
      </svg>
      <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)]">
        <path
          d="M12 0c.7 6.9 5.1 11.3 12 12-6.9.7-11.3 5.1-12 12-.7-6.9-5.1-11.3-12-12C6.9 11.3 11.3 6.9 12 0z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const craftRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const pathId = `st-${useId().replace(/:/g, '')}`;

  const [headRef, headState] = useReveal<HTMLDivElement>();
  const [imgRef, imgState] = useReveal<HTMLDivElement>();
  const [textRef, textState] = useReveal<HTMLDivElement>();
  const [statsRef, statsState] = useReveal<HTMLDivElement>(0.25);

  /* One scroll listener, active only while the section is near the viewport */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let active = false;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;

      const rr = root.getBoundingClientRect();
      const pRoot = clamp((vh - rr.top) / (vh + rr.height), 0, 1) * 2 - 1;
      if (craftRef.current) {
        craftRef.current.style.transform = `translate3d(${(-4 + (pRoot + 1) * 10).toFixed(2)}%, 0, 0)`;
      }

      const img = imgRef.current;
      if (img) {
        const ir = img.getBoundingClientRect();
        const pImg = clamp((vh - ir.top) / (vh + ir.height), 0, 1) * 2 - 1;
        // layer is 124% tall: 7% of it stays inside the slack, so no edge ever shows
        if (parallaxRef.current) parallaxRef.current.style.transform = `translate3d(0, ${(pImg * 7).toFixed(2)}%, 0)`;
        if (frameRef.current) frameRef.current.style.transform = `translate3d(0, ${(pImg * -10).toFixed(1)}px, 0)`;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          window.addEventListener('scroll', schedule, { passive: true });
          window.addEventListener('resize', schedule);
          schedule();
        } else if (!entry.isIntersecting && active) {
          active = false;
          window.removeEventListener('scroll', schedule);
          window.removeEventListener('resize', schedule);
        }
      },
      { rootMargin: '25% 0px' }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [imgRef]);

  return (
    <section
      id="story"
      ref={rootRef}
      className="relative overflow-hidden px-4 py-20 md:px-8 md:py-32"
      style={{ background: 'var(--bg)' }}
    >
      <style>{STYLES}</style>

      <div
        ref={craftRef}
        className="pointer-events-none absolute left-0 top-[14%] z-0 select-none will-change-transform md:top-1/4"
        aria-hidden="true"
      >
        <span
          className="outline-text font-display font-light"
          style={{ fontSize: 'clamp(6rem, 24vw, 16rem)', letterSpacing: '-0.02em' }}
        >
          CRAFT
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-content">
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:items-center md:gap-x-16 md:gap-y-6">
          {/* ---------------- Headline ---------------- */}
          <div ref={headRef} data-st={headState} className="md:col-start-2 md:row-start-1 md:self-end">
            <div className="st-rise flex items-center gap-4">
              <span className="block h-px w-12 bg-[var(--accent)]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--accent)]">
                Our story
              </span>
            </div>
            <h2
              aria-label={HEADLINE}
              className="mt-6 font-display font-light text-balance"
              style={{ fontSize: 'clamp(2.4rem, 9vw, 4rem)', lineHeight: 1.04 }}
            >
              {WORDS.map((word, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="mr-[0.18em] inline-block overflow-hidden pb-[0.12em] pr-[0.06em] align-bottom"
                >
                  <span className="st-word inline-block" style={{ '--i': i } as CSSProperties}>
                    {word === 'patient' ? <em className="h2-italic">{word}</em> : word}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          {/* ---------------- Arch image ---------------- */}
          <div
            ref={imgRef}
            data-st={imgState}
            className="relative mx-auto w-full max-w-[420px] md:col-start-1 md:row-span-2 md:row-start-1 md:mx-0 md:max-w-[460px] md:justify-self-start"
          >
            <div className="st-rise relative">
              <div
                ref={frameRef}
                className="pointer-events-none absolute -inset-3 rounded-b-[36px] rounded-t-[999px] border border-[var(--border-strong)] will-change-transform"
              />
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-b-[28px] rounded-t-[999px]"
                style={{ background: 'var(--surface-1)', isolation: 'isolate' }}
              >
                {/* 124% tall, offset -12%: parallax never exposes an edge */}
                <div ref={parallaxRef} className="absolute inset-x-0 -top-[12%] h-[124%] will-change-transform">
                  <div className="st-zoom absolute inset-0">
                    <Image
                      src="https://picsum.photos/seed/cake-story-craft/800/1000"
                      alt="A cake being decorated in the Maison Gateaux kitchen"
                      fill
                      sizes="(max-width: 768px) 92vw, 460px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
              <SpinBadge pathId={pathId} />
            </div>
          </div>

          {/* ---------------- Text + CTA ---------------- */}
          <div ref={textRef} data-st={textState} className="space-y-6 md:col-start-2 md:row-start-2 md:self-start">
            <p className="st-rise text-[17px] leading-8 md:text-lg" style={{ '--d': '0s' } as CSSProperties}>
              Every cake at {SHOP.name} starts the same way: butter, eggs, sugar, and patience. We bake each morning
              in small batches, so what you get today was mixed today.
            </p>

            <blockquote
              className="st-rise border-l-2 pl-5 font-display text-xl font-light leading-snug md:text-2xl"
              style={{ borderColor: 'var(--accent)', '--d': '0.1s' } as CSSProperties}
            >
              {PULL_QUOTE}
            </blockquote>

            <p
              className="st-rise text-[15px] leading-7 text-[var(--fg-muted)] md:text-base md:leading-8"
              style={{ '--d': '0.2s' } as CSSProperties}
            >
              Custom cakes take a little longer — {SHOP.minNoticeCustom} hours at least — because the design, the
              message, and the photo all need time to set. The result is a cake that looks like the occasion it was
              made for.
            </p>

            <div className="st-rise pt-2" style={{ '--d': '0.3s' } as CSSProperties}>
              <a
                href="#shop"
                className="st-cta inline-flex h-12 items-center gap-3 rounded-full px-7 text-sm font-medium transition duration-300 active:scale-[0.97]"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}
              >
                Browse the shop
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ---------------- Stats ---------------- */}
        <div ref={statsRef} data-st={statsState} className="mt-16 md:mt-24">
          <div
            className="st-rise grid grid-cols-3 divide-x divide-[var(--border)] rounded-[28px] border border-[var(--border)] py-7 md:py-11"
            style={{ background: 'var(--surface-1)' }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="px-2 text-center md:px-6">
                <p className="font-display text-3xl font-light tabular-nums md:text-5xl">
                  <CountUp value={stat.value} start={statsState === 'in'} />
                  <span className="text-[var(--accent)]">{stat.suffix}</span>
                </p>
                <p className="mt-2 text-[9px] uppercase leading-4 tracking-[0.18em] text-[var(--fg-muted)] md:mt-3 md:text-xs md:tracking-[0.32em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}