'use client';

import Image from 'next/image';
import { GIFT_BOXES, SHOP } from '@/lib/config';
import { formatINR } from '@/lib/format';
import { buildWhatsAppUrl } from '@/lib/order-text';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';

const STYLES = `
.gift{transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s ease}
.gift-img{transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}
@media (hover:hover) and (pointer:fine){
  .gift:hover{box-shadow:0 26px 44px -28px rgba(31,48,37,.4)}
  .gift:hover .gift-img{transform:scale(1.06)}
}
@media (prefers-reduced-motion:reduce){.gift,.gift-img{transition:none}}
`;

const MOST_LOVED = 'Most loved';

// "A 1 kg cake, 6 cupcakes, and a candle set." → ["A 1 kg cake", "6 cupcakes", "A candle set"]
const features = (description: string) =>
  description
    .split(',')
    .map((s) => s.trim().replace(/^and\s+/i, '').replace(/\.$/, ''))
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

export function GiftBoxes() {
  return (
    <section id="gifts" className="px-4 py-20 md:px-8 md:py-32" style={{ background: 'var(--bg)' }}>
      <style>{STYLES}</style>

      <div className="mx-auto max-w-content">
        <Reveal>
          <div className="accent-line" />
          <h2 className="section-heading mb-3">
            Gift <em className="h2-italic">Boxes</em>
          </h2>
          <p className="mb-10 text-center text-sm text-[var(--fg-muted)] md:mb-14">
            Ready-to-send hampers for celebrations and surprises.
          </p>
        </Reveal>

        {/* Mobile: swipe row with a peek of the next card. Desktop: 3-column grid. */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-2 md:mx-0 md:grid md:grid-cols-3 md:items-stretch md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:pt-6">
          {GIFT_BOXES.map((box, i) => {
            const featured = box.tag === MOST_LOVED;
            const enquiry = buildWhatsAppUrl(
              SHOP.whatsapp,
              `Hi ${SHOP.name}! I'd like to enquire about the "${box.name}" gift box (${formatINR(box.price)}).`
            );

            return (
              <Reveal key={box.id} delay={i * 0.1} className="w-[82%] shrink-0 snap-center md:w-auto">
                <article
                  className={`gift group relative flex h-full flex-col overflow-hidden rounded-[28px] border ${
                    featured ? 'md:-translate-y-4' : ''
                  }`}
                  style={{
                    background: 'var(--surface-2)',
                    borderColor: featured ? 'var(--accent)' : 'var(--border)',
                    boxShadow: featured ? '0 30px 50px -32px rgba(240,68,37,0.4)' : undefined,
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={box.image}
                      alt={box.name}
                      fill
                      sizes="(max-width: 768px) 82vw, 33vw"
                      className="gift-img object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(31,48,37,0.28), transparent 55%)' }}
                    />
                    {box.tag && (
                      <div className="absolute left-3 top-3">
                        <Badge>{box.tag}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
                    <h3 className="font-display text-xl leading-tight">{box.name}</h3>
                    <ul className="space-y-2">
                      {features(box.description).map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-[13px] leading-5 text-[var(--fg-muted)]">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--accent)]" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <p className="gold-text font-display text-2xl tabular-nums">{formatINR(box.price)}</p>
                      <a
                        href={enquiry}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Enquire about ${box.name} on WhatsApp`}
                        className="inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[11px] font-medium uppercase tracking-[0.2em] transition duration-300 active:scale-[0.96]"
                        style={
                          featured
                            ? { background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }
                            : { borderColor: 'var(--border-strong)' }
                        }
                      >
                        Enquire
                        <svg
                          width="14"
                          height="14"
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
                </article>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.28em] text-[var(--fg-faint)] md:hidden">
          Swipe to see more
        </p>
      </div>
    </section>
  );
}