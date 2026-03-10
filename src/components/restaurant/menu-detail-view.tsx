'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Plus, Minus, ChefHat } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  spicyLevel?: number;
}

export function MenuDetailView() {
  const { selectedMenuId, goBack } = useUIStore();
  const { addItem } = useCartStore();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [spicyLevel, setSpicyLevel] = useState(1);
  const [extraCheese, setExtraCheese] = useState(false);
  const [extraRice, setExtraRice] = useState(false);

  useEffect(() => {
    if (selectedMenuId) {
      fetch(`/api/menu/${selectedMenuId}`)
        .then(async (res) => {
          if (!res.ok) {
            console.warn(`Menu with ID ${selectedMenuId} not found (status: ${res.status})`);
            setMenuItem(null);
            setLoading(false);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) {
            setMenuItem(data);
            if (data.spicyLevel) {
              setSpicyLevel(data.spicyLevel);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching menu item:', error);
          setLoading(false);
          setMenuItem(null);
        });
    }
  }, [selectedMenuId]);

  const handleAddToCart = () => {
    if (!menuItem) return;

    let finalPrice = (menuItem.price || 0) * quantity;

    // Add extras
    if (extraCheese) finalPrice += 5000 * quantity;
    if (extraRice) finalPrice += 5000 * quantity;

    addItem({
      menuId: menuItem.id,
      name: menuItem.name,
      image: menuItem.image,
      price: finalPrice / quantity,
      quantity,
      options: {
        spicyLevel,
        extraCheese,
        extraRice,
      },
    });

    goBack();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="w-full h-72 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl">😕</div>
          <div>
            <p className="text-lg font-semibold text-gray-700 mb-2">Menu tidak ditemukan</p>
            <p className="text-sm text-gray-500 mb-4">Menu yang Anda cari mungkin sudah tidak tersedia</p>
            <Button
              onClick={goBack}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              Kembali
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const basePrice = menuItem.price || 0;
  let finalPrice = basePrice * quantity;

  if (extraCheese) finalPrice += 5000 * quantity;
  if (extraRice) finalPrice += 5000 * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goBack}
        className="mb-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Image */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="relative aspect-video sm:aspect-[16/9]">
          {menuItem.image ? (
            <img
              src={menuItem.image}
              alt={menuItem.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-8xl">
              🍗
            </div>
          )}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
              <span className="font-bold">{(menuItem.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-gray-500">({menuItem.reviewCount || 0})</span>
          </div>
        </div>
      </Card>

      {/* Details */}
      <div className="space-y-6">
        {/* Title & Price */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
            {menuItem.name}
          </h1>
          <p className="text-3xl font-bold text-[#E53935]">
            Rp{basePrice.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Description */}
        {menuItem.description && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ChefHat className="w-5 h-5 text-[#E53935] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-2">Deskripsi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {menuItem.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Options */}
        <Card>
          <CardContent className="p-4 space-y-6">
            {/* Spicy Level */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Level Sambal</h3>
                <span className="text-[#E53935] font-bold">Level {spicyLevel}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌶️</span>
                <Slider
                  value={[spicyLevel]}
                  onValueChange={([value]) => setSpicyLevel(value)}
                  max={10}
                  min={0}
                  step={1}
                  className="flex-1"
                />
                <span className="text-2xl">🔥</span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Tidak Pedas</span>
                <span>Super Pedas</span>
              </div>
            </div>

            {/* Extra Cheese */}
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <h3 className="font-semibold">Extra Keju</h3>
                <p className="text-sm text-gray-500">+Rp5.000</p>
              </div>
              <Switch
                checked={extraCheese}
                onCheckedChange={setExtraCheese}
              />
            </div>

            {/* Extra Rice */}
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <h3 className="font-semibold">Extra Nasi</h3>
                <p className="text-sm text-gray-500">+Rp5.000</p>
              </div>
              <Switch
                checked={extraRice}
                onCheckedChange={setExtraRice}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quantity */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Jumlah</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-xl font-bold">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total & Add to Cart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-[#E53935]">
                Rp{finalPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-14 text-base font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah ke Keranjang
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
