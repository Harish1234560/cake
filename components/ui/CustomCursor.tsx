'use client';

import { useEffect, useRef, useState } from 'react';

// Set to false if you prefer to keep the normal arrow and just add the ring.
const HIDE_NATIVE_CURSOR = true;

const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="submit"]):not([type="button"]),textarea,[contenteditable="true"]';
const INTERACTIVE =
  'a[href],button:not([disabled]),[role="button"],[role="switch"],[role="radio"],summary,select,label[for]';

type Mode = 'default' | 'link' | 'card' | 'text';

const STYLES = `
.cc{position:fixed;inset:0;z-index:300;pointer-events:none;opacity:0;transition:opacity .3s ease}
.cc[data-on="true"]{opacity:1}
.cc-ring,.cc-dot{position:fixed;left:0;top:0;will-change:transform}
.cc-ring-i{position:absolute;left:0;top:0;width:34px;height:34px;transform:translate(-50%,-50%);border-radius:50%;border:1px solid rgba(31,48,37,.38);display:flex;align-items:center;justify-content:center;
  transition:width .4s cubic-bezier(.2,.8,.2,1),height .4s cubic-bezier(.2,.8,.2,1),background-color .3s ease,border-color .3s ease,opacity .25s ease,scale .25s ease}
.cc-dot-i{position:absolute;left:0;top:0;width:6px;height:6px;transform:translate(-50%,-50%);border-radius:50%;background:var(--accent,#F04425);transition:scale .3s cubic-bezier(.2,.8,.2,1),opacity .2s ease}
.cc-label{font:500 10px/1 system-ui,-apple-system,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#fffdf8;opacity:0;transition:opacity .25s ease}
.cc[data-mode="link"] .cc-ring-i{width:56px;height:56px;border-color:var(--accent,#F04425);background:rgba(240,68,37,.08)}
.cc[data-mode="link"] .cc-dot-i{scale:0}
.cc[data-mode="card"] .cc-ring-i{width:82px;height:82px;background:#1f3025;border-color:#1f3025}
.cc[data-mode="card"] .cc-dot-i{scale:0}
.cc[data-mode="card"] .cc-label{opacity:1}
.cc[data-mode="text"] .cc-ring-i,.cc[data-mode="text"] .cc-dot-i{opacity:0}
.cc[data-down="true"] .cc-ring-i{scale:.82}
html.cc-hide,html.cc-hide *{cursor:none!important}
html.cc-hide :is(${TEXT_FIELD}){cursor:text!important}
@media (prefers-reduced-motion:reduce){.cc{display:none}}
`;

function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !ring || !dot || !label) return;

    const html = document.documentElement;
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let shown = false;
    let mode: Mode = 'default';

    const setMode = (next: Mode, text = '') => {
      if (next !== mode) {
        mode = next;
        root.dataset.mode = next;
      }
      if (label.textContent !== text) label.textContent = text;
    };

    // Most specific wins: custom label > favourite heart > product card > any interactive element
    const detect = (target: Element | null) => {
      if (!target) return setMode('default');
      if (target.closest(TEXT_FIELD)) return setMode('text');

      const custom = target.closest<HTMLElement>('[data-cursor]');
      if (custom) {
        const text = custom.dataset.cursor ?? '';
        return setMode(text ? 'card' : 'link', text);
      }
      if (target.closest('.pc-fav')) return setMode('link');

      const card = target.closest('.pc');
      if (card && card.getAttribute('data-soldout') !== 'true') return setMode('card', 'Choose');

      if (target.closest(INTERACTIVE)) return setMode('link');
      setMode('default');
    };

    const loop = () => {
      raf = 0;
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
      if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px,${my}px,0)`;

      if (!shown) {
        shown = true;
        rx = mx;
        ry = my;
        ring.style.transform = `translate3d(${mx}px,${my}px,0)`;
        root.dataset.on = 'true';
        if (HIDE_NATIVE_CURSOR) html.classList.add('cc-hide');
        detect(e.target as Element | null);
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') detect(e.target as Element | null);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') root.dataset.down = 'true';
    };
    const onUp = () => {
      root.dataset.down = 'false';
    };
    const hide = () => {
      shown = false;
      root.dataset.on = 'false';
      root.dataset.down = 'false';
      html.classList.remove('cc-hide');
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    html.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      html.removeEventListener('mouseleave', hide);
      window.removeEventListener('blur', hide);
      html.classList.remove('cc-hide');
    };
  }, []);

  return (
    <div ref={rootRef} className="cc" data-on="false" data-mode="default" data-down="false" aria-hidden="true">
      <style>{STYLES}</style>
      <div ref={ringRef} className="cc-ring">
        <div className="cc-ring-i">
          <span ref={labelRef} className="cc-label" />
        </div>
      </div>
      <div ref={dotRef} className="cc-dot">
        <div className="cc-dot-i" />
      </div>
    </div>
  );
}

/** Renders only on real mouse devices without reduced motion (also reacts if the device changes, e.g. tablet + mouse). */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setEnabled(fine.matches && !calm.matches);
    sync();
    fine.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
    };
  }, []);

  return enabled ? <Cursor /> : null;
}