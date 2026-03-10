'use client';

import { Home, Menu as MenuIcon, ShoppingBag, User, Utensils } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { cn } from '@/lib/utils';

export function BottomNavigation() {
  const { currentView, setCurrentView } = useUIStore();
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'cart', label: 'Keranjang', icon: ShoppingBag, badge: cartItemCount },
    { id: 'profile', label: 'Profil', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all relative min-w-[60px]',
                  isActive
                    ? 'text-[#E53935]'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span className="absolute -top-1 right-2 bg-[#E53935] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                )}
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
