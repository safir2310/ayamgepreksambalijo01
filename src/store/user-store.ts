import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar?: string;
  points?: number;
  role?: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCashier: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userData: Partial<User>) => void;
  updatePoints: (points: number) => void;
  logout: () => void;
  setHasHydrated: (hydrated: boolean) => void;
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

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isCashier: false,
      hasHydrated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCashier: user?.role === 'cashier',
      }),

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      updatePoints: (points) => {
        set((state) => ({
          user: state.user ? { ...state.user, points } : null,
        }));
      },

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isCashier: false,
      }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'ayam-geprek-user',
      storage: createJSONStorage(() => isLocalStorageAvailable() ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
