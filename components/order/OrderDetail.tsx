'use client';

import { useState } from 'react';
import type { OrderRow, OrderStatus } from '@/lib/supabase';
import { formatINR, formatDate, formatDateTime } from '@/lib/format';
import { SHOP } from '@/lib/config';
import { CheckIcon, WhatsAppIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'received', label: 'Received' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

export function OrderDetail({ order }: { order: OrderRow }) {
  const [verified, setVerified] = useState(false);
  const [phoneLast4, setPhoneLast4] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLast4 === order.phone.slice(-4)) {
      setVerified(true);
      setVerifyError('');
    } else {
      setVerifyError('Last 4 digits do not match our records.');
    }
  };

  const stepIndex = getStepIndex(order.status);
  const waText = `Hi ${SHOP.name}, I have placed order ${order.order_code}. Could you confirm it's been received?`;
  const waUrl = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(waText)}`;

  if (!verified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="accent-line" />
            <h1 className="font-display text-2xl">Order Verification</h1>
            <p className="text-sm text-muted mt-2">
              Enter the last 4 digits of the phone number used to place this order.
            </p>
          </div>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={phoneLast4}
              onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="••••"
              aria-label="Last 4 digits of phone"
            />
            {verifyError && <p className="text-sm text-error text-center">{verifyError}</p>}
            <button type="submit" className="pill-btn pill-btn-primary w-full">
              View Order
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 px-4 md:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="accent-line" />
          <h1 className="font-display text-3xl">Order Confirmed</h1>
          <p className="text-sm text-muted mt-2 font-display tracking-wider">
            {order.order_code}
          </p>
        </div>

        {order.status === 'cancelled' ? (
          <div className="border border-error/30 rounded-card p-6 text-center">
            <p className="text-lg text-error">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="border border-border rounded-card p-6">
            <p className="caption mb-6">Order Status</p>
            <div className="flex justify-between">
              {STEPS.map((step, i) => (
                <div key={step.status} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div className={cn('flex-1 h-px', i <= stepIndex ? 'bg-accent' : 'bg-border')} />
                    )}
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0',
                        i <= stepIndex
                          ? 'border-accent bg-accent text-background'
                          : 'border-border text-muted'
                      )}
                    >
                      {i < stepIndex ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-xs tabular-nums">{i + 1}</span>
                      )}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn('flex-1 h-px', i < stepIndex ? 'bg-accent' : 'bg-border')} />
                    )}
                  </div>
                  <p className={cn(
                    'text-[10px] uppercase tracking-caption mt-2 text-center',
                    i <= stepIndex ? 'text-accent' : 'text-muted'
                  )}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border border-border rounded-card p-6 space-y-4">
          <p className="caption">Items</p>
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <div className="flex-1 pr-4">
                  <p>{item.qty}x {item.name} ({item.variantLabel})</p>
                  {item.flavour && <p className="text-xs text-muted">{item.flavour}</p>}
                  {item.eggless && <p className="text-xs text-accent">Eggless</p>}
                  {item.messageOnCake && <p className="text-xs text-muted">&ldquo;{item.messageOnCake}&rdquo;</p>}
                  {item.referencePhotoUrl && (
                    <a href={item.referencePhotoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline">View reference photo</a>
                  )}
                </div>
                <span className="tabular-nums">{formatINR(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="tabular-nums">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Delivery</span>
              <span className="tabular-nums">{order.delivery_fee === 0 ? 'Free' : formatINR(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="tabular-nums">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-card p-6 space-y-3">
          <p className="caption">Delivery Details</p>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm text-muted">{order.address}</p>
          {order.landmark && <p className="text-sm text-muted">Landmark: {order.landmark}</p>}
          <p className="text-sm text-muted">Pincode: {order.pincode}</p>
          <p className="text-sm text-muted">Phone: {order.phone}</p>
          <p className="text-sm text-muted">Date: {formatDate(order.delivery_date)}</p>
          <p className="text-sm text-muted">Slot: {order.time_slot}</p>
          <p className="text-sm text-muted">
            Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI on Delivery'}
          </p>
          {order.notes && <p className="text-sm text-muted">Notes: {order.notes}</p>}
          <p className="text-xs text-muted">Placed: {formatDateTime(order.created_at)}</p>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="pill-btn pill-btn-primary w-full inline-flex">
          <WhatsAppIcon className="h-4 w-4" /> Message us on WhatsApp
        </a>

        <div className="text-center">
          <a href="/" className="text-sm text-muted hover:text-accent transition-colors">
            Back to shop
          </a>
        </div>
      </div>
    </div>
  );
}
