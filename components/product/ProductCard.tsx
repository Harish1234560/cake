'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';
import { formatINR } from '@/lib/format';
import { HeartIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  onChoose: (product: Product) => void;
};

/* -------------------------------------------------------------------------- */
/*  Favourites: stored on this device only (localStorage)                      */
/* -------------------------------------------------------------------------- */
const FAV_KEY = 'mg:favourites';

function readFavs(): string[] {
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function useFavourite(id: string) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(readFavs().includes(id));
  }, [id]);

  const toggle = useCallback(() => {
    const next = !fav;
    setFav(next);
    try {
      const set = new Set(readFavs());
      if (next) set.add(id);
      else set.delete(id);
      window.localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
    } catch {
      /* storage blocked (private mode): the heart still toggles for this visit */
    }
    if (next && typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
  }, [fav, id]);

  return [fav, toggle] as const;
}

/* -------------------------------------------------------------------------- */
/*  Styles: CSS only. Hover effects only on devices that really hover.          */
/* -------------------------------------------------------------------------- */
const STYLES = `
@keyframes pcPop{0%{transform:scale(1)}40%{transform:scale(1.32)}100%{transform:scale(1)}}
.pc{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .45s ease,border-color .45s ease;-webkit-tap-highlight-color:transparent}
.pc:has(.pc-main:active){transform:scale(.985)}
.pc-img{transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.pc-quick{opacity:0;transform:translate3d(-50%,14px,0);transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.pc-add svg{transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.pc-fav[data-on="true"] .pc-heart{animation:pcPop .45s ease}
@media (hover:hover) and (pointer:fine){
  .pc:hover{transform:translate3d(0,-4px,0);box-shadow:0 24px 40px -24px rgba(31,48,37,.35);border-color:var(--border-strong)}
  .pc:hover .pc-img{transform:scale(1.06)}
  .pc:hover .pc-quick{opacity:1;transform:translate3d(-50%,0,0)}
  .pc:hover .pc-add svg{transform:rotate(90deg)}
  .pc[data-soldout="true"]:hover{transform:none;box-shadow:none;border-color:var(--border)}
  .pc[data-soldout="true"]:hover .pc-img{transform:none}
  .pc[data-soldout="true"]:hover .pc-quick{opacity:0}
}
@media (hover:none){.pc-quick{display:none}}
@media (prefers-reduced-motion:reduce){
  .pc,.pc-img,.pc-quick,.pc-add svg{transition:none}
  .pc-fav[data-on="true"] .pc-heart{animation:none}
}
`;

/* -------------------------------------------------------------------------- */
export function ProductCard({ product, onChoose }: ProductCardProps) {
  const [fav, toggleFav] = useFavourite(String(product.id));

  const prices = product.variants.map((v) => v.price);
  const minPrice = prices.length ? Math.min(...prices) : NaN;
  const hasRange = prices.length > 1;
  const inStock = Boolean(product.in_stock);

  return (
    <article
      data-soldout={!inStock}
      className="pc group relative flex h-full flex-col overflow-hidden rounded-[22px] border md:rounded-[28px]"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
    >
      <style>{STYLES}</style>

      {/* ------------------------------ Image ------------------------------ */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: 'var(--surface-1)' }}>
        <Image
          src={product.base_image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn('pc-img object-cover', !inStock && 'opacity-60')}
        />

        {/* soft ink fade at the bottom (matches your green theme, replaces the old black overlay) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
          style={{ background: 'linear-gradient(to top, rgba(31,48,37,0.22), transparent)' }}
        />

        {product.tag && (
          <span
            className="absolute left-2.5 top-2.5 max-w-[62%] truncate rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] md:left-3 md:top-3 md:px-3 md:text-[10px]"
            style={{
              borderColor: 'var(--border-strong)',
              background: 'rgba(255,253,248,0.94)',
              color: 'var(--accent-bright)',
            }}
          >
            {product.tag}
          </span>
        )}

        {/* 44px touch target, 36px visual */}
        <button
          type="button"
          onClick={toggleFav}
          data-on={fav}
          aria-pressed={fav}
          aria-label={fav ? `Remove ${product.name} from favourites` : `Add ${product.name} to favourites`}
          className="pc-fav absolute right-0.5 top-0.5 z-10 flex h-11 w-11 items-center justify-center md:right-1 md:top-1"
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300"
            style={{
              background: 'rgba(255,253,248,0.94)',
              borderColor: 'var(--border)',
              color: fav ? 'var(--accent)' : 'var(--fg)',
            }}
          >
            <HeartIcon className={cn('pc-heart h-4 w-4', fav && 'fill-current')} />
          </span>
        </button>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,253,248,0.5)' }}>
            <span
              className="rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--fg)]"
              style={{ borderColor: 'var(--border-strong)', background: 'rgba(255,253,248,0.95)' }}
            >
              Sold out
            </span>
          </div>
        )}

        {/* Desktop-only hover pill. Not interactive itself; the stretched button below handles the click. */}
        {inStock && (
          <span
            aria-hidden="true"
            className="pc-quick absolute bottom-3 left-1/2 rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] shadow-[0_10px_24px_-10px_rgba(31,48,37,0.5)]"
            style={{ background: 'var(--bg)', color: 'var(--fg)' }}
          >
            Quick add
          </span>
        )}
      </div>

      {/* ------------------------------ Details ------------------------------ */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5 md:gap-2 md:p-5">
        <h3 className="font-display text-[17px] leading-tight md:text-xl">
          {/* Stretched button: the whole card is the tap target, the heart sits above it (z-10). */}
          <button
            type="button"
            disabled={!inStock}
            onClick={() => onChoose(product)}
            className="pc-main text-left after:absolute after:inset-0 after:rounded-[22px] after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--accent)] disabled:cursor-not-allowed md:after:rounded-[28px]"
          >
            {product.name}
          </button>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-[11px] leading-[1.55] text-[var(--fg-muted)] md:text-xs md:leading-5">
            {product.description}
          </p>
        )}

        {product.eggless_available && (
          <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[var(--fg-muted)] md:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4f8a5b' }} />
            Eggless option
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {hasRange && (
              <span className="block text-[9px] uppercase tracking-[0.22em] text-[var(--fg-muted)] md:text-[10px]">
                From
              </span>
            )}
            <span className="gold-text block font-display text-[17px] tabular-nums md:text-xl">
              {Number.isFinite(minPrice) ? formatINR(minPrice) : '—'}
            </span>
          </div>

          {inStock ? (
            <span
              aria-hidden="true"
              className="pc-add flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11"
              style={{ background: 'var(--fg)', color: 'var(--bg)' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--fg-muted)] md:text-[10px]">Sold out</span>
          )}
        </div>
      </div>
    </article>
  );
}