'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart, cartLineTotal } from '@/store/cart';
import { formatINR } from '@/lib/format';
import { SHOP, deliveryFeeFor } from '@/lib/config';
import {
  CloseIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@/components/ui/icons';
import { lockScroll, unlockScroll, trapFocus } from '@/lib/overlay';
import { useAnchorNav } from '@/hooks/useAnchorNav';
import { useMounted } from '@/hooks/useMounted';

const MAX_QTY = 20;

const STYLES = `
.bd{visibility:hidden;transition:visibility 0s linear .55s}
.bd[data-open="true"]{visibility:visible;transition-delay:0s}
.bd-bg{opacity:0;transition:opacity .4s ease}
.bd[data-open="true"] .bd-bg{opacity:1}
.bd-panel{transform:translate3d(calc(100% + var(--dx,0px)),0,0);transition:transform .55s cubic-bezier(.32,.72,0,1);will-change:transform;outline:none}
.bd[data-open="true"] .bd-panel{transform:translate3d(var(--dx,0px),0,0)}
.bd-panel[data-dragging="true"]{transition:none}
@keyframes bdIn{from{opacity:0;transform:translate3d(28px,0,0)}to{opacity:1;transform:none}}
.bd[data-open="true"] .bd-item{animation:bdIn .6s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(160ms + var(--i,0) * 70ms)}
.bd-bar{transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.bd-step{transition:transform .15s ease,background-color .2s ease}
.bd-step:active{transform:scale(.88)}
@media (prefers-reduced-motion:reduce){
  .bd,.bd-bg,.bd-panel,.bd-bar,.bd-step{transition:none!important}
  .bd[data-open="true"] .bd-item{animation:none}
}
`;

const idx = (i: number) => ({ '--i': i }) as CSSProperties;

export function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  const rawLines = useCart((s) => s.lines);
  const rawSubtotal = useCart((s) => s.subtotal());
  const updateQty = useCart((s) => s.updateQty);
  const removeLine = useCart((s) => s.removeLine);
  const { onNav } = useAnchorNav();

  // Cart comes from storage: render it only after hydration so server and client HTML match
  const lines = mounted ? rawLines : [];
  const subtotal = mounted ? rawSubtotal : 0;

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const drag = useRef({ on: false, x0: 0, dx: 0, lastX: 0, lastT: 0, v: 0 });

  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', !open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.style.setProperty('--dx', '0px');
    if (backdropRef.current) backdropRef.current.style.opacity = '';

    lockScroll();
    const prevFocus = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => panel?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      trapFocus(e, panel);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

  /* ----------------------- Swipe right to close (touch) ----------------------- */
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button')) return;
    const d = drag.current;
    d.on = true;
    d.x0 = e.clientX;
    d.dx = 0;
    d.lastX = e.clientX;
    d.lastT = performance.now();
    d.v = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    panelRef.current?.setAttribute('data-dragging', 'true');
  };

  const onDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d.on || !panel) return;
    const now = performance.now();
    const dx = Math.max(0, e.clientX - d.x0);
    d.v = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    d.dx = dx;
    panel.style.setProperty('--dx', `${dx}px`);
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(Math.max(0, 1 - dx / (panel.offsetWidth || 400)));
    }
  };

  const onDragEnd = (cancelled: boolean) => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d.on || !panel) return;
    d.on = false;
    panel.removeAttribute('data-dragging');
    if (!cancelled && (d.dx > 110 || d.v > 0.6)) {
      if (backdropRef.current) backdropRef.current.style.opacity = '0';
      onCloseRef.current();
    } else {
      panel.style.setProperty('--dx', '0px');
      if (backdropRef.current) backdropRef.current.style.opacity = '';
    }
  };

  /* --------------------------------- Totals --------------------------------- */
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;
  const remaining = Math.max(0, SHOP.freeDeliveryAbove - subtotal);
  const progress = Math.min(1, subtotal / SHOP.freeDeliveryAbove);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <div ref={rootRef} data-open={open} className="bd fixed inset-0 z-[100]">
      <style>{STYLES}</style>

      {/* Solid backdrop: no backdrop-filter (expensive on phones) */}
      <div
        ref={backdropRef}
        className="bd-bg absolute inset-0"
        style={{ background: 'rgba(31,48,37,0.55)' }}
        onClick={() => onCloseRef.current()}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className="bd-panel absolute right-0 top-0 flex h-[100dvh] w-[calc(100%-40px)] max-w-[440px] flex-col border-l"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        {/* Header = swipe zone */}
        <div
          className="flex shrink-0 items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border)', touchAction: 'pan-y' }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={() => onDragEnd(false)}
          onPointerCancel={() => onDragEnd(true)}
        >
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl leading-none">Your Bag</h2>
            {itemCount > 0 && (
              <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <svg
              width="84"
              height="84"
              viewBox="0 0 80 80"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              opacity="0.7"
            >
              <path d="M20 20 15 28v38a6 6 0 0 0 6 6h38a6 6 0 0 0 6-6V28l-5-8Z" />
              <path d="M15 28h50" />
              <path d="M50 38a10 10 0 0 1-20 0" />
            </svg>
            <div className="space-y-1.5">
              <p className="font-display text-2xl">Your bag is empty</p>
              <p className="text-sm text-[var(--fg-muted)]">Every cake starts with a choice.</p>
            </div>
            <Link
              href="/#shop"
              onClick={(e) => {
                onNav(e, '/#shop', 350);
                onClose();
              }}
              className="inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-medium transition active:scale-[0.97]"
              style={{ background: 'var(--fg)', color: 'var(--bg)' }}
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div
              data-lenis-prevent
              className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 pt-4"
            >
              {/* Free delivery progress (transform, not width) */}
              <div className="mb-2 rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
                {remaining > 0 ? (
                  <p className="text-[13px] leading-5">
                    Add <span className="font-medium tabular-nums">{formatINR(remaining)}</span> more for free delivery
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-[13px] font-medium leading-5" style={{ color: '#2f7d4a' }}>
                    <CheckIcon className="h-4 w-4" /> You&apos;ve unlocked free delivery
                  </p>
                )}
                <div className="mt-3 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(31,48,37,0.12)' }}>
                  <div
                    className="bd-bar h-full origin-left rounded-full"
                    style={{ background: 'var(--accent)', transform: `scaleX(${progress})` }}
                  />
                </div>
              </div>

              <ul className="divide-y divide-[var(--border)]">
                {lines.map((line, i) => (
                  <li key={line.lineId} className="bd-item flex gap-4 py-5" style={idx(i)}>
                    <div
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
                    >
                      <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-base leading-tight">{line.name}</p>
                        <p className="shrink-0 font-display text-base tabular-nums">{formatINR(cartLineTotal(line))}</p>
                      </div>

                      <p className="mt-1 text-xs text-[var(--fg-muted)]">
                        {[line.variantLabel, line.flavour].filter(Boolean).join(' · ')}
                      </p>
                      {line.eggless && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#4f8a5b' }} /> Eggless
                        </p>
                      )}
                      {line.messageOnCake && (
                        <p className="mt-0.5 line-clamp-2 text-xs italic text-[var(--fg-muted)]">
                          “{line.messageOnCake}”
                        </p>
                      )}
                      {line.referencePhotoUrl && (
                        <p className="mt-0.5 text-[11px] text-[var(--fg-muted)]">Reference photo attached</p>
                      )}

                      <div className="mt-auto pt-3">
                        <div
                          className="inline-flex h-10 items-center rounded-full border"
                          style={{ borderColor: 'var(--border-strong)' }}
                        >
                          {line.qty <= 1 ? (
                            <button
                              type="button"
                              onClick={() => removeLine(line.lineId)}
                              aria-label={`Remove ${line.name}`}
                              className="bd-step flex h-10 w-10 items-center justify-center rounded-l-full"
                              style={{ color: 'var(--rose, #c0392b)' }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateQty(line.lineId, line.qty - 1)}
                              aria-label="Decrease quantity"
                              className="bd-step flex h-10 w-10 items-center justify-center rounded-l-full"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                          )}
                          <span aria-live="polite" className="w-6 text-center text-sm tabular-nums">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(line.lineId, Math.min(MAX_QTY, line.qty + 1))}
                            disabled={line.qty >= MAX_QTY}
                            aria-label="Increase quantity"
                            className="bd-step flex h-10 w-10 items-center justify-center rounded-r-full disabled:opacity-30"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sticky summary */}
            <div
              className="shrink-0 space-y-2.5 border-t px-5 pt-4"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg)',
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Subtotal</span>
                <span className="tabular-nums">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--fg-muted)]">Delivery</span>
                <span className="tabular-nums">{deliveryFee === 0 ? 'Free' : formatINR(deliveryFee)}</span>
              </div>
              <div
                className="flex items-baseline justify-between border-t pt-3 font-display text-xl"
                style={{ borderColor: 'var(--border)' }}
              >
                <span>Total</span>
                <span className="tabular-nums">{formatINR(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={onClose}
                className="mt-1 flex h-14 w-full items-center justify-center gap-3 rounded-full text-sm font-medium transition duration-300 active:scale-[0.985]"
                style={{ background: 'var(--fg)', color: 'var(--bg)' }}
              >
                Proceed to Checkout <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}