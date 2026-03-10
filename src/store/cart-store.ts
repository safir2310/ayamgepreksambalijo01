import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  menuId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  options?: {
    spicyLevel?: number;
    extraCheese?: boolean;
    extraRice?: boolean;
    notes?: string;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (menuId: string, options?: CartItem['options']) => void;
  updateQuantity: (menuId, quantity: number, options?: CartItem['options']) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        // Check if item already exists with same options
        const existingItemIndex = items.findIndex(
          (i) =>
            i.menuId === item.menuId &&
            JSON.stringify(i.options) === JSON.stringify(item.options)
        );

        if (existingItemIndex > -1) {
          // Update quantity
          const newItems = [...items];
          newItems[existingItemIndex].quantity += item.quantity;
          set({ items: newItems });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                ...item,
                id: `${item.menuId}-${Date.now()}`,
              },
            ],
          });
        }
      },

      removeItem: (menuId, options) => {
        const { items } = get();
        set({
          items: items.filter(
            (item) =>
              !(
                item.menuId === menuId &&
                JSON.stringify(item.options) === JSON.stringify(options)
              )
          ),
        });
      },

      updateQuantity: (menuId, quantity, options) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(menuId, options);
          return;
        }

        const newItems = items.map((item) => {
          if (
            item.menuId === menuId &&
            JSON.stringify(item.options) === JSON.stringify(options)
          ) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: newItems });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'ayam-geprek-cart',
      storage: createJSONStorage(() => isLocalStorageAvailable() ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
    }
  )
);
