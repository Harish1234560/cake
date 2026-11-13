import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  variantLabel: string;
  unitPrice: number;
  flavour: string | null;
  eggless: boolean;
  messageOnCake: string | null;
  referencePhotoUrl: string | null;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, 'lineId'>) => void;
  removeLine: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

function makeLineId(line: Omit<CartLine, 'lineId'>): string {
  const parts = [
    line.productId,
    line.variantLabel,
    line.flavour || 'none',
    line.eggless ? 'eggless' : 'regular',
    line.messageOnCake || 'nomsg',
    line.referencePhotoUrl || 'nophoto',
  ];
  return parts.join('|');
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line) => {
        const lineId = makeLineId(line);
        const existing = get().lines.find((l) => l.lineId === lineId);
        if (existing) {
          set((s) => ({
            lines: s.lines.map((l) =>
              l.lineId === lineId ? { ...l, qty: l.qty + line.qty } : l
            ),
          }));
        } else {
          set((s) => ({ lines: [...s.lines, { ...line, lineId }] }));
        }
      },
      removeLine: (lineId) => {
        set((s) => ({ lines: s.lines.filter((l) => l.lineId !== lineId) }));
      },
      updateQty: (lineId, qty) => {
        if (qty < 1) {
          get().removeLine(lineId);
          return;
        }
        set((s) => ({
          lines: s.lines.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
        }));
      },
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: () =>
        get().lines.reduce((sum, l) => {
          const egglessExtra = l.eggless ? 50 : 0;
          return sum + (l.unitPrice + egglessExtra) * l.qty;
        }, 0),
    }),
    { name: 'mg-cart' }
  )
);

export function cartLineTotal(line: CartLine): number {
  const egglessExtra = line.eggless ? 50 : 0;
  return (line.unitPrice + egglessExtra) * line.qty;
}
