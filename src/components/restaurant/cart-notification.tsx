'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'sonner';
import { ShoppingBag, X } from 'lucide-react';

export function CartNotification() {
  const { items } = useCartStore();
  const lastItemRef = useRef<string | null>(null);
  const prevItemsCountRef = useRef(0);

  useEffect(() => {
    const currentCount = items.length;
    const prevCount = prevItemsCountRef.current;

    // Check if item was added (count increased)
    if (currentCount > prevCount && items.length > 0) {
      // Find the newest item (last in array)
      const newestItem = items[items.length - 1];
      if (newestItem && newestItem.name !== lastItemRef.current) {
        lastItemRef.current = newestItem.name;

        toast.success('Ditambahkan ke keranjang', {
          description: `${newestItem.name} x${newestItem.quantity}`,
          action: {
            label: 'Tutup',
            onClick: () => {},
          },
          duration: 3000,
          icon: (
            <div className="w-8 h-8 bg-[#E53935] rounded-full flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
          ),
        });
      }
    }

    // Check if item was removed (count decreased)
    if (currentCount < prevCount && lastItemRef.current) {
      toast.info('Dihapus dari keranjang', {
        description: lastItemRef.current,
        action: {
          label: 'Tutup',
          onClick: () => {},
        },
        duration: 2000,
        icon: (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-white" />
          </div>
        ),
      });
      lastItemRef.current = null;
    }

    prevItemsCountRef.current = currentCount;
  }, [items]);

  return null; // This component only manages notifications
}
