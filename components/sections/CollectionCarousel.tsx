'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/gsap';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { usePrefersReducedMotion, useIsMobile } from '@/hooks/useMediaQuery';
import { CATEGORIES } from '@/lib/config';

type Category = (typeof CATEGORIES)[number];

const FILTERS: Record<string, string> = {
  birthday: 'Birthday',
  chocolate: 'Chocolate',
  'fruit-cream': 'Fruit & Cream',
  cupcakes: 'Cupcakes & Jars',
};

const GAP = 14; // px gap between cards on mobile
const MOBILE_CARD_W = 'min(76vw, 320px)';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pad = (n: number) => String(n).padStart(2, '0');

/* -------------------------------------------------------------------------- */
/*  Shared: "Shop now" behaviour (same logic as before)                        */
/* -------------------------------------------------------------------------- */
function useShopNow() {
  const smoothScroll = useSmoothScroll();
  return useCallback(
    (slug: string) => {
      const filter = FILTERS[slug];
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter);
      const url = `/?${params.toString()}#shop`;
      if (window.location.pathname === '/') {
        if (smoothScroll) smoothScroll.scrollTo('#shop', { offset: -80 });
        else document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('set-filter', { detail: filter ?? null }));
      } else {
        window.location.href = url;
      }
    },
    [smoothScroll]
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared: card content (image + gradient + text + button)                    */
/* -------------------------------------------------------------------------- */
function CardFace({
  cat,
  index,
  imgRef,
  onShop,
}: {
  cat: Category;
  index: number;
  imgRef?: (el: HTMLDivElement | null) => void;
  onShop: (slug: string) => void;
}) {
  return (
    <>
      <div ref={imgRef} className="absolute inset-0 will-change-transform" style={{ transform: 'scale(1.25)' }}>
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          sizes="(max-width: 768px) 76vw, 380px"
          className="object-cover"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(31,48,37,0.94), rgba(31,48,37,0.15) 58%, rgba(18,16,14,0.2) 100%)',
        }}
      />
      <div className="absolute left-5 top-5 z-10 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[rgba(255,253,248,0.9)] md:text-[11px]">
        <span className="h-px w-8 bg-[var(--accent)]" />
        {cat.slug}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-6 md:p-7">
        <span className="font-display text-4xl leading-none text-white/80 md:text-5xl">{pad(index + 1)}</span>
        <p className="mt-3 max-w-[11ch] font-display text-xl leading-tight text-white md:text-2xl">{cat.name}</p>
        <button onClick={() => onShop(cat.slug)} className="pill-btn group mt-4 text-xs">
          <span>Shop Now</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  MOBILE: native swipe + snap, scroll position drives the 3D/parallax look   */
