import { create } from "zustand";
import { MenuItemDTO } from "@/types";

export interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes: string;
  isVeg: boolean;
}

interface CartStore {
  items: CartItem[];
  orderNotes: string;
  addItem: (item: MenuItemDTO) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  updateItemNotes: (menuItemId: string, notes: string) => void;
  setOrderNotes: (notes: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useOrderCart = create<CartStore>((set, get) => ({
  items: [],
  orderNotes: "",

  addItem: (item: MenuItemDTO) => {
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            menuItemId: item.id,
            name: item.name,
            unitPrice: item.price,
            quantity: 1,
            notes: "",
            isVeg: item.isVeg,
          },
        ],
      };
    });
  },

  removeItem: (menuItemId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.menuItemId !== menuItemId),
    }));
  },

  updateQuantity: (menuItemId: string, delta: number) => {
    set((state) => ({
      items: state.items
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[],
    }));
  },

  updateItemNotes: (menuItemId: string, notes: string) => {
    set((state) => ({
      items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, notes } : i)),
    }));
  },

  setOrderNotes: (orderNotes: string) => set({ orderNotes }),

  clearCart: () => set({ items: [], orderNotes: "" }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  },
}));
