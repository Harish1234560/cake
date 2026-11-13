'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/supabase';
import { useCart } from '@/store/cart';
import { formatINR } from '@/lib/format';
import { CloseIcon, PlusIcon, MinusIcon, CheckIcon } from '@/components/ui/icons';
import { gsap, registerGsapPlugins } from '@/lib/gsap';

type ProductSheetProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

const MAX_QTY = 20;
const MAX_FILE = 5 * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/* -------------------------------------------------------------------------- */
/*  Styles: CSS handles all open/close motion (no window.innerWidth in render)  */
/* -------------------------------------------------------------------------- */
const STYLES = `
.ps-root{visibility:hidden;transition:visibility 0s linear .55s}
.ps-root[data-open="true"]{visibility:visible;transition-delay:0s}
.ps-backdrop{opacity:0;transition:opacity .4s ease}
.ps-root[data-open="true"] .ps-backdrop{opacity:1}
.ps-panel{transform:translate3d(0,calc(100% + var(--drag,0px)),0);transition:transform .55s cubic-bezier(.32,.72,0,1);will-change:transform;outline:none}
.ps-root[data-open="true"] .ps-panel{transform:translate3d(0,var(--drag,0px),0)}
.ps-panel[data-dragging="true"]{transition:none}
.ps-knob{transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.ps-opt{transition:background-color .2s ease,color .2s ease,border-color .2s ease,transform .15s ease}
.ps-opt:active{transform:scale(.97)}
@media (min-width:768px){
  .ps-panel{transform:translate3d(0,28px,0) scale(.96);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .35s ease}
  .ps-root[data-open="true"] .ps-panel{transform:none;opacity:1}
}
@media (prefers-reduced-motion:reduce){
  .ps-root,.ps-backdrop,.ps-panel,.ps-knob,.ps-opt{transition:none!important}
}
`;

const optStyle = (on: boolean): CSSProperties =>
  on
    ? { background: 'var(--fg)', color: 'var(--bg)', borderColor: 'var(--fg)' }
    : { background: 'transparent', color: 'var(--fg)', borderColor: 'var(--border-strong)' };

