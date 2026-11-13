import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(10, 'Phone must be exactly 10 digits')
  .max(10, 'Phone must be exactly 10 digits')
  .regex(/^[6-9]\d{9}$/, 'Phone must start with 6-9 and be 10 digits');

export const pincodeSchema = z
  .string()
  .min(6, 'Pincode must be 6 digits')
  .max(6, 'Pincode must be 6 digits')
  .regex(/^\d{6}$/, 'Pincode must be 6 digits');

export const cartLineSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  image: z.string().min(1).max(1000),
  variantLabel: z.string().min(1).max(50),
  unitPrice: z.number().int().min(0),
  flavour: z.string().nullable(),
  eggless: z.boolean(),
  messageOnCake: z.string().max(30).nullable(),
  referencePhotoUrl: z.string().url().nullable().or(z.literal('')),
  qty: z.number().int().min(1).max(20),
  lineTotal: z.number().int().min(0),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required').max(100),
  phone: phoneSchema,
  address: z.string().min(10, 'Full address is required').max(500),
  landmark: z.string().max(200).optional().or(z.literal('')),
  pincode: pincodeSchema,
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'upi_on_delivery']),
  items: z.array(cartLineSchema).min(1, 'Your bag is empty'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const enquirySchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  phone: phoneSchema,
  occasion: z.string().min(1).max(50),
  message: z.string().min(5, 'Tell us a bit more').max(1000),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

export const productUpdateSchema = z.object({
  id: z.string().uuid(),
  in_stock: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  variants: z
    .array(z.object({ label: z.string().min(1).max(50), price: z.number().int().min(0) }))
    .optional(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
});
