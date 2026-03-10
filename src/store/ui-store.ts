import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ViewType = 'splash' | 'home' | 'menu' | 'menu-detail' | 'cart' | 'checkout' | 'order-status' | 'order-history' | 'profile' | 'login' | 'register' | 'forgot-password' | 'account-data' | 'saved-addresses' | 'points-rewards' | 'rewards' | 'settings' | 'admin-dashboard' | 'admin-orders' | 'admin-menu' | 'admin-financial-report' | 'cashier-management' | 'admin-rewards' | 'cashier-pos';

interface UIStore {
  currentView: ViewType;
  selectedMenuId: string | null;
  selectedOrderId: string | null;
  showCart: boolean;
  setCurrentView: (view: ViewType) => void;
  setSelectedMenuId: (id: string | null) => void;
  setSelectedOrderId: (id: string | null) => void;
  setShowCart: (show: boolean) => void;
  navigateToMenu: (menuId: string) => void;
  navigateToOrder: (orderId: string) => void;
  goBack: () => void;
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

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      currentView: 'splash',
      selectedMenuId: null,
      selectedOrderId: null,
      showCart: false,

      setCurrentView: (view) => set({ currentView: view }),

      setSelectedMenuId: (id) => set({ selectedMenuId: id }),

      setSelectedOrderId: (id) => set({ selectedOrderId: id }),

      setShowCart: (show) => set({ showCart: show }),

      navigateToMenu: (menuId) =>
        set({ currentView: 'menu-detail', selectedMenuId: menuId }),

      navigateToOrder: (orderId) =>
        set({ currentView: 'order-status', selectedOrderId: orderId }),

      goBack: () => {
        const { currentView } = get();
        const viewHistory: Record<ViewType, ViewType> = {
          splash: 'splash',
          home: 'splash',
          menu: 'home',
          'menu-detail': 'menu',
          cart: 'home',
          checkout: 'cart',
          'order-status': 'order-history',
          'order-history': 'profile',
          profile: 'home',
          login: 'home',
          register: 'login',
          'forgot-password': 'login',
          'account-data': 'profile',
          'saved-addresses': 'profile',
          'points-rewards': 'profile',
          rewards: 'profile',
          settings: 'profile',
          'admin-dashboard': 'home',
          'admin-orders': 'admin-dashboard',
          'admin-menu': 'admin-dashboard',
          'admin-financial-report': 'admin-dashboard',
          'cashier-management': 'admin-dashboard',
          'admin-rewards': 'admin-dashboard',
          'cashier-pos': 'login',
        };
        set({ currentView: viewHistory[currentView] });
      },
    }),
    {
      name: 'ayam-geprek-ui',
      storage: createJSONStorage(() => isLocalStorageAvailable() ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      partialize: (state) => ({
        currentView: state.currentView,
        selectedMenuId: state.selectedMenuId,
        selectedOrderId: state.selectedOrderId,
      }),
    }
  )
);
