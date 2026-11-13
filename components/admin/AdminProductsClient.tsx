'use client';

import { useState } from 'react';
import type { Product } from '@/lib/supabase';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AdminProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [editing, setEditing] = useState<Product | null>(null);

  const toggleStock = async (id: string, inStock: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: !inStock } : p)));
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, in_stock: !inStock }),
    });
  };

  const saveEdit = async (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
    await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        variants: updated.variants,
      }),
    });
  };

  return (
    <div className="px-4 md:px-8 pb-12">
      <div className="mx-auto max-w-content">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl">Products ({products.length})</h1>
        </div>

        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="border border-border rounded-card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base">{product.name}</p>
                  <p className="text-xs text-muted">{product.category}</p>
                  <p className="text-sm tabular-nums mt-1">
                    {product.variants.map((v) => `${v.label}: ${formatINR(v.price)}`).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(product)}
                    className="pill-btn text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStock(product.id, product.in_stock)}
                    className={cn(
                      'relative h-7 w-12 rounded-full transition-colors min-w-[48px]',
                      product.in_stock ? 'bg-accent' : 'bg-foreground/20'
                    )}
                    role="switch"
                    aria-checked={product.in_stock}
                    aria-label={`Toggle ${product.name} stock`}
                  >
                    <span
                      className={cn(
                        'absolute top-1 h-5 w-5 rounded-full bg-foreground transition-transform',
                        product.in_stock ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                  <span className={cn('text-xs', product.in_stock ? 'text-success' : 'text-error')}>
                    {product.in_stock ? 'In Stock' : 'Sold Out'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <EditModal product={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
        )}
      </div>
    </div>
  );
}

function EditModal({
  product,
  onSave,
  onClose,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [variants, setVariants] = useState(product.variants);

  const handleSave = () => {
    onSave({ ...product, name, description, variants });
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[101] -translate-x-1/2 -translate-y-1/2 w-full max-w-md md:max-w-lg border border-border rounded-card bg-surface p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        <h2 className="font-display text-lg mb-4">Edit Product</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-caption text-accent mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-caption text-accent mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-caption text-accent mb-2">Variants</label>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => setVariants(prev => prev.map((pv, pi) => pi === i ? { ...pv, label: e.target.value } : pv))}
                    className="input-field flex-1"
                  />
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => setVariants(prev => prev.map((pv, pi) => pi === i ? { ...pv, price: parseInt(e.target.value) || 0 } : pv))}
                    className="input-field w-28"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="pill-btn flex-1">Cancel</button>
            <button onClick={handleSave} className="pill-btn pill-btn-primary flex-1">Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
