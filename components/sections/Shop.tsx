'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '@/lib/supabase';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSheet } from '@/components/product/ProductSheet';
import { Chip } from '@/components/ui/chip';
import { SHOP_FILTERS, SORT_OPTIONS } from '@/lib/config';

type ShopProps = { products: Product[] };

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const LEAVE_MS = 180;

const FILTER_TO_CATEGORY: Record<string, string> = {
  Birthday: 'birthday',
  Chocolate: 'chocolate',
  'Fruit & Cream': 'fruit-cream',
  'Cupcakes & Jars': 'cupcakes',
};

function matchesFilter(p: Product, filter: string): boolean {
  if (filter === 'All') return true;
  if (filter === 'Eggless') return Boolean(p.eggless_available);
  const category = FILTER_TO_CATEGORY[filter];
  return category ? p.category === category : true;
}

const minPrice = (p: Product) =>
  p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : Number.POSITIVE_INFINITY;

const STYLES = `
.shop-grid{transition:opacity ${LEAVE_MS}ms ease,transform ${LEAVE_MS}ms ease}
.shop-grid[data-leaving="true"]{opacity:0;transform:translate3d(0,8px,0)}
.shop-card{transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}
.shop-grid.is-armed .shop-card:not(.is-in){opacity:0;transform:translate3d(0,26px,0) scale(.97)}
@media (prefers-reduced-motion:reduce){
  .shop-grid,.shop-card{transition:none!important}
  .shop-grid[data-leaving="true"]{opacity:1;transform:none}
  .shop-grid.is-armed .shop-card:not(.is-in){opacity:1;transform:none}
}
`;

export function Shop({ products }: ShopProps) {
  // What the chips / select show (updates instantly)
  const [filter, setFilter] = useState<string>('All');
  const [sort, setSort] = useState<string>('featured');
  // What the grid shows (updates after the short fade-out)
  const [view, setView] = useState({ filter: 'All', sort: 'featured' });
  const [leaving, setLeaving] = useState(false);

  const [selected, setSelected] = useState<Product | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);

  /* ---- External filter control: URL ?filter= and the "set-filter" event ---- */
  useEffect(() => {
    const onSetFilter = (e: Event) => {
      const detail = (e as CustomEvent).detail as string | null;
      if (detail) setFilter(detail);
    };
    window.addEventListener('set-filter', onSetFilter);

    const urlFilter = new URLSearchParams(window.location.search).get('filter');
    if (urlFilter) {
      setFilter(urlFilter);
      setView((v) => ({ ...v, filter: urlFilter })); // no fade on first load
    }
    return () => window.removeEventListener('set-filter', onSetFilter);
  }, []);

  /* ---- Fade out → swap content. Last change wins, so rapid taps are safe. ---- */
  useEffect(() => {
    if (filter === view.filter && sort === view.sort) {
      setLeaving(false);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLeaving(!reduce);
    const t = window.setTimeout(
      () => {
        setView({ filter, sort });
        setLeaving(false);
      },
      reduce ? 0 : LEAVE_MS
    );
    return () => window.clearTimeout(t);
  }, [filter, sort, view]);

  /* ---- Keep the active chip centred (also when the filter came from the hero) ---- */
  useEffect(() => {
    const row = chipsRef.current;
    if (!row) return;
    const active = row.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const left = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [filter]);

  /* ---- Derived list ---- */
  const sorted = useMemo(() => {
    const list = products.filter((p) => matchesFilter(p, view.filter));
    return list.sort((a, b) => {
      if (view.sort === 'price-asc' || view.sort === 'price-desc') {
        const pa = minPrice(a);
        const pb = minPrice(b);
        if (pa !== pb) return view.sort === 'price-asc' ? pa - pb : pb - pa;
      }
      return a.sort_order - b.sort_order;
    });
  }, [products, view]);

  /* ---- Card reveal: hidden before paint, revealed in batches as they enter view ---- */
  useIsoLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // If the user was scrolled past the top of the grid, bring them back to it
    if (didMount.current) {
      if (grid.getBoundingClientRect().top < 0) grid.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else {
      didMount.current = true;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    grid.classList.add('is-armed');
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.shop-card')).filter(
      (c) => !c.classList.contains('is-in')
    );

    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          );
        hits.forEach((entry, k) => {
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Math.min(k, 8) * 70}ms`;
          el.classList.add('is-in');
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
    );
    cards.forEach((c) => io.observe(c));

    return () => {
      io.disconnect();
      grid.classList.remove('is-armed'); // never leave cards hidden if this effect is torn down
    };
  }, [sorted]);

  const handleChoose = (product: Product) => {
    setSelected(product);
    setSheetOpen(true);
  };

  return (
    <section id="shop" className="layered-bg px-4 py-20 md:px-8 md:py-32" style={{ background: 'var(--surface-1)' }}>
      <style>{STYLES}</style>

      <div className="mx-auto max-w-content">
        <div className="accent-line" />
        <h2 className="section-heading mb-3">
          The <em className="h2-italic">Shop</em>
        </h2>
        <p className="mx-auto mb-8 max-w-md text-center text-sm leading-7 text-[var(--fg-muted)]">
          Choose your cake, your size, your message.
        </p>

        {/* Sticky filter row: solid background (no backdrop blur), one row only */}
        <div
          className="sticky top-[var(--header-height)] z-20 -mx-4 mb-5 border-y border-[var(--border)] px-4 py-3 md:static md:mx-0 md:mb-8 md:border-0 md:bg-transparent md:px-0 md:py-0"
          style={{ background: 'rgba(255,253,248,0.97)' }}
        >
          <div
            ref={chipsRef}
            className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 [-webkit-mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:[-webkit-mask-image:none] md:[mask-image:none]"
          >
            {SHOP_FILTERS.map((f) => (
              <span key={f} data-active={filter === f} className="shrink-0">
                <Chip label={f} active={filter === f} onClick={() => setFilter(f)} />
              </span>
            ))}
          </div>
        </div>

        {/* Count + sort (native select = real picker on phones) */}
        <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
          <p aria-live="polite" className="text-[11px] uppercase tracking-[0.28em] text-[var(--fg-muted)]">
            {sorted.length} {sorted.length === 1 ? 'item' : 'items'}
          </p>
          <label className="relative">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-full border border-[var(--border-strong)] bg-transparent py-2 pl-4 pr-9 text-xs font-medium text-[var(--fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>
        </div>

        {sorted.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[var(--fg-muted)]">No cakes match this filter.</p>
            <button
              type="button"
              onClick={() => setFilter('All')}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-[var(--border-strong)] px-6 text-xs font-medium uppercase tracking-[0.2em] transition active:scale-[0.97]"
            >
              View all
            </button>
          </div>
        ) : (
          <div
            key={`${view.filter}|${view.sort}`}
            ref={gridRef}
            data-leaving={leaving}
            className="shop-grid grid scroll-mt-[calc(var(--header-height)+5rem)] grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
          >
            {sorted.map((product) => (
              <div key={product.id} className="shop-card h-full">
                <ProductCard product={product} onChoose={handleChoose} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductSheet product={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </section>
  );
}