import type { CartLineDB } from './supabase';
import { SHOP } from './config';
import { formatINR } from './format';

export function buildOrderText(order: {
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  pincode: string;
  delivery_date: string;
  time_slot: string;
  payment_method: string;
  items: CartLineDB[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`*New Order ${order.order_code}*`);
  lines.push('');
  lines.push('*Customer*');
  lines.push(`${order.customer_name}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Address: ${order.address}`);
  if (order.landmark) lines.push(`Landmark: ${order.landmark}`);
  lines.push(`Pincode: ${order.pincode}`);
  lines.push('');
  lines.push('*Delivery*');
  lines.push(`Date: ${order.delivery_date}`);
  lines.push(`Slot: ${order.time_slot}`);
  lines.push('');
  lines.push('*Items*');
  for (const item of order.items) {
    lines.push(`\u2022 ${item.qty}x ${item.name} (${item.variantLabel})`);
    if (item.flavour) lines.push(`  Flavour: ${item.flavour}`);
    if (item.eggless) lines.push(`  Eggless: Yes`);
    if (item.messageOnCake) lines.push(`  Message: "${item.messageOnCake}"`);
    if (item.referencePhotoUrl) lines.push(`  Ref photo: ${item.referencePhotoUrl}`);
    lines.push(`  ${formatINR(item.lineTotal)}`);
  }
  lines.push('');
  lines.push(`Subtotal: ${formatINR(order.subtotal)}`);
  lines.push(`Delivery: ${order.delivery_fee === 0 ? 'Free' : formatINR(order.delivery_fee)}`);
  lines.push(`*Total: ${formatINR(order.total)}*`);
  lines.push(`Payment: ${order.payment_method === 'cod' ? 'Cash on delivery' : 'UPI on delivery'}`);
  if (order.notes) {
    lines.push('');
    lines.push(`Notes: ${order.notes}`);
  }
  return lines.join('\n');
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function buildCustomerWhatsAppUrl(orderCode: string, customerPhone: string): string {
  const text = `Hi, I have placed an order (${orderCode}) with ${SHOP.name}. Could you confirm it's been received?`;
  return buildWhatsAppUrl(customerPhone, text);
}
