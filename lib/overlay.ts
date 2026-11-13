let locks = 0;
let saved = { html: '', body: '', pad: '' };

/** Counter-based scroll lock (safe if two overlays overlap). Works on iOS and compensates the desktop scrollbar. */
export function lockScroll() {
  if (typeof document === 'undefined') return;
  if (locks++ > 0) return;
  const html = document.documentElement;
  const body = document.body;
  const sbw = window.innerWidth - html.clientWidth;
  saved = { html: html.style.overflow, body: body.style.overflow, pad: body.style.paddingRight };
  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  if (sbw > 0) body.style.paddingRight = `${sbw}px`;
}

export function unlockScroll() {
  if (typeof document === 'undefined' || locks === 0) return;
  if (--locks > 0) return;
  const html = document.documentElement;
  const body = document.body;
  html.style.overflow = saved.html;
  body.style.overflow = saved.body;
  body.style.paddingRight = saved.pad;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Keep Tab / Shift+Tab inside `container`. Reads the real focused element (no React state). */
export function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return;
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (!nodes.length) {
    e.preventDefault();
    container.focus();
    return;
  }
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === container)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}