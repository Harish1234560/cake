# Maison Gateaux — Cake Shop Website

A production-ready, mobile-first Next.js e-commerce website for a cake shop with scroll-video hero, 3D collection carousel, ordering flow, and admin dashboard.

## Tech Stack

- **Next.js 15** App Router, TypeScript strict mode
- **Tailwind CSS** with custom dark luxury theme tokens
- **GSAP + ScrollTrigger** for scroll animations (canvas frame sequence, pinned carousel, parallax)
- **Lenis** for smooth scrolling (desktop wheel/trackpad only, native touch on mobile)
- **Zustand** with localStorage persistence for cart
- **Zod** for shared client/server validation
- **Supabase** for products, orders, enquiries, and reference photo storage
- Bodoni Moda (display) + Outfit (body) fonts via Google Fonts

## Local Setup

```bash
npm install
```

### Environment Variables

Create a `.env` file (or use the provided `.env.example` as a template). The Supabase variables are pre-populated in the Bolt environment. You only need to add:

```
ADMIN_PASSWORD=your-strong-admin-password
ADMIN_SESSION_SECRET=a-random-secret-string-for-signing-sessions
```

Supabase variables (already set):
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_DB_URL=...
```

### Database Setup

The Supabase project is already provisioned. The schema and seed data have been applied via migrations:

- `supabase/migrations/20261112023005_create_initial_schema.sql` — tables, enums, RLS policies, storage bucket, order code function
- `supabase/migrations/20261112023033_seed_products.sql` — 8 sample products

Tables created:
- **products** — cake catalog with variants, flavours, stock toggle, eggless option
- **orders** — customer orders with items JSONB, delivery details, status tracking
- **enquiries** — enquiry form submissions

RLS enabled on all tables:
- `products`: public read-only (anon + authenticated)
- `orders` and `enquiries`: service_role only (no public access)

### Run the dev server

The dev server runs automatically in Bolt. To run locally:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Adding Your Frame Sequence (Scroll Hero)

The hero section plays a canvas frame sequence driven by scroll. You need two sets of frames:

### Folder structure

```
public/frames/mobile/0001.webp   ← portrait frames (mobile)
public/frames/desktop/0001.webp   ← landscape frames (desktop)
```

### Generate frames from video

Using ffmpeg:

```bash
# Mobile (portrait, 720px wide)
mkdir -p public/frames/mobile
ffmpeg -i mobile.mp4 -an -vf "fps=20,scale=720:-2" -c:v libwebp -quality 70 -compression_level 6 public/frames/mobile/%04d.webp

