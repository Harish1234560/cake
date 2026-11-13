'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/gsap';

const ITEMS = [
  'Baked each morning',
  'Eggless on request',
  'Delivered by us',
  'Custom designs',
  'Message on cake free',
  'Real ingredients',
];

// Deep green taken from your carousel overlay. Change it to your own token if you have one.
const BG = '#1f3025';
const CREAM = 'rgba(255,253,248,0.94)';

function Star() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0 text-[var(--accent)]">
      <path d="M12 0c.7 6.9 5.1 11.3 12 12-6.9.7-11.3 5.1-12 12-.7-6.9-5.1-11.3-12-12C6.9 11.3 11.3 6.9 12 0z" fill="currentColor" />
    </svg>
  );
}

/** One full set of items, repeated twice so a single group is always wider than the screen. */
function Group({ hidden }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center motion-reduce:flex-wrap motion-reduce:justify-center"
    >
      {[0, 1].map((rep) =>
        ITEMS.map((item, i) => {
          const outlined = i % 2 === 1;
          return (
            <span
              key={`${rep}-${i}`}
              className={`flex items-center gap-6 px-4 md:gap-9 md:px-6 ${rep === 1 ? 'motion-reduce:hidden' : ''}`}
            >
              <span
                className="font-display text-xl font-light italic md:text-3xl"
                style={
                  outlined
                    ? { color: 'transparent', WebkitTextStroke: '1px rgba(255,253,248,0.6)' }
                    : { color: CREAM }
                }
              >
                {item}
              </span>
              <Star />
            </span>
          );
        })
      )}
    </div>
  );
}

export function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced motion is handled in CSS (static wrapped list), so skip the animation entirely.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    registerGsapPlugins();

    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    // Track = [group][group]. Moving it by -50% is exactly one group, so the loop is
    // seamless at any screen width, with no measuring and no font-load race.
    const tl = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });

    // Scroll velocity gives a smooth speed boost that decays on its own.
    let boost = 0;
    let ts = 1;
    const velocity = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) / 450, 4);
      },
    });

    // Run only while on screen.
    const visibility = ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });
    if (!visibility.isActive) tl.pause();

    const tick = () => {
      boost *= 0.94;
      ts += (1 + boost - ts) * 0.1;
      tl.timeScale(ts);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      velocity.kill();
      visibility.kill();
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-label="Why customers choose Maison Gateaux"
      className="overflow-hidden py-5 md:py-7"
      style={{
        background: BG,
        borderBlock: '1px solid rgba(255,253,248,0.08)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
      }}
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center"
      >
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}