'use client';

import { useState } from 'react';
import type { OrderRow, OrderStatus } from '@/lib/supabase';
import { formatINR, formatDate, formatDateTime } from '@/lib/format';
import { PhoneIcon, WhatsAppIcon, CloseIcon, PrintIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { SHOP } from '@/lib/config';

type StatusTab = { id: OrderStatus | 'all'; label: string };

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  received: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered: null,
  cancelled: null,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-accent/20 text-accent',
  preparing: 'bg-warning/20 text-warning',
  out_for_delivery: 'bg-accent/20 text-accent',
  delivered: 'bg-success/20 text-success',
  cancelled: 'bg-error/20 text-error',
};

export function AdminOrdersClient({
  orders,
  todays,
  statusTabs,
}: {
  orders: OrderRow[];
  todays: OrderRow[];
  statusTabs: StatusTab[];
}) {
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [localOrders, setLocalOrders] = useState(orders);

  const filtered = tab === 'all'
    ? localOrders
    : localOrders.filter((o) => o.status === tab);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (selected?.id === orderId) {
      setSelected((prev) => (prev ? { ...prev, status } : null));
    }
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
  };

  return (
    <div className="px-4 md:px-8 pb-12">
      <div className="mx-auto max-w-content">
        {todays.length > 0 && (
          <div className="mb-6 border border-accent/30 rounded-card p-4">
            <p className="caption mb-3">Today&apos;s Deliveries ({todays.length})</p>
            <div className="flex flex-wrap gap-2">
              {todays.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="text-xs border border-border rounded-pill px-3 py-2 hover:border-accent transition-colors"
                >
                  {o.order_code} · {o.time_slot} · {formatINR(o.total)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {statusTabs.map((st) => (
            <button
              key={st.id}
              onClick={() => setTab(st.id)}
              className={cn(
                'rounded-pill border px-4 py-2 text-xs uppercase tracking-button transition-all whitespace-nowrap min-h-[40px]',
                tab === st.id
                  ? 'border-accent bg-accent text-background'
                  : 'border-foreground/20 text-muted hover:border-accent'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted py-12">No orders found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelected(order)}
                className="w-full text-left border border-border rounded-card p-4 hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm tracking-wider">{order.order_code}</p>
                    <p className="text-xs text-muted truncate">{order.customer_name} · {order.phone}</p>
                    <p className="text-xs text-muted">{formatDate(order.delivery_date)} · {order.time_slot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm tabular-nums">{formatINR(order.total)}</p>
                    <span className={cn('inline-block rounded-pill px-2 py-1 text-[10px] uppercase tracking-button mt-1', STATUS_COLORS[order.status])}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <OrderDetailDrawer
            order={selected}
            onClose={() => setSelected(null)}
            onUpdateStatus={updateStatus}
          />
        )}
      </div>
    </div>
  );
}

function OrderDetailDrawer({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: OrderRow;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}) {
  const nextStatus = NEXT_STATUS[order.status];
  const customerWaUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(`Hi ${order.customer_name}, regarding your order ${order.order_code}...`)}`;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-[101] h-[100dvh] w-full md:w-[500px] border-l border-border bg-surface overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sticky top-0 glass z-10 no-print">
          <h2 className="font-display text-lg tracking-wider">{order.order_code}</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()} aria-label="Print" className="icon-btn h-10 w-10">
              <PrintIcon />
            </button>
            <button onClick={onClose} aria-label="Close" className="icon-btn h-10 w-10">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div className="print-slip space-y-6">
            <div className="space-y-2">
              <p className="caption">Customer</p>
              <p className="text-sm">{order.customer_name}</p>
              <p className="text-sm text-muted">{order.phone}</p>
              <p className="text-sm text-muted">{order.address}</p>
              {order.landmark && <p className="text-sm text-muted">Landmark: {order.landmark}</p>}
              <p className="text-sm text-muted">Pincode: {order.pincode}</p>
            </div>

            <div className="space-y-2">
              <p className="caption">Delivery</p>
              <p className="text-sm">{formatDate(order.delivery_date)}</p>
              <p className="text-sm text-muted">{order.time_slot}</p>
              <p className="text-sm text-muted">
                Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'UPI on Delivery'}
              </p>
              {order.notes && <p className="text-sm text-muted">Notes: {order.notes}</p>}
            </div>

            <div className="space-y-2">
              <p className="caption">Items</p>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    <p>{item.qty}x {item.name} ({item.variantLabel})</p>
                    {item.flavour && <p className="text-xs text-muted">{item.flavour}</p>}
                    {item.eggless && <p className="text-xs text-accent">Eggless</p>}
                    {item.messageOnCake && <p className="text-xs text-muted">&ldquo;{item.messageOnCake}&rdquo;</p>}
                    {item.referencePhotoUrl && (
                      <a href={item.referencePhotoUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline">Reference photo</a>
                    )}
                    <p className="tabular-nums text-muted">{formatINR(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-2 mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="tabular-nums">{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery</span>
                  <span className="tabular-nums">{order.delivery_fee === 0 ? 'Free' : formatINR(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-1">
                  <span>Total</span>
                  <span className="tabular-nums">{formatINR(order.total)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted">Placed: {formatDateTime(order.created_at)}</p>
          </div>

          <div className="no-print space-y-4">
            <div className="flex gap-2">
              <a href={`tel:${order.phone}`} className="pill-btn flex-1 text-xs">
                <PhoneIcon className="h-4 w-4" /> Call
              </a>
              <a href={customerWaUrl} target="_blank" rel="noopener noreferrer" className="pill-btn flex-1 text-xs">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="space-y-2">
              <p className="caption">Status: {order.status.replace(/_/g, ' ')}</p>
              {nextStatus && (
                <button
                  onClick={() => onUpdateStatus(order.id, nextStatus)}
                  className="pill-btn pill-btn-primary w-full"
                >
                  Mark as {nextStatus.replace(/_/g, ' ')}
                </button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={() => {
                    if (confirm('Cancel this order?')) onUpdateStatus(order.id, 'cancelled');
                  }}
                  className="pill-btn w-full text-error border-error/30"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
