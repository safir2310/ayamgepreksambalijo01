'use client';

import { Bell, MapPin, User, ChefHat } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { setCurrentView, setShowCart, currentView } = useUIStore();
  const { user, isAuthenticated } = useUserStore();
  const { getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* User / Location */}
          <div
            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
            onClick={() => setCurrentView('profile')}
          >
            {isAuthenticated && user ? (
              <>
                <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Halo,</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || user.username || 'User'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Selamat Datang di</p>
                  <p className="text-sm font-bold text-[#E53935] truncate uppercase">
                    Ayam Geprek Sambal Ijo
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {cartItemCount !== undefined && cartItemCount !== null && cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