/* -------------------------------------------------------------------------- */
/*  Price that counts up/down. React renders it once; rAF updates the text.     */
/* -------------------------------------------------------------------------- */
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  const [initial] = useState(() => formatINR(value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || from === value) {
      el.textContent = formatINR(value);
      shown.current = value;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 380;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = t === 1 ? value : Math.round(from + (value - from) * eased);
      el.textContent = formatINR(v);
      shown.current = v;
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {initial}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="caption mb-2.5">{children}</p>;
}

/* -------------------------------------------------------------------------- */
export function ProductSheet({ product, open, onClose }: ProductSheetProps) {
  const addLine = useCart((s) => s.addLine);
  const titleId = useId();

  const [variant, setVariant] = useState(0);
  const [flavour, setFlavour] = useState<string | null>(null);
  const [eggless, setEggless] = useState(false);
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [qty, setQty] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const productRef = useRef(product);
  productRef.current = product;
  const closeTimer = useRef<number>(0);
  const lastFocus = useRef<HTMLElement | null>(null);
  const justAdded = useRef(false);
  const drag = useRef({ on: false, y0: 0, dy: 0, lastY: 0, lastT: 0, v: 0 });

  const reset = useCallback((p: Product) => {
    setVariant(0);
    setFlavour(p.flavours?.[0] ?? null);
    setEggless(false);
    setMessage('');
    setPhotoUrl('');
    setPhotoPreview('');
    setUploadError('');
    setQty(1);
    setUploading(false);
    setAdded(false);
  }, []);

  /* New product → fresh form */
  useEffect(() => {
    if (product) reset(product);
  }, [product, reset]);

  /* Revoke local preview URLs when they change / unmount */
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  /* Closed sheet: hidden + inert (keeps it out of tab order and screen readers) */
  useEffect(() => {
    rootRef.current?.toggleAttribute('inert', !open);
  }, [open, product]);

  /* Everything that only matters while open */
  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    if (backdropRef.current) backdropRef.current.style.opacity = '';
    panel?.style.setProperty('--drag', '0px');
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;

    if (justAdded.current && productRef.current) {
      reset(productRef.current);
      justAdded.current = false;
    }

    lastFocus.current = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => panel?.focus({ preventScroll: true }), 60);

    // Scroll lock with scrollbar compensation
    const html = document.documentElement;
    const body = document.body;
    const sbw = window.innerWidth - html.clientWidth;
    const prev = { h: html.style.overflow, b: body.style.overflow, p: body.style.paddingRight };
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (sbw > 0) body.style.paddingRight = `${sbw}px`;

    // Escape + focus trap
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        )
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(closeTimer.current);
      document.removeEventListener('keydown', onKey);
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
      body.style.paddingRight = prev.p;
      lastFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, reset]);

  /* ------------------------- Swipe down to close (mobile) ------------------------- */
  const onDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    if ((e.target as HTMLElement).closest('button')) return;
    const d = drag.current;
    d.on = true;
    d.y0 = e.clientY;
    d.dy = 0;
    d.lastY = e.clientY;
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
    const dy = Math.max(0, e.clientY - d.y0);
    d.v = (e.clientY - d.lastY) / Math.max(1, now - d.lastT);
    d.lastY = e.clientY;
    d.lastT = now;
    d.dy = dy;
    panel.style.setProperty('--drag', `${dy}px`);
    if (backdropRef.current) {
      backdropRef.current.style.opacity = String(Math.max(0, 1 - dy / (panel.offsetHeight || 600)));
    }
  };

  const onDragEnd = (cancelled: boolean) => {
    const d = drag.current;
    const panel = panelRef.current;
    if (!d.on || !panel) return;
    d.on = false;
    panel.removeAttribute('data-dragging');
    if (!cancelled && (d.dy > 120 || d.v > 0.7)) {
      // keep --drag so the panel slides on from where the finger left it
      if (backdropRef.current) backdropRef.current.style.opacity = '0';
      onCloseRef.current();
    } else {
      panel.style.setProperty('--drag', '0px');
      if (backdropRef.current) backdropRef.current.style.opacity = '';
    }
  };

  /* ------------------------------- Photo upload ------------------------------- */
  const handlePhotoUpload = async (file: File) => {
    setUploadError('');
    if (file.size > MAX_FILE) {
      setUploadError('File too large. Maximum 5 MB.');
      return;
    }
    if (!VALID_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, and WebP files are allowed.');
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUrl('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setPhotoPreview('');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview('');
    setUploadError('');
  };

  /* ------------------------------- Fly to bag ------------------------------- */
  const flyToBag = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const btn = addBtnRef.current;
    const bag = document.querySelector('[aria-label^="Bag"]') as HTMLElement | null;
    if (!btn || !bag) return;
    registerGsapPlugins();

    const b = btn.getBoundingClientRect();
    const t = bag.getBoundingClientRect();
    const startX = b.left + b.width / 2 - 7;
    const startY = b.top + b.height / 2 - 7;
    const dx = t.left + t.width / 2 - 7 - startX;
    const dy = t.top + t.height / 2 - 7 - startY;

    const dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;left:0;top:0;width:14px;height:14px;border-radius:50%;background:var(--accent);z-index:9999;pointer-events:none;will-change:transform;box-shadow:0 6px 14px -4px rgba(31,48,37,.5)';
    document.body.appendChild(dot);
    gsap.set(dot, { x: startX, y: startY });
    // different eases per axis = a curved path
    gsap.to(dot, { x: startX + dx, duration: 0.75, ease: 'power1.inOut' });
    gsap.to(dot, {
      y: startY + dy,
      scale: 0.5,
      duration: 0.75,
      ease: 'power2.in',
      onComplete: () => {
        dot.remove();
        gsap.fromTo(bag, { scale: 1.28 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)' });
      },
    });
  };

  /* -------------------------------- Add to bag -------------------------------- */
  const handleAdd = () => {
    if (!product) return;
    const current = product.variants?.[variant];
    if (!current || added || uploading) return;

    addLine({
      productId: product.id,
      name: product.name,
      image: product.base_image_url,
      variantLabel: current.label,
      unitPrice: current.price,
      flavour: flavour ?? null,
      eggless,
      messageOnCake: message || null,
      referencePhotoUrl: photoUrl || null,
      qty,
    });

    flyToBag();
    setAdded(true);
    justAdded.current = true;
    if ('vibrate' in navigator) navigator.vibrate(12);
    closeTimer.current = window.setTimeout(() => onCloseRef.current(), 700);
  };

  if (!product) return null;

  const variants = product.variants ?? [];
  const current = variants[variant];
  const unitPrice = current?.price ?? 0;
  const egglessPrice = product.eggless_extra_price ?? 0;
  const lineTotal = (unitPrice + (eggless ? egglessPrice : 0)) * qty;
  const shownPhoto = photoPreview || photoUrl;

  return (
    <div
      ref={rootRef}
      data-open={open}
      className="ps-root fixed inset-0 z-[100] flex items-end justify-center md:items-center"
    >
      <style>{STYLES}</style>

      {/* Solid backdrop: no backdrop-filter (expensive on phones) */}
      <div
        ref={backdropRef}
        className="ps-backdrop absolute inset-0"
        style={{ background: 'rgba(31,48,37,0.55)', touchAction: 'none' }}
        onClick={() => onCloseRef.current()}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="ps-panel relative z-10 flex w-full flex-col overflow-hidden rounded-t-[28px] md:w-[620px] md:rounded-[28px]"
        style={{
          maxHeight: '92dvh',
          background: 'var(--bg)',
          boxShadow: '0 -20px 60px -20px rgba(31,48,37,0.35)',
        }}
      >
        {/* ---------------- Header = drag zone ---------------- */}
        <div
          className="shrink-0 border-b"
          style={{ borderColor: 'var(--border)', touchAction: 'none' }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={() => onDragEnd(false)}
          onPointerCancel={() => onDragEnd(true)}
        >
          <div className="flex justify-center pt-2.5 md:hidden">
            <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
          </div>
          <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-2 md:py-4">
            <h2 id={titleId} className="font-display text-xl leading-tight md:text-2xl">
              {product.name}
            </h2>
            <button
              type="button"
              onClick={() => onCloseRef.current()}
              aria-label="Close"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition active:scale-95"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ---------------- Scrolling content ---------------- */}
        <div
          ref={scrollerRef}
          data-lenis-prevent
          className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="space-y-6 p-5">
            <div
              className="relative aspect-[16/11] overflow-hidden rounded-2xl border md:aspect-[16/9]"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
            >
              <Image
                src={product.base_image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 620px"
                className="object-cover"
              />
            </div>

            {product.description && (
              <p className="text-[15px] leading-7 text-[var(--fg-muted)]">{product.description}</p>
            )}

            {/* Size */}
            {variants.length > 0 && (
              <div>
                <SectionLabel>Size</SectionLabel>
                <div role="radiogroup" aria-label="Size" className="grid grid-cols-2 gap-2.5">
                  {variants.map((v, i) => (
                    <button
                      key={v.label}
                      type="button"
                      role="radio"
                      aria-checked={variant === i}
                      onClick={() => setVariant(i)}
                      className="ps-opt rounded-2xl border px-4 py-3 text-left"
                      style={optStyle(variant === i)}
                    >
                      <span className="block text-sm font-medium">{v.label}</span>
                      <span className="mt-0.5 block text-xs tabular-nums opacity-70">{formatINR(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavour */}
            {product.flavours && product.flavours.length > 0 && (
              <div>
                <SectionLabel>Flavour</SectionLabel>
                <div role="radiogroup" aria-label="Flavour" className="flex flex-wrap gap-2">
                  {product.flavours.map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="radio"
                      aria-checked={flavour === f}
                      onClick={() => setFlavour(f)}
                      className="ps-opt min-h-[44px] rounded-full border px-5 text-[13px] font-medium"
                      style={optStyle(flavour === f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Eggless */}
            {product.eggless_available && (
              <button
                type="button"
                role="switch"
                aria-checked={eggless}
                onClick={() => setEggless((v) => !v)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99]"
                style={{ borderColor: eggless ? 'var(--accent)' : 'var(--border-strong)' }}
              >
                <span>
                  <span className="block text-sm font-medium">Make it eggless</span>
                  <span className="mt-0.5 block text-xs text-[var(--fg-muted)]">
                    {egglessPrice > 0 ? `+${formatINR(egglessPrice)}` : 'No extra charge'}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300"
                  style={{ background: eggless ? 'var(--accent)' : 'rgba(31,48,37,0.2)' }}
                >
                  <span
                    className="ps-knob absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                    style={{ transform: eggless ? 'translate3d(20px,0,0)' : 'translate3d(0,0,0)' }}
                  />
                </span>
              </button>
            )}

            {/* Message */}
            {product.allows_message && (
              <div>
                <label htmlFor={`${titleId}-msg`} className="caption mb-2.5 block">
                  Message on cake <span className="opacity-60">(max 30 characters)</span>
                </label>
                <div className="relative">
                  <input
                    id={`${titleId}-msg`}
                    type="text"
                    maxLength={30}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onFocus={(e) => {
                      const el = e.currentTarget;
                      window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
                    }}
                    placeholder="Happy Birthday, Ananya!"
                    autoComplete="off"
                    autoCapitalize="sentences"
                    enterKeyHint="done"
                    className="input-field w-full pr-14 text-[16px]"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs tabular-nums text-[var(--fg-faint)]">
                    {message.length}/30
                  </span>
                </div>
              </div>
            )}

            {/* Reference photo */}
            {product.allows_photo && (
              <div>
                <SectionLabel>
                  Reference photo <span className="opacity-60">(optional, max 5 MB)</span>
                </SectionLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = ''; // lets the same file be picked again
                    if (file) handlePhotoUpload(file);
                  }}
                />
                {shownPhoto ? (
                  <div
                    className="flex items-center gap-4 rounded-2xl border p-3"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shownPhoto} alt="Your reference" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        {uploading ? (
                          'Uploading…'
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" /> Photo added
                          </>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={removePhoto}
                        disabled={uploading}
                        className="mt-1 text-xs text-[var(--fg-muted)] underline underline-offset-4 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-dashed text-sm font-medium transition active:scale-[0.99]"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                    Upload a photo
                  </button>
                )}
                {uploadError && (
                  <p role="alert" className="mt-2 text-xs" style={{ color: '#c0392b' }}>
                    {uploadError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---------------- Sticky footer: quantity + Add ---------------- */}
        <div
          className="shrink-0 border-t px-5 pt-3.5"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg)',
            paddingBottom: 'calc(0.875rem + env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 shrink-0 items-center rounded-full border"
              style={{ borderColor: 'var(--border-strong)' }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
                className="flex h-12 w-11 items-center justify-center rounded-l-full transition active:scale-90 disabled:opacity-30"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span aria-live="polite" className="w-7 text-center font-display text-lg tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
                disabled={qty >= MAX_QTY}
                aria-label="Increase quantity"
                className="flex h-12 w-11 items-center justify-center rounded-r-full transition active:scale-90 disabled:opacity-30"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              ref={addBtnRef}
              data-add-btn
              type="button"
              onClick={handleAdd}
              disabled={added || uploading || !current}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition duration-300 active:scale-[0.98] disabled:cursor-not-allowed"
              style={{
                background: added ? 'var(--accent)' : 'var(--fg)',
                color: 'var(--bg)',
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {added ? (
                <>
                  <CheckIcon className="h-4 w-4" /> Added
                </>
              ) : uploading ? (
                'Uploading photo…'
              ) : (
                <>
                  Add to Bag
                  <span className="opacity-40">·</span>
                  <AnimatedPrice value={lineTotal} className="tabular-nums" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}