'use client';

import { useEffect, useRef, useState } from 'react';
import { SHOP, OCCASIONS, isPincodeServed } from '@/lib/config';
import { Field } from '@/components/ui/field';
import { WhatsAppIcon, MapPinIcon, ClockIcon, CheckIcon } from '@/components/ui/icons';
import { buildWhatsAppUrl } from '@/lib/order-text';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { Reveal } from '@/components/ui/reveal';

const STYLES = `
@keyframes ctDraw{to{stroke-dashoffset:0}}
@keyframes ctPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.ct-ring{stroke-dasharray:1;stroke-dashoffset:1;animation:ctDraw .7s ease-out forwards}
.ct-tick{stroke-dasharray:1;stroke-dashoffset:1;animation:ctDraw .5s ease-out .55s forwards}
.ct-pop{animation:ctPop .6s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){
  .ct-ring,.ct-tick{animation:none;stroke-dashoffset:0}
  .ct-pop{animation:none}
}
`;

const prettyPhone = (p: string) =>
  p.length === 12 ? `+${p.slice(0, 2)} ${p.slice(2, 7)} ${p.slice(7)}` : `+${p}`;

type InfoItem = {
  icon: typeof MapPinIcon;
  title: string;
  lines: string[];
  chips?: readonly string[];
};

const INFO: InfoItem[] = [
  {
    icon: MapPinIcon,
    title: 'Delivery area',
    lines: [SHOP.area, `Fee ₹${SHOP.deliveryFee} · Free above ₹${SHOP.freeDeliveryAbove}`],
    chips: SHOP.pincodes,
  },
  {
    icon: ClockIcon,
    title: 'Notice & hours',
    lines: [
      `Ready cakes: ${SHOP.minNoticeNormal}h notice`,
      `Custom cakes: ${SHOP.minNoticeCustom}h notice`,
      `Same-day cutoff: ${SHOP.sameDayCutoff}`,
      `Open ${SHOP.hours}`,
    ],
  },
];

