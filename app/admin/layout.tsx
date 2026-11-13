import Link from 'next/link';
import { SHOP } from '@/lib/config';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-content flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-lg uppercase tracking-wider">{SHOP.name}</span>
            <nav className="flex gap-4">
              <Link href="/admin/orders" className="text-xs uppercase tracking-caption text-muted hover:text-accent transition-colors">
                Orders
              </Link>
              <Link href="/admin/products" className="text-xs uppercase tracking-caption text-muted hover:text-accent transition-colors">
                Products
              </Link>
            </nav>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="pill-btn text-xs">Logout</button>
          </form>
        </div>
      </header>
      <div className="pt-6">{children}</div>
    </div>
  );
}
