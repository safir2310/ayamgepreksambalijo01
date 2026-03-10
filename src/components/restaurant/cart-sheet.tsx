'use client';

import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CartSheet() {
  const { showCart, setShowCart, setCurrentView } = useUIStore();
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const handleCheckout = () => {
    setShowCart(false);
    setCurrentView('checkout');
  };

  return (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#E53935]" />
            Keranjang Belanja
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Keranjang Kosong</h3>
            <p className="text-sm text-gray-500">
              Belum ada item di keranjang Anda
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {/* Image */}
                    {item.image && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                        {item.name}
                      </h4>

                      {/* Options */}
                      {item.options && (
                        <div className="text-xs text-gray-500 mb-2">
                          {item.options.spicyLevel && (
                            <span>Level {item.options.spicyLevel}</span>
                          )}
                          {item.options.spicyLevel && item.options.extraCheese && (
                            <span className="mx-1">•</span>
                          )}
                          {item.options.extraCheese && <span>Extra Keju</span>}
                          {item.options.extraRice && (
                            <span className="mx-1">•</span>
                          )}
                          {item.options.extraRice && <span>Extra Nasi</span>}
                        </div>
                      )}

                      {/* Price */}
                      <p className="font-bold text-[#E53935] text-sm">
                        Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.menuId, item.options)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1 bg-white rounded-lg border">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuId, item.quantity - 1, item.options)
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuId, item.quantity + 1, item.options)
                          }
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Total Pembayaran</span>
                <span className="text-xl font-bold text-[#E53935]">
                  Rp{getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-12 text-base font-semibold"
              >
                Lanjut ke Pembayaran
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
