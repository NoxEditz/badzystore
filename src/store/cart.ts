import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  stock?: number;
};

type CartState = {
  lines: CartLine[];
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (p, qty = 1) =>
        set((s) => {
          const requestedQty = Math.max(1, qty);
          const stock = Number.isFinite(p.stock) ? Math.max(0, p.stock) : undefined;
          const existing = s.lines.find((l) => l.id === p.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.id === p.id
                  ? {
                      ...l,
                      qty:
                        stock === undefined
                          ? l.qty + requestedQty
                          : Math.min(stock, l.qty + requestedQty),
                      stock,
                    }
                  : l,
              ),
            };
          }
          if (stock === 0) return s;
          return {
            lines: [
              ...s.lines,
              {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                image: p.image,
                qty: stock === undefined ? requestedQty : Math.min(stock, requestedQty),
                stock,
              },
            ],
          };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => {
              if (l.id !== id) return l;
              const nextQty = Math.max(1, qty);
              return {
                ...l,
                qty: l.stock === undefined ? nextQty : Math.min(l.stock, nextQty),
              };
            })
            .filter((l) => l.qty > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "badzy-cart" },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
