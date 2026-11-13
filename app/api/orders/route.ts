import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, type OrderStatus } from '@/lib/supabase';
import { checkoutSchema } from '@/lib/schemas';
import { SHOP, isPincodeServed, deliveryFeeFor, DELIVERY_SLOTS } from '@/lib/config';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limited = rateLimit(`orders:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    const data = parsed.data;

    if (!isPincodeServed(data.pincode)) {
      return NextResponse.json({ error: 'We do not deliver to this pincode.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const productIds = data.items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, in_stock, variants, eggless_extra_price, lead_time_hours')
      .in('id', productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: 'Could not verify products.' }, { status: 500 });
    }

    let serverSubtotal = 0;
    let maxLeadTime: number = SHOP.minNoticeNormal;
    const verifiedItems = [];

    for (const item of data.items) {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
      }
      if (!product.in_stock) {
        return NextResponse.json({ error: `${item.name} is sold out.` }, { status: 400 });
      }

      const variant = (product.variants as { label: string; price: number }[]).find(
        (v) => v.label === item.variantLabel
      );
      if (!variant) {
        return NextResponse.json({ error: `Invalid size for ${item.name}` }, { status: 400 });
      }

      const egglessExtra = item.eggless ? (product.eggless_extra_price as number) : 0;
      const unitPrice = variant.price + egglessExtra;
      const lineTotal = unitPrice * item.qty;
      serverSubtotal += lineTotal;
      maxLeadTime = Math.max(maxLeadTime, product.lead_time_hours as number);

      verifiedItems.push({
        productId: item.productId,
        name: item.name,
        image: item.image,
        variantLabel: item.variantLabel,
        unitPrice: variant.price,
        flavour: item.flavour,
        eggless: item.eggless,
        messageOnCake: item.messageOnCake,
        referencePhotoUrl: item.referencePhotoUrl,
        qty: item.qty,
        lineTotal,
      });
    }

    const deliveryFee = deliveryFeeFor(serverSubtotal);
    const total = serverSubtotal + deliveryFee;

    const minDeliveryDate = new Date();
    minDeliveryDate.setDate(minDeliveryDate.getDate() + 1);
    const minDateStr = minDeliveryDate.toISOString().split('T')[0];
    if (data.deliveryDate < minDateStr) {
      return NextResponse.json({ error: 'Delivery date is too soon.' }, { status: 400 });
    }

    if (!DELIVERY_SLOTS.includes(data.timeSlot as typeof DELIVERY_SLOTS[number])) {
      return NextResponse.json({ error: 'Invalid time slot.' }, { status: 400 });
    }

    const { data: orderCodeData, error: codeError } = await supabase.rpc('generate_order_code');
    if (codeError || !orderCodeData) {
      return NextResponse.json({ error: 'Could not generate order code.' }, { status: 500 });
    }

    const { data: orderRow, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_code: orderCodeData as string,
        customer_name: data.customerName,
        phone: data.phone,
        address: data.address,
        landmark: data.landmark || null,
        pincode: data.pincode,
        delivery_date: data.deliveryDate,
        time_slot: data.timeSlot,
        payment_method: data.paymentMethod,
        items: verifiedItems,
        subtotal: serverSubtotal,
        delivery_fee: deliveryFee,
        total,
        notes: data.notes || null,
        status: 'received' as OrderStatus,
      })
      .select('id, order_code')
      .single();

    if (insertError || !orderRow) {
      return NextResponse.json({ error: 'Could not place order.' }, { status: 500 });
    }

    return NextResponse.json({ orderId: orderRow.id, orderCode: orderRow.order_code });
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
