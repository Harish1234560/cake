'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, cartLineTotal } from '@/store/cart';
import { SHOP, DELIVERY_SLOTS, isPincodeServed, deliveryFeeFor } from '@/lib/config';
import { formatINR, getMinDeliveryDate } from '@/lib/format';
import { Field } from '@/components/ui/field';
import { buildOrderText, buildWhatsAppUrl } from '@/lib/order-text';
import { WhatsAppIcon } from '@/components/ui/icons';

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_on_delivery'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [waLink, setWaLink] = useState('');

  const maxLeadTime = useMemo(
    () => Math.max(...lines.map((l) => 6), SHOP.minNoticeNormal),
    [lines]
  );
  const minDate = getMinDeliveryDate(maxLeadTime);
  const pincodeValid = pincode.length === 6 && isPincodeServed(pincode);
  const pincodeBlocked = pincode.length === 6 && !isPincodeServed(pincode);
  const deliveryFee = deliveryFeeFor(subtotal);
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lines.length === 0) {
      setError('Your bag is empty.');
      return;
    }
    if (!pincodeValid) {
      setError('We do not deliver to this pincode.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    const items = lines.map((l) => ({
      productId: l.productId,
      name: l.name,
      image: l.image,
      variantLabel: l.variantLabel,
      unitPrice: l.unitPrice,
      flavour: l.flavour,
      eggless: l.eggless,
      messageOnCake: l.messageOnCake,
      referencePhotoUrl: l.referencePhotoUrl,
      qty: l.qty,
      lineTotal: cartLineTotal(l),
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          landmark,
          pincode,
          deliveryDate,
          timeSlot,
          notes,
          paymentMethod,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      const orderText = buildOrderText({
        order_code: data.orderCode,
        customer_name: name,
        phone,
        address,
        landmark: landmark || null,
        pincode,
        delivery_date: deliveryDate,
        time_slot: timeSlot,
        payment_method: paymentMethod,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        notes: notes || null,
      });
      setWaLink(buildWhatsAppUrl(SHOP.whatsapp, orderText));

      clear();
      router.push(`/order/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="font-display text-2xl">Your bag is empty</p>
        <a href="/" className="pill-btn pill-btn-primary">Browse Cakes</a>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-4 md:px-8">
      <div className="mx-auto max-w-content">
        <div className="accent-line" />
        <h1 className="section-heading mb-10">
          <em className="h2-italic">Checkout</em>
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" required htmlFor="co-name">
              <input id="co-name" type="text" required maxLength={100}
                value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" placeholder="Full name" />
            </Field>

            <Field label="Phone" required htmlFor="co-phone">
              <input id="co-phone" type="tel" required pattern="[6-9][0-9]{9}"
                maxLength={10} value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="input-field" placeholder="10-digit mobile" />
            </Field>

            <Field label="Full Address" required htmlFor="co-address">
              <textarea id="co-address" required maxLength={500} rows={3}
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="input-field resize-none" placeholder="Flat, building, street, area" />
            </Field>

            <Field label="Landmark" htmlFor="co-landmark">
              <input id="co-landmark" type="text" maxLength={200}
                value={landmark} onChange={(e) => setLandmark(e.target.value)}
                className="input-field" placeholder="Near..." />
            </Field>

            <Field label="Pincode" required htmlFor="co-pincode"
              error={pincodeBlocked ? "We don't deliver to this pincode yet." : undefined}>
              <input id="co-pincode" type="text" required pattern="[0-9]{6}"
                maxLength={6} value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="input-field" placeholder="6-digit pincode" />
            </Field>

            {pincodeBlocked && (
              <a href={`https://wa.me/${SHOP.whatsapp}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                <WhatsAppIcon className="h-4 w-4" /> Message us on WhatsApp
              </a>
            )}

            <Field label="Delivery Date" required htmlFor="co-date">
              <input id="co-date" type="date" required min={minDate}
                value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                className="input-field" />
            </Field>

            <Field label="Time Slot" required htmlFor="co-slot">
              <select id="co-slot" required value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)} className="input-field">
                <option value="">Select a slot</option>
                {DELIVERY_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </Field>

            <Field label="Order Notes" htmlFor="co-notes">
              <textarea id="co-notes" maxLength={500} rows={2}
                value={notes} onChange={(e) => setNotes(e.target.value)}
                className="input-field resize-none" placeholder="Any special instructions..." />
            </Field>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-caption text-accent">Payment</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-accent transition-colors">
                  <input type="radio" name="payment" value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')} />
                  <span className="text-sm">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-3 border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-accent transition-colors">
                  <input type="radio" name="payment" value="upi_on_delivery"
                    checked={paymentMethod === 'upi_on_delivery'}
                    onChange={() => setPaymentMethod('upi_on_delivery')} />
                  <span className="text-sm">UPI on Delivery</span>
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button type="submit" disabled={submitting || pincodeBlocked}
              className="pill-btn pill-btn-primary w-full disabled:opacity-50">
              {submitting ? 'Placing Order...' : `Place Order — ${formatINR(total)}`}
            </button>
          </form>

          <div className="lg:sticky lg:top-24 self-start">
            <div className="border border-border rounded-card p-6 space-y-4">
              <p className="caption">Order Summary</p>
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.lineId} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <p>{line.qty}x {line.name}</p>
                      <p className="text-xs text-muted">{line.variantLabel}</p>
                      {line.flavour && <p className="text-xs text-muted">{line.flavour}</p>}
                      {line.eggless && <p className="text-xs text-accent">Eggless</p>}
                      {line.messageOnCake && <p className="text-xs text-muted">&ldquo;{line.messageOnCake}&rdquo;</p>}
                    </div>
                    <span className="tabular-nums">{formatINR(cartLineTotal(line))}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery</span>
                  <span className="tabular-nums">{deliveryFee === 0 ? 'Free' : formatINR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {waLink && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass border border-border rounded-card px-6 py-4 flex items-center gap-4">
            <p className="text-sm">Notify us on WhatsApp</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="pill-btn pill-btn-primary text-xs">
              <WhatsAppIcon className="h-4 w-4" /> Send
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