/* ------------------------------- Pincode check ------------------------------- */
function PincodeCheck() {
  const [pin, setPin] = useState('');
  const complete = pin.length === 6;
  const served = complete && isPincodeServed(pin);

  return (
    <div
      className="rounded-[24px] border p-5"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
    >
      <label htmlFor="pincode-check" className="caption mb-3 block">
        Do we deliver to you?
      </label>
      <input
        id="pincode-check"
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter your 6-digit pincode"
        className="input-field w-full text-[16px]"
      />
      <div aria-live="polite" className="min-h-[1.5rem] pt-3">
        {complete && (
          <p
            className="flex items-start gap-2 text-sm"
            style={{ color: served ? '#2f7d4a' : 'var(--fg-muted)' }}
          >
            {served ? (
              <>
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Yes, we deliver to {pin}.
              </>
            ) : (
              <>We don&apos;t deliver to {pin} yet. Message us on WhatsApp and we&apos;ll see what we can do.</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Contact ---------------------------------- */
export function Contact() {
  const smoothScroll = useSmoothScroll();
  const sentRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState(''); // honeypot: real people never fill this
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [waLink, setWaLink] = useState('');

  useEffect(() => {
    if (status !== 'sent') return;
    const el = sentRef.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      if (smoothScroll) smoothScroll.scrollTo(el, { offset: -120 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    return () => window.clearTimeout(t);
  }, [status, smoothScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (trap) {
      setStatus('sent'); // bot: look successful, send nothing
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, occasion, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setStatus('sent');
      const waText = `New enquiry from ${name}\nOccasion: ${occasion}\nMessage: ${message}`;
      setWaLink(buildWhatsAppUrl(SHOP.whatsapp, waText));
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send');
    }
  };

  return (
    <section id="contact" className="px-4 py-20 md:px-8 md:py-32" style={{ background: 'var(--bg)' }}>
      <style>{STYLES}</style>

      <div className="mx-auto max-w-content">
        <Reveal>
          <div className="accent-line" />
          <h2 className="section-heading mb-3">
            Delivery &amp; <em className="h2-italic">Enquiry</em>
          </h2>
          <p className="mb-10 text-center text-sm text-[var(--fg-muted)] md:mb-14">
            We deliver across {SHOP.area}.
          </p>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
          {/* ------------------------------ Left: reach + info ------------------------------ */}
          <div className="space-y-5">
            <Reveal>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/${SHOP.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 items-center justify-center gap-3 rounded-2xl px-3 text-white transition duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ background: '#1f9d55' }}
                >
                  <WhatsAppIcon className="h-6 w-6 shrink-0" />
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-medium">WhatsApp</span>
                    <span className="block text-[11px] tabular-nums opacity-85">{prettyPhone(SHOP.whatsapp)}</span>
                  </span>
                </a>
                <a
                  href={`tel:+${SHOP.phone}`}
                  className="flex h-16 items-center justify-center gap-3 rounded-2xl border px-3 transition duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ borderColor: 'var(--border-strong)' }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                  <span className="text-left leading-tight">
                    <span className="block text-sm font-medium">Call us</span>
                    <span className="block text-[11px] tabular-nums text-[var(--fg-muted)]">
                      {prettyPhone(SHOP.phone)}
                    </span>
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <PincodeCheck />
            </Reveal>

            <Reveal delay={0.16}>
              <div
                className="divide-y divide-[var(--border)] overflow-hidden rounded-[24px] border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
              >
                {INFO.map(({ icon: Icon, title, lines, chips }) => (
                  <div key={title} className="flex gap-4 p-5">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <Icon className="h-5 w-5 text-[var(--accent)]" />
                    </span>
                    <div className="min-w-0">
                      <p className="caption">{title}</p>
                      {lines.map((line) => (
                        <p key={line} className="mt-1.5 text-sm leading-6 text-[var(--fg-muted)]">
                          {line}
                        </p>
                      ))}
                      {chips && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {chips.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border px-2.5 py-1 text-[11px] tabular-nums text-[var(--fg-muted)]"
                              style={{ borderColor: 'var(--border-strong)' }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ------------------------------ Right: form ------------------------------ */}
          <Reveal delay={0.1}>
            {status === 'sent' ? (
              <div
                ref={sentRef}
                className="space-y-4 rounded-[28px] border p-8 text-center"
                style={{ background: 'var(--surface-1)', borderColor: 'var(--border-strong)' }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ct-pop mx-auto"
                  aria-hidden="true"
                >
                  <circle className="ct-ring" cx="32" cy="32" r="28" pathLength={1} />
                  <path className="ct-tick" d="M20 33l8 8 16-17" pathLength={1} />
                </svg>
                <p className="font-display text-2xl">Thank you for your enquiry</p>
                <p className="text-sm text-[var(--fg-muted)]">We will get back to you on WhatsApp shortly.</p>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-7 text-sm font-medium transition active:scale-[0.97]"
                    style={{ background: 'var(--fg)', color: 'var(--bg)' }}
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Send on WhatsApp too
                  </a>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative space-y-4 rounded-[28px] border p-6 md:p-8"
                style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}
              >
                {/* honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                />

                <Field label="Name" required htmlFor="enquiry-name">
                  <input
                    id="enquiry-name"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="name"
                    autoCapitalize="words"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field text-[16px]"
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Phone" required htmlFor="enquiry-phone">
                  <input
                    id="enquiry-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    required
                    pattern="[6-9][0-9]{9}"
                    title="Enter a 10-digit Indian mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="input-field text-[16px]"
                    placeholder="10-digit mobile number"
                  />
                </Field>
                <Field label="Occasion" required htmlFor="enquiry-occasion">
                  <select
                    id="enquiry-occasion"
                    required
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="input-field text-[16px]"
                  >
                    <option value="">Select occasion</option>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Message" required htmlFor="enquiry-message">
                  <textarea
                    id="enquiry-message"
                    required
                    maxLength={1000}
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input-field resize-none text-[16px]"
                    placeholder="Tell us what you need — cake type, size, date, any design ideas..."
                  />
                </Field>

                {status === 'error' && (
                  <p role="alert" className="text-sm text-[var(--error)]">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-sm font-medium transition duration-300 active:scale-[0.985] disabled:opacity-70"
                  style={{ background: 'var(--fg)', color: 'var(--bg)' }}
                >
                  {status === 'sending' ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send Enquiry'
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}