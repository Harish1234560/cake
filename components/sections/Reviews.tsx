'use client';

import { useRef, useEffect } from 'react';
import { gsap, ScrollTrigger, registerGsapPlugins } from '@/lib/gsap';
import { REVIEWS } from '@/lib/config';
import { StarIcon } from '@/components/ui/icons';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

export function Reviews() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    registerGsapPlugins();
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const cards = ref.current!.querySelectorAll('.review-card');
      gsap.set(cards, { y: 24, opacity: 0 });
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (els) => {
          gsap.to(els, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
          els.forEach((el) => {
            const stars = el.querySelectorAll('.review-star');
            gsap.fromTo(stars, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)', delay: 0.2 });
          });
        },
        once: true,
      });
    }, ref);
    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="reviews" ref={ref} className="py-20 px-4 md:py-32 md:px-8" style={{ background: 'var(--cream)' }}>
      <div className="mx-auto max-w-content">
        <div className="accent-line" />
        <h2 className="section-heading mb-12" style={{ color: 'var(--bg)' }}>
          Kind <em className="h2-italic">Words</em>
        </h2>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="review-card snap-center flex-shrink-0 w-[85%] md:w-auto rounded-[28px] p-8 space-y-4"
              style={{ background: '#fff', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <div className="font-display text-6xl leading-none gold-text" style={{ height: '2rem' }}>&ldquo;</div>
              <div className="flex gap-1 text-[var(--accent)]">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} className="review-star inline-block"><StarIcon className="h-4 w-4" /></span>
                ))}
              </div>
              <p className="font-display text-lg font-light leading-relaxed text-balance" style={{ color: 'var(--bg)' }}>
                {review.quote}
              </p>
              <div className="space-y-1 pt-2 border-t border-[rgba(0,0,0,0.06)]">
                <p className="text-sm font-medium" style={{ color: 'var(--bg)' }}>{review.name}</p>
                <p className="text-xs text-[rgba(10,6,4,0.5)]">{review.ordered}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
