'use client';

import { useEffect, useState } from 'react';
import { Star, Flame, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  _count?: {
    menuItems: number;
  };
}

interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  spicyLevel?: number;
}

export function HomeView() {
  const { setCurrentView, navigateToMenu } = useUIStore();
  const { addItem } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/menu?popular=true&available=true').then((res) => res.json()),
    ])
      .then(([categoriesData, menuData]) => {
        setCategories(categoriesData);
        setPopularItems(menuData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      options: {
        spicyLevel: item.spicyLevel,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Promo Banner */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-[#E53935] to-[#FFC107]">
        <CardContent className="p-6 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Promo Spesial! 🎉
              </h2>
              <p className="text-white/90 mb-3">
                Diskon 20% untuk pesanan pertama Anda
              </p>
              <p className="text-sm text-white/80">
                Gratis Es Teh untuk pembelian di atas Rp50.000
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl sm:text-5xl">🍗</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-display font-bold mb-4">Kategori Menu</h2>
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => navigateToMenu(category.id)}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FFC107]/20 rounded-full flex items-center justify-center text-2xl sm:text-3xl">
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-center line-clamp-2">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Popular Menu */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold">Menu Populer</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('menu')}
            className="text-[#E53935] hover:text-[#D32F2F]"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {popularItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <button
                      onClick={() => navigateToMenu(item.id)}
                      className="flex-shrink-0"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-3xl">🍗</span>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                          {item.isPopular && (
                            <Flame className="w-4 h-4 text-[#E53935] flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#FFC107] text-[#FFC107]" />
                            <span className="font-medium text-gray-700">
                              {(item.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <span>•</span>
                          <span>{item.reviewCount || 0} ulasan</span>
                          {item.spicyLevel && item.spicyLevel > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#E53935]">
                                Level {item.spicyLevel} 🌶️
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#E53935] text-lg">
                          Rp{item.price.toLocaleString('id-ID')}
                        </p>

                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                        >
                          + Tambah
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