# Desktop (landscape, 1280px wide)
mkdir -p public/frames/desktop
ffmpeg -i desktop.mp4 -an -vf "fps=20,scale=1280:-2" -c:v libwebp -quality 70 -compression_level 6 public/frames/desktop/%04d.webp
```

### Set frame count

Edit `lib/config.ts`:

```typescript
export const FRAME_COUNT = {
  mobile: 120,    // number of frames in public/frames/mobile/
  desktop: 120,   // number of frames in public/frames/desktop/
} as const;
```

File naming: `0001.webp`, `0002.webp`, ... (zero-padded to 4 digits). The hero uses portrait frames on screens narrower than 768px and landscape frames on wider screens.

## Changing Shop Details

All shop configuration lives in `lib/config.ts`:

- `SHOP.name` — brand name
- `SHOP.city`, `SHOP.area` — delivery area
- `SHOP.pincodes` — array of served pincodes
- `SHOP.deliveryFee` — delivery fee in rupees
- `SHOP.freeDeliveryAbove` — free delivery threshold
- `SHOP.whatsapp` — owner WhatsApp number (country code, no +)
- `SHOP.phone` — owner phone for call button
- `SHOP.hours` — shop hours
- `SHOP.minNoticeNormal` / `SHOP.minNoticeCustom` — minimum notice hours
- `SHOP.sameDayCutoff` — same-day order cutoff time
- `SHOP.orderPrefix` — order ID prefix (e.g. "MG" produces MG-20261112-001)
- `DELIVERY_SLOTS` — delivery time slot options
- `REVIEWS` — customer reviews (replace with real ones)
- `GIFT_BOXES` — gift box/combo products

## Adding Products

Products live in Supabase. You can add them via the admin panel at `/admin` (Products tab) or by inserting rows directly:

```sql
INSERT INTO products (slug, name, category, description, base_image_url, tag, featured, in_stock, eggless_available, eggless_extra_price, allows_message, allows_photo, lead_time_hours, variants, flavours, sort_order)
VALUES (
  'new-cake-slug',
  'New Cake Name',
  'chocolate',  -- or: birthday, fruit-cream, cupcakes
  'Description text here',
  '/images/product-new.jpg',
  'New',  -- or NULL for no tag
  true,   -- featured
  true,   -- in_stock
  true,   -- eggless_available
  50,     -- eggless_extra_price
  true,   -- allows_message
  false,  -- allows_photo
  6,      -- lead_time_hours
  '[{"label":"500 g","price":890},{"label":"1 kg","price":1490}]'::jsonb,
  ARRAY['Dark Chocolate','Milk Chocolate'],
  9       -- sort_order
);
```

Use the admin panel's in-stock toggle to mark items sold out without redeploying.

## Admin Panel

Visit `/admin` to access:
- **Orders**: list, filter by status, view detail, change status, call/WhatsApp customer, print delivery slip
- **Products**: toggle in-stock, edit name/description/variant prices

Login requires `ADMIN_PASSWORD` env var. Session cookie is HMAC-signed, expires in 7 days. Login rate-limited to 5 attempts per 10 minutes per IP.

## Deployment (Vercel)

1. Push the project to GitHub
2. Import the repo into Vercel
3. Add environment variables in Vercel project settings:
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - Supabase variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL)
4. Deploy

Make sure your Supabase project allows connections from Vercel's IP range (usually enabled by default).

## Troubleshooting

### Hero jitter / flicker
- Ensure frames are evenly sized and all loaded before scrubbing starts
- The preloader shows progress until 30% of frames are ready
- If frames are missing, the canvas draws the nearest loaded frame
- Cap your frame count at 120-160 for smooth performance

### ScrollTrigger positions wrong after fonts load
- `ScrollTrigger.refresh()` is called after animations are set up
- If you still see issues, ensure images have explicit dimensions (next/image with fill + sizes)
- The `ignoreMobileResize: true` config prevents iOS address-bar-triggered refreshes

### Lenis and modal scroll lock
- The bag drawer calls `lenis.stop()` on open and `lenis.start()` on close
- `document.body.style.overflow` is also toggled as a fallback
- If scroll doesn't resume after closing a drawer, check that the cleanup runs

### Strict Mode double animations
- All GSAP animations use `gsap.context(() => {...}, ref)` and `ctx.revert()` in cleanup
- This ensures React Strict Mode's double-mount doesn't leave orphaned animations
- The `registerGsapPlugins()` function is guarded to run once

### Font loading
- Fonts load via Google Fonts `<link>` tags in the layout (not next/font) for compatibility
- If fonts fail to load, the fallbacks (serif/sans-serif) are applied

## Build Commands

```bash
npm install     # install dependencies
npm run dev     # start dev server
npm run build   # production build
npm run start   # start production server
npm run typecheck  # type check only
```

## 10-Point Test Checklist

1. **Mobile hero scrub** — Scroll the hero on a mobile viewport; the canvas frame sequence should scrub smoothly with the 9 chapter texts fading in/out
2. **Bag drawer** — Tap the bag icon; the drawer slides in from the right, scroll locks, Escape closes it
3. **Pincode block** — Enter an unserved pincode (e.g. 400001) on checkout; the error message and WhatsApp link appear, submit is blocked
4. **Order submit** — Fill the checkout form with a served pincode and submit; you should be redirected to the order page
5. **WhatsApp backup** — After placing an order, a WhatsApp link to the owner with the full order text appears
6. **Admin status change** — Login to /admin, open an order, tap "Mark as Preparing" — the status should update
7. **Sold-out toggle** — In admin Products, toggle a product's stock; it should show "Sold Out" on the shop page
8. **Reduced motion** — Enable prefers-reduced-motion in DevTools; the hero should show a static poster, no pinning or scrubbing
9. **Slow 3G load** — Throttle to Slow 3G; the hero preloader should show percentage progress until 30% of frames load
10. **iOS Safari address bar** — The hero and pinned sections use 100svh; the address bar collapse should not cause layout jumps
#   c a k e  
 