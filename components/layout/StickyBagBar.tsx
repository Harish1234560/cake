'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/store/cart';
import { SHOP, deliveryFeeFor } from '@/lib/config';
import { formatINR } from '@/lib/format';
import { BagIcon, ArrowRightIcon } from '@/components/ui/icons';
import { useMounted } from '@/hooks/useMounted';

const STYLES = `
.sb{transform:translate3d(0,140%,0);opacity:0;visibility:hidden;transition:transform .55s cubic-bezier(.32,.72,0,1),opacity .35s ease,visibility 0s linear .55s}
.sb[data-show="true"]{transform:none;opacity:1;visibility:visible;transition-delay:0s}
@keyframes sbPop{0%{transform:scale(1.6)}100%{transform:scale(1)}}
.sb-pop{animation:sbPop .5s cubic-bezier(.34,1.56,.64,1)}
.sb-line{transition:transform .6s cubic-bezier(.2,.8,.2,1)}
@media (prefers-reduced-motion:reduce){.sb,.sb-line{transition:none}.sb-pop{animation:none}}
`;

export function StickyBagBar() {
  const pathname = usePathname();
  const mounted = useMounted();
  const rawCount = useCart((s) => s.count());
  const rawSubtotal = useCart((s) => s.subtotal());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200); // React ignores same-value updates
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const count = mounted ? rawCount : 0;
  const subtotal = mounted ? rawSubtotal : 0;

  if (!mounted || count === 0 || pathname === '/checkout' || pathname.startsWith('/admin')) return null;

  const total = subtotal + deliveryFeeFor(subtotal);
  const remaining = Math.max(0, SHOP.freeDeliveryAbove - subtotal);
  const progress = Math.min(1, subtotal / SHOP.freeDeliveryAbove);

  return (
    <div
      data-show={scrolled}
      className="sb pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
    >
      <style>{STYLES}</style>

      <div
        className="pointer-events-auto relative flex w-full max-w-md items-center gap-2 overflow-hidden rounded-full border p-1.5 pl-4"
        style={{
          background: 'var(--bg)',
          borderColor: 'var(--border-strong)',
          boxShadow: '0 18px 40px -16px rgba(31,48,37,0.45)',
        }}
      >
        {/* Opens the bag so the order can be reviewed */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-bag'))}
          aria-label={`View bag, ${count} ${count === 1 ? 'item' : 'items'}, total ${formatINR(total)}`}
          className="flex min-w-0 flex-1 items-center gap-3 py-1.5 text-left"
        >
          <span className="relative shrink-0">
            <BagIcon className="h-5 w-5" />
            <span
              key={count}
              className="sb-pop absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-medium tabular-nums text-white"
              style={{ background: 'var(--accent)' }}
            >
              {count}
            </span>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] text-[var(--fg-muted)]">
              {remaining > 0 ? `${formatINR(remaining)} more for free delivery` : 'Free delivery unlocked'}
            </span>
            <span className="block font-display text-base leading-tight tabular-nums">{formatINR(total)}</span>
          </span>
        </button>

        <Link
          href="/checkout"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[11px] font-medium uppercase tracking-[0.18em] transition active:scale-[0.96]"
          style={{ background: 'var(--fg)', color: 'var(--bg)' }}
        >
          Checkout <ArrowRightIcon className="h-3.5 w-3.5" />
        </Link>

        {/* free-delivery progress along the bottom edge */}
        <div
          aria-hidden="true"
          className="sb-line absolute inset-x-5 bottom-0 h-[2px] origin-left rounded-full"
          style={{ background: 'var(--accent)', transform: `scaleX(${progress})`, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}