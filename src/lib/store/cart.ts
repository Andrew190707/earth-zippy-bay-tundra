import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "./constants";
import type { Product } from "./types";

export type CartItem = {
  product: Product;
  quantity: number;
  size: string;
  color: string;
};

type CartState = {
  items: CartItem[];
  add: (product: Product, size: string, color: string, quantity?: number) => void;
  setQuantity: (id: string, size: string, color: string, amount: number) => void;
  remove: (id: string, size: string, color: string) => void;
  changeVariant: (
    id: string,
    oldSize: string,
    oldColor: string,
    size: string,
    color: string,
  ) => void;
  clear: () => void;
};

function sameLine(line: CartItem, id: string, size: string, color: string) {
  return line.product.id === id && line.size === size && line.color === color;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (product, size, color, quantity = 1) =>
        set((current) => {
          const found = current.items.find((line) => sameLine(line, product.id, size, color));
          if (found) {
            return {
              items: current.items.map((line) =>
                line === found
                  ? { ...line, quantity: Math.min(10, line.quantity + quantity) }
                  : line,
              ),
            };
          }
          return {
            items: [
              ...current.items,
              { product, size, color, quantity: Math.min(10, Math.max(1, quantity)) },
            ],
          };
        }),
      setQuantity: (id, size, color, amount) =>
        set((current) => ({
          items: current.items.map((line) =>
            sameLine(line, id, size, color)
              ? { ...line, quantity: Math.max(1, Math.min(10, amount)) }
              : line,
          ),
        })),
      remove: (id, size, color) =>
        set((current) => ({
          items: current.items.filter((line) => !sameLine(line, id, size, color)),
        })),
      changeVariant: (id, oldSize, oldColor, size, color) =>
        set((current) => {
          const moving = current.items.find((line) => sameLine(line, id, oldSize, oldColor));
          if (!moving) return current;
          const existing = current.items.find((line) => sameLine(line, id, size, color));
          if (existing && existing !== moving) {
            return {
              items: current.items
                .filter((line) => line !== moving)
                .map((line) =>
                  line === existing
                    ? { ...line, quantity: Math.min(10, line.quantity + moving.quantity) }
                    : line,
                ),
            };
          }
          return {
            items: current.items.map((line) => (line === moving ? { ...line, size, color } : line)),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: CART_STORAGE_KEY },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, item) => n + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((n, item) => n + item.product.price * item.quantity, 0);
}