/* -------------------------------------------------------------------------- */
function MobileCarousel({ onShop }: { onShop: (slug: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    registerGsapPlugins();
    const scroller = scrollerRef.current;
    const section = sectionRef.current;
    if (!scroller || !section) return;

    const n = CATEGORIES.length;
    let raf = 0;

    const render = () => {
      raf = 0;
      const first = scroller.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + GAP;
      const pos = scroller.scrollLeft / step;

      innerRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = i - pos;
        const ad = Math.min(Math.abs(d), 2);
        el.style.transform = `translate3d(0, ${ad * 16}px, 0) scale(${1 - ad * 0.09}) rotateY(${clamp(-d * 9, -16, 16)}deg)`;
        el.style.opacity = String(1 - ad * 0.32);

        const img = imgRefs.current[i];
        if (img) img.style.transform = `translate3d(${clamp(d, -1, 1) * -10}%, 0, 0) scale(1.25)`;
      });

      const idx = clamp(Math.round(pos), 0, n - 1);
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8);
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    // Entrance (outer wrappers only, so it never fights the scroll-driven transforms)
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });
      gsap.from(Array.from(scroller.children), {
        opacity: 0,
        y: 56,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: scroller, start: 'top 88%', once: true },
      });
    }, section);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      ctx.revert();
    };
  }, []);

  const goTo = (i: number) => {
    const scroller = scrollerRef.current;
    const first = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !first) return;
    scroller.scrollTo({ left: i * (first.offsetWidth + GAP), behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16" style={{ background: 'var(--bg)' }}>
      <div className="px-6">
        <div data-reveal className="accent-line ml-0 mb-4" />
        <h2 data-reveal className="font-display text-left text-4xl leading-none">
          Our <em className="h2-italic">Collections</em>
        </h2>
        <p data-reveal className="mt-4 max-w-xs text-left text-sm leading-6 text-[var(--fg-muted)]">
          A little something for every celebration, from bright fruit cakes to deep chocolate layers.
        </p>
      </div>

      <div
        ref={scrollerRef}
        className="mt-10 flex snap-x snap-mandatory overflow-x-auto pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          gap: GAP,
          paddingInline: `calc((100vw - ${MOBILE_CARD_W}) / 2)`,
          overscrollBehaviorX: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            className="shrink-0 snap-center snap-always"
            style={{ width: MOBILE_CARD_W, perspective: 900 }}
          >
            <div
              ref={(el) => {
                innerRefs.current[i] = el;
              }}
              className="image-card relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(32,51,38,0.18)] will-change-transform"
              style={{ transformOrigin: 'center 60%' }}
            >
              <CardFace
                cat={cat}
                index={i}
                onShop={onShop}
                imgRef={(el) => {
                  imgRefs.current[i] = el;
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* counter + dots */}
      <div className="flex items-center justify-between px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--fg-muted)]">
          <span className="text-[var(--accent)]">{pad(active + 1)}</span> — {pad(CATEGORIES.length)}
        </p>
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              aria-label={`Go to ${cat.name}`}
              onClick={() => goTo(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === active ? 28 : 6,
                background: i === active ? 'var(--accent)' : 'rgba(0,0,0,0.18)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  DESKTOP: pinned coverflow, ONE scroll value drives every card              */
/* -------------------------------------------------------------------------- */
function DesktopCoverflow({ onShop }: { onShop: (slug: string) => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const n = cards.length;
    if (n < 2) return;

    const dims = cards.map((c) => c.querySelector<HTMLElement>('[data-dim]'));
    const proxy = { p: 0 };
    let step = 340;

    const render = () => {
      cards.forEach((el, i) => {
        const d = i - proxy.p;
        const ad = Math.abs(d);
        const c = Math.min(ad, 2);

        el.style.visibility = 'visible';
        el.style.transform = `translate3d(${d * step}px, 0, ${-c * 140}px) rotateY(${clamp(-d * 32, -45, 45)}deg) scale(${1 - c * 0.1})`;
        el.style.zIndex = String(100 - Math.round(ad * 10));
        el.style.pointerEvents = ad < 0.5 ? 'auto' : 'none';

        const dim = dims[i];
        if (dim) dim.style.opacity = String(clamp(ad, 0, 1) * 0.55);

        const img = imgRefs.current[i];
        if (img) img.style.transform = `translate3d(${clamp(d, -1, 1) * -8}%, 0, 0) scale(1.2)`;
      });

      if (barRef.current) barRef.current.style.transform = `scaleX(${proxy.p / (n - 1)})`;
      if (counterRef.current) counterRef.current.textContent = pad(clamp(Math.round(proxy.p), 0, n - 1) + 1);
    };

    const measure = () => {
      step = clamp(track.offsetWidth * 0.3, 280, 420);
      render();
    };

    const ctx = gsap.context(() => {
      measure();
      gsap.to(proxy, {
        p: n - 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${(n - 1) * 90}%`,
          pin: track,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: measure,
          snap: {
            snapTo: 1 / (n - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.05,
            ease: 'power2.inOut',
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative" style={{ background: 'var(--bg)' }}>
      <div ref={trackRef} className="relative h-[100svh] w-full overflow-hidden" style={{ perspective: '1400px' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[200] flex items-start justify-between gap-6 px-12 pt-20">
          <div className="max-w-xl rounded-[24px] bg-[rgba(255,253,248,0.94)] p-7 shadow-[0_18px_50px_rgba(32,51,38,0.08)]">
            <div className="accent-line ml-0 mb-4" />
            <h2 className="font-display text-left text-6xl leading-none">
              Our <em className="h2-italic">Collections</em>
            </h2>
            <p className="mt-4 max-w-md text-left text-sm leading-6 text-[var(--fg-muted)]">
              A little something for every celebration, from bright fruit cakes to deep chocolate layers.
            </p>
          </div>
          <p className="pt-4 text-right text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--fg-muted)]">
            Scroll to explore
            <br />
            <span className="text-[var(--accent)]">
              <span ref={counterRef}>01</span> — {pad(CATEGORIES.length)}
            </span>
          </p>
        </div>

        <div className="relative flex h-full w-full items-center justify-center">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute aspect-[4/5] will-change-transform"
              style={{ width: '27%', maxWidth: 380, visibility: 'hidden' }}
            >
              <div className="image-card relative h-full w-full overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(32,51,38,0.2)]">
                <CardFace
                  cat={cat}
                  index={i}
                  onShop={onShop}
                  imgRef={(el) => {
                    imgRefs.current[i] = el;
                  }}
                />
                <div
                  data-dim
                  className="pointer-events-none absolute inset-0 z-20 bg-[rgb(18,24,20)]"
                  style={{ opacity: 0 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-10 left-1/2 z-[200] h-px w-52 -translate-x-1/2 bg-black/10">
          <div ref={barRef} className="h-full origin-left bg-[var(--accent)]" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reduced motion: static grid (unchanged behaviour)                          */
/* -------------------------------------------------------------------------- */
function StaticGrid({ onShop }: { onShop: (slug: string) => void }) {
  return (
    <section className="px-4 py-20 md:py-32">
      <div className="accent-line" />
      <h2 className="section-heading mb-12">
        Our <em className="h2-italic">Collections</em>
      </h2>
      <div className="mx-auto grid max-w-content grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="image-card relative aspect-[3/4] overflow-hidden">
            <Image src={cat.image} alt={cat.name} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
            <div
              className="absolute inset-0 flex flex-col justify-end p-5"
              style={{ background: 'linear-gradient(to top, rgba(6,3,2,0.85), transparent 60%)' }}
            >
              <p className="font-display text-lg">{cat.name}</p>
              <button onClick={() => onShop(cat.slug)} className="pill-btn mt-3 text-xs">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
export function CollectionCarousel() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const onShop = useShopNow();

  if (prefersReducedMotion) return <StaticGrid onShop={onShop} />;
  return isMobile ? <MobileCarousel onShop={onShop} /> : <DesktopCoverflow onShop={onShop} />;
}