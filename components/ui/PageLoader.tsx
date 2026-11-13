'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { SHOP } from '@/lib/config';

const SEEN_KEY = 'mg:intro';
const WORDS = SHOP.name.split(' ');

/* Timeline: 0–1.0s wordmark + progress line, 1.0s fade, 1.05–1.8s panels part. */
const STYLES = `
@keyframes plRoot{
  0%{visibility:visible;pointer-events:auto}
  58%{pointer-events:auto}
  59%{pointer-events:none}
  99.9%{visibility:visible}
  100%{visibility:hidden;pointer-events:none}
}
@keyframes plLetter{from{transform:translate3d(0,112%,0)}to{transform:translate3d(0,0,0)}}
@keyframes plLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes plCap{from{opacity:0}to{opacity:.6}}
@keyframes plFade{to{opacity:0}}
@keyframes plTop{to{transform:translate3d(0,-100%,0)}}
@keyframes plBot{to{transform:translate3d(0,100%,0)}}

.pl{position:fixed;inset:0;z-index:500;visibility:visible;animation:plRoot 1.85s linear forwards}
.pl-top,.pl-bot{position:absolute;left:0;right:0;height:50.3%;background:#1f3025;will-change:transform}
.pl-top{top:0;animation:plTop .75s cubic-bezier(.76,0,.24,1) 1.05s forwards}
.pl-bot{bottom:0;animation:plBot .75s cubic-bezier(.76,0,.24,1) 1.05s forwards}

.pl-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:0 20px;color:rgba(255,253,248,.96);animation:plFade .3s ease .95s forwards}
.pl-cap{font-size:10px;font-weight:500;letter-spacing:.36em;text-transform:uppercase;opacity:0;animation:plCap .6s ease .15s forwards}
.pl-mark{display:flex;gap:.45em;font-size:clamp(1.55rem,7.4vw,3rem);font-weight:300;letter-spacing:.08em;text-transform:uppercase;line-height:1}
.pl-word{display:inline-flex;overflow:hidden;padding-bottom:.14em}
.pl-letter{display:inline-block;transform:translate3d(0,112%,0);animation:plLetter .7s cubic-bezier(.16,1,.3,1) calc(.1s + var(--i,0) * 28ms) forwards}
.pl-track{width:min(180px,46vw);height:1px;overflow:hidden;background:rgba(255,253,248,.18)}
.pl-fill{height:100%;transform-origin:left;transform:scaleX(0);background:var(--accent,#F04425);animation:plLine .85s cubic-bezier(.65,0,.35,1) .1s forwards}

html.pl-skip .pl{display:none}
@media (prefers-reduced-motion:reduce){.pl{display:none}}
`;

export function PageLoader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      /* storage blocked: treat as first visit */
    }
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const finish = () => {
      try {
        window.sessionStorage.setItem(SEEN_KEY, '1'); // written at the END, so Strict Mode's double effect is harmless
      } catch {
        /* ignore */
      }
      setDone(true);
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === root && e.animationName === 'plRoot') finish();
    };
    root.addEventListener('animationend', onEnd);
    const safety = window.setTimeout(finish, 3000); // never leave the overlay mounted

    return () => {
      root.removeEventListener('animationend', onEnd);
      window.clearTimeout(safety);
    };
  }, []);

  if (done) return null;

  let n = 0;
  return (
    <div ref={rootRef} className="pl" aria-hidden="true">
      <style>{STYLES}</style>

      <div className="pl-top" />
      <div className="pl-bot" />

      <div className="pl-center">
        <p className="pl-cap">Mumbai</p>
        <div className="pl-mark font-display">
          {WORDS.map((word, wi) => (
            <span key={wi} className="pl-word">
              {word.split('').map((ch) => {
                const i = n++;
                return (
                  <span key={i} className="pl-letter" style={{ '--i': i } as CSSProperties}>
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
        <div className="pl-track">
          <div className="pl-fill" />
        </div>
      </div>
    </div>
  );
}