'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { CATEGORIES } from '@/lib/config';

/* -------------------------------------------------------------------------- */
/*  CONFIG: edit these                                                          */
/* -------------------------------------------------------------------------- */

// Set to true after you add the transparent PNG/WebP cutouts listed below.
const USE_CUTOUTS = false;

// Optional. Leave '' to hide the "Watch Video" button.
const HERO_VIDEO_URL = '';

// Cutout files (transparent background, ~1200px for the cake, ~500px for the rest).
const A = {
  cake: '/images/hero/cake.png',
  chocSlice: '/images/hero/slice-chocolate.png',
  berries: '/images/hero/strawberries.png',
  tart: '/images/hero/slice-tart.png',
  cocoa: '/images/hero/cocoa.png',
  cupcake: '/images/hero/cupcake.png',
} as const;

const HEADLINE = { before: 'The Ideal', accent: 'Handmade', after: 'Cake, Baked Fresh!' };
const COPY =
  'Custom and ready cakes, cupcakes, and dessert jars, baked each morning and delivered by us across Bandra and Santacruz.';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                     */
/* -------------------------------------------------------------------------- */
const css = (o: Record<string, string | number>) => o as unknown as CSSProperties;

function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/* -------------------------------------------------------------------------- */
/*  Icons (inline, no dependency)                                               */
/* -------------------------------------------------------------------------- */
const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const CakeIcon = (
  <svg {...svgProps}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v3M12 8v3M17 8v3" />
    <path d="M7 4h.01M12 4h.01M17 4h.01" />
  </svg>
);
const CupcakeIcon = (
  <svg {...svgProps}>
    <path d="M5.5 12h13l-1.4 8.2a1 1 0 0 1-1 .8H7.9a1 1 0 0 1-1-.8L5.5 12z" />
    <path d="M6 12c-.4-3.4 2.4-6 6-6s6.4 2.6 6 6" />
    <path d="M12 6V3.5" />
    <path d="M9.5 15v3.5M12 15v3.5M14.5 15v3.5" />
  </svg>
);
const LeafIcon = (
  <svg {...svgProps}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const FEATURES = [
  { id: 'cakes', title: 'Cakes', text: 'Custom and ready cakes, baked fresh every morning.', filter: 'All', icon: CakeIcon },
  { id: 'cupcakes', title: 'Cupcakes', text: 'Cupcakes and dessert jars, boxed to travel well.', filter: 'Cupcakes & Jars', icon: CupcakeIcon },
  { id: 'eggless', title: 'Eggless', text: 'Any cake can be made eggless, on request.', filter: 'Eggless', icon: LeafIcon },
] as const;

/* -------------------------------------------------------------------------- */
/*  Floating decorations around the cake                                        */
/* -------------------------------------------------------------------------- */
type Floater = {
  src: string;
  style: CSSProperties;
  depth: number; // mouse-parallax strength (px)
  rot: number; // deg tilt at float peak
  amp: number; // px float distance (negative = up)
  dur: number; // s
  round?: boolean;
};

const FLOATERS: Floater[] = USE_CUTOUTS
  ? [
      { src: A.chocSlice, style: { left: '3%', top: '-6%', width: '17%' }, depth: 18, rot: 6, amp: -10, dur: 6.2 },
      { src: A.berries, style: { left: '-8%', top: '26%', width: '24%' }, depth: 26, rot: -5, amp: -14, dur: 5.4 },
      { src: A.tart, style: { left: '-3%', bottom: '4%', width: '20%' }, depth: 14, rot: 5, amp: -9, dur: 6.8 },
      { src: A.cocoa, style: { right: '-3%', bottom: '-5%', width: '17%' }, depth: 22, rot: -4, amp: -8, dur: 5.8 },
    ]
  : [
      { src: CATEGORIES[1].image, style: { left: '1%', top: '-7%', width: '22%' }, depth: 18, rot: 4, amp: -10, dur: 6.2, round: true },
      { src: CATEGORIES[2].image, style: { left: '-7%', bottom: '8%', width: '25%' }, depth: 26, rot: -4, amp: -13, dur: 5.6, round: true },
      { src: CATEGORIES[3].image, style: { right: '-3%', bottom: '-6%', width: '20%' }, depth: 22, rot: 4, amp: -9, dur: 6.6, round: true },
    ];

/* -------------------------------------------------------------------------- */
/*  Styles: CSS keyframes (no JS animation lib, no blank hero before hydration) */
/* -------------------------------------------------------------------------- */
const STYLES = `
.hero-x{--hero-orange:#F23D0F;--hero-ink:#1f3025;--hero-peach:#FBE8DA;--hero-amber:#E58A2B}
@keyframes hRise{from{opacity:0;transform:translate3d(0,22px,0)}to{opacity:1;transform:none}}
@keyframes hPop{from{opacity:0;transform:scale(var(--s0,.7)) rotate(var(--r0,-10deg))}to{opacity:1;transform:none}}
@keyframes hFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(0,var(--amp,-10px),0) rotate(var(--rot,3deg))}}
@keyframes hDraw{to{stroke-dashoffset:0}}
.hero-x .h-rise{animation:hRise .9s cubic-bezier(.2,.8,.2,1) var(--d,0s) both}
.hero-x .h-pop{animation:hPop 1s cubic-bezier(.2,.8,.2,1) var(--d,0s) both}
.hero-x .h-float{animation:hFloat var(--dur,6s) ease-in-out var(--fd,0s) infinite;will-change:transform}
.hero-x .h-draw path{stroke-dasharray:1;stroke-dashoffset:1;animation:hDraw 1.1s ease-out var(--d,.8s) forwards}
.hero-x .h-strip .h-rise,.hero-x .h-strip .h-draw path{animation-play-state:paused}
.hero-x .h-strip.is-in .h-rise,.hero-x .h-strip.is-in .h-draw path{animation-play-state:running}
@media (prefers-reduced-motion:reduce){
  .hero-x .h-rise,.hero-x .h-pop,.hero-x .h-float{animation:none}
  .hero-x .h-draw path{animation:none;stroke-dashoffset:0}
}
`;

/* -------------------------------------------------------------------------- */
export function ScrollHero() {
  const smoothScroll = useSmoothScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stripRef, stripSeen] = useInViewOnce<HTMLDivElement>();

  /* Same behaviour as the collections carousel: scroll to #shop and set the filter */
  const goShop = useCallback(
    (filter: string) => {
      const params = new URLSearchParams({ filter });
      const url = `/?${params.toString()}#shop`;
      if (window.location.pathname === '/') {
        if (smoothScroll) smoothScroll.scrollTo('#shop', { offset: -80 });
        else document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('set-filter', { detail: filter }));
      } else {
        window.location.href = url;
      }
    },
    [smoothScroll]
  );

  /* Desktop-only mouse parallax (CSS variables, rAF-throttled) */
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      stage.style.setProperty('--px', x.toFixed(3));
      stage.style.setProperty('--py', y.toFixed(3));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      queue();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      queue();
    };
    section.addEventListener('pointermove', onMove, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  /* Video dialog (only used when HERO_VIDEO_URL is set) */
  const openVideo = () => {
    dialogRef.current?.showModal();
    videoRef.current?.play().catch(() => {});
  };
  const closeVideo = () => {
    videoRef.current?.pause();
    dialogRef.current?.close();
  };

  return (
    <section
      ref={sectionRef}
      className="hero-x relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <style>{STYLES}</style>

      {/* soft green glow, top-left (as in the reference) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(188,214,190,0.5), transparent)' }}
      />

      <div className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
        <div className="grid items-center gap-14 text-[var(--hero-ink)] md:grid-cols-[1.02fr_1fr] md:gap-8">
          {/* ------------------------------ Text ------------------------------ */}
          <div>
            {HERO_VIDEO_URL && (
              <div className="h-rise mb-6">
                <button
                  type="button"
                  onClick={openVideo}
                  className="group inline-flex items-center gap-3 text-[15px] font-medium"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                    style={{ background: 'var(--hero-orange)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Watch Video
                </button>
              </div>
            )}

            <h1
              className="h-rise font-display font-bold text-balance"
              style={css({
                fontSize: 'clamp(2.25rem, 9.2vw, 4.25rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                '--d': '0.1s',
              })}
            >
              {HEADLINE.before}{' '}
              <span className="relative inline-block whitespace-nowrap text-[var(--hero-orange)]">
                {HEADLINE.accent}
                <svg
                  className="h-draw absolute -bottom-2 left-0 h-[0.32em] w-full"
                  viewBox="0 0 220 16"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                  style={css({ '--d': '0.9s' })}
                >
                  <path
                    d="M3 11 C 45 3, 100 3, 140 8 S 205 13, 217 4"
                    pathLength={1}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              {HEADLINE.after}
            </h1>

            <p
              className="h-rise mt-6 max-w-[34rem] text-[15px] leading-7 opacity-80 md:text-base md:leading-8"
              style={css({ '--d': '0.2s' })}
            >
              {COPY}
            </p>

            <div className="h-rise mt-8 flex flex-wrap items-center gap-3" style={css({ '--d': '0.3s' })}>
              <a
                href="#story"
                className="inline-flex h-12 items-center justify-center rounded-xl px-8 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ background: 'var(--hero-orange)', boxShadow: '0 12px 26px -10px rgba(242,61,15,0.6)' }}
              >
                Read More
              </a>
              <a
                href="#shop"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[rgba(31,48,37,0.75)] px-8 text-sm font-medium transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--hero-ink)] hover:text-white active:scale-[0.97]"
              >
                Order Now
              </a>
            </div>
          </div>

          {/* ------------------------------ Visual ------------------------------ */}
          <div className="mx-auto w-full max-w-[560px] md:max-w-none">
            <div ref={stageRef} className="relative aspect-[1/0.92] w-full">
              {/* peach panel */}
              <div
                className="h-pop absolute inset-y-0 left-[10%] right-0 rounded-[28px]"
                style={css({ background: 'var(--hero-peach)', '--s0': 0.94, '--r0': '0deg', '--d': '0.15s' })}
              />

              {/* the cake */}
              {USE_CUTOUTS ? (
                <>
                  <div
                    aria-hidden="true"
                    className="absolute bottom-[9%] left-[14%] h-[8%] w-[70%] rounded-full"
                    style={{ background: 'radial-gradient(closest-side, rgba(90,45,20,0.3), transparent)' }}
                  />
                  <div className="absolute left-[1%] top-[14%] w-[92%]">
                    <div className="h-pop" style={css({ '--s0': 0.8, '--r0': '-8deg', '--d': '0.35s' })}>
                      <div
                        className="h-float relative aspect-square"
                        style={css({ '--amp': '-8px', '--rot': '1.5deg', '--dur': '7s' })}
                      >
                        <Image
                          src={A.cake}
                          alt="Strawberry cream cake from Maison Gateaux"
                          fill
                          priority
                          sizes="(max-width: 768px) 92vw, 46vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute left-[8%] top-[10%] w-[80%]">
                  <div className="h-pop" style={css({ '--s0': 0.8, '--r0': '-8deg', '--d': '0.35s' })}>
                    <div
                      className="h-float relative aspect-square overflow-hidden rounded-full ring-[6px] ring-[#fff8f1] shadow-[0_30px_60px_-20px_rgba(70,35,15,0.5)]"
                      style={css({ '--amp': '-8px', '--rot': '1.5deg', '--dur': '7s' })}
                    >
                      <Image
                        src={CATEGORIES[0].image}
                        alt="Strawberry cream cake from Maison Gateaux"
                        fill
                        priority
                        sizes="(max-width: 768px) 80vw, 40vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* floating pieces */}
              {FLOATERS.map((f, i) => (
                <div
                  key={f.src}
                  className="absolute"
                  style={{
                    ...f.style,
                    transform: `translate3d(calc(var(--px, 0) * ${f.depth}px), calc(var(--py, 0) * ${f.depth}px), 0)`,
                    transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1)',
                  }}
                >
                  <div className="h-pop" style={css({ '--d': `${0.55 + i * 0.12}s` })}>
                    <div
                      className="h-float relative aspect-square"
                      style={css({ '--amp': `${f.amp}px`, '--rot': `${f.rot}deg`, '--dur': `${f.dur}s`, '--fd': `${i * 0.5}s` })}
                    >
                      <Image
                        src={f.src}
                        alt=""
                        fill
                        sizes="120px"
                        className={
                          f.round
                            ? 'rounded-full object-cover ring-4 ring-[#fff8f1] shadow-[0_14px_30px_-10px_rgba(60,30,10,0.45)]'
                            : 'object-contain'
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------ Feature strip ------------------------------ */}
        <div
          ref={stripRef}
          className={`h-strip mt-16 grid items-center gap-9 text-[var(--hero-ink)] md:mt-20 md:grid-cols-[auto_1fr] md:gap-14 ${
            stripSeen ? 'is-in' : ''
          }`}
        >
          <div className="h-rise flex items-center gap-5" style={css({ '--d': '0s' })}>
            <div
              className="relative h-28 w-28 shrink-0 rounded-[22px] md:h-32 md:w-36"
              style={{ background: 'var(--hero-peach)' }}
            >
              {USE_CUTOUTS ? (
                <Image
                  src={A.cupcake}
                  alt=""
                  fill
                  sizes="144px"
                  className="-translate-x-4 -translate-y-5 scale-[1.15] object-contain"
                />
              ) : (
                <Image src={CATEGORIES[3].image} alt="" fill sizes="144px" className="rounded-[22px] object-cover" />
              )}
            </div>

            <button type="button" onClick={() => goShop('Chocolate')} className="text-left">
              <span className="block font-display text-2xl font-bold leading-[1.1] md:text-3xl">
                Chocolate
                <br />
                Cake
              </span>
              <svg
                className="h-draw mt-2 h-3 w-28 text-[var(--hero-orange)]"
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
                style={css({ '--d': '0.3s' })}
              >
                <path
                  d="M2 8 C 30 2, 70 2, 118 6"
                  pathLength={1}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 divide-x divide-[rgba(31,48,37,0.14)]">
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                className="h-rise px-3 first:pl-0 md:px-8"
                style={css({ '--d': `${0.12 + i * 0.1}s` })}
              >
                <button type="button" onClick={() => goShop(f.filter)} className="group block w-full text-left">
                  <span
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 group-active:scale-95 md:h-12 md:w-12"
                    style={{ background: 'var(--hero-amber)' }}
                  >
                    {f.icon}
                  </span>
                  <span className="block font-display text-base font-bold md:text-xl">{f.title}</span>
                  <span className="mt-1 block text-[11px] leading-4 opacity-70 md:text-xs md:leading-5">
                    {f.text}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------ Video dialog ------------------------------ */}
      {HERO_VIDEO_URL && (
        <dialog
          ref={dialogRef}
          onClose={() => videoRef.current?.pause()}
          onClick={(e) => {
            if (e.target === dialogRef.current) closeVideo();
          }}
          className="m-auto w-[min(92vw,900px)] overflow-hidden rounded-2xl bg-black p-0 backdrop:bg-black/70"
        >
          <button
            type="button"
            onClick={closeVideo}
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg leading-none text-black"
          >
            ×
          </button>
          <video ref={videoRef} src={HERO_VIDEO_URL} controls playsInline className="block aspect-video w-full" />
        </dialog>
      )}
    </section>
  );
}