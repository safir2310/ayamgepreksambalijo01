'use client';

import { useEffect, useState } from 'react';
import { Star, Flame, Search, Filter, Percent, Sparkles, Clock, Tag } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  spicyLevel?: number;
  isPopular: boolean;
  isPromo: boolean;
  createdAt: string;
}

export function MenuView() {
  const { navigateToMenu } = useUIStore();
  const { addItem } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((res) => res.json()),
      fetch('/api/menu?available=true').then((res) => res.json()),
    ])
      .then(([categoriesData, menuData]) => {
        setCategories(categoriesData);
        setMenuItems(menuData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Check if item is new (created within 7 days)
  const isNewItem = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  };

  // Calculate discounted price
  const getDiscountedPrice = (price: number, discountPercent: number) => {
    if (discountPercent > 0) {
      return price - (price * discountPercent / 100);
    }
    return price;
  };

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
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari menu favoritmu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 border-gray-200 focus:border-[#E53935]"
        />
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-[#E53935] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-[#E53935] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Menu Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="w-full aspect-square rounded-xl mb-4" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Menu tidak ditemukan</h3>
            <p className="text-gray-500">Coba kata kunci lain atau ubah kategori</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredItems.map((item) => {
              const discountedPrice = getDiscountedPrice(item.price, item.discountPercent);
              const isDiscounted = item.discountPercent > 0;
              const isNew = isNewItem(item.createdAt);
              
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigateToMenu(item.id)}
                >
                  <CardContent className="p-5">
                    {/* Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                          🍗
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                        {item.isPromo && (
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <Tag className="w-3 h-3" />
                            Promo
                          </div>
                        )}
                        {isDiscounted && (
                          <div className="bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <Percent className="w-3 h-3" />
                            {item.discountPercent}%
                          </div>
                        )}
                        {isNew && (
                          <div className="bg-blue-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <Sparkles className="w-3 h-3" />
                            Baru
                          </div>
                        )}
                        {item.isPopular && (
                          <div className="bg-[#E53935] text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <Flame className="w-3 h-3" />
                            Populer
                          </div>
                        )}
                      </div>
                      
                      {/* Spicy level badge */}
                      {item.spicyLevel && item.spicyLevel > 0 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
                          🌶️ {item.spicyLevel}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-base line-clamp-2 min-h-[40px] leading-snug">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-[#FFC107] text-[#FFC107]" />
                        <span className="font-medium text-gray-700">
                          {(item.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                          {isDiscounted ? (
                            <>
                              <p className="font-bold text-[#E53935] text-base">
                                Rp{Math.round(discountedPrice).toLocaleString('id-ID')}
                              </p>
                              <p className="text-sm text-gray-400 line-through">
                                Rp{item.price.toLocaleString('id-ID')}
                              </p>
                            </>
                          ) : (
                            <p className="font-bold text-[#E53935] text-base">
                              Rp{item.price.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart({
                              ...item,
                              price: discountedPrice
                            });
                          }}
                          className="bg-[#E53935] hover:bg-[#D32F2F] text-white h-10 w-10 p-0 text-lg flex items-center justify-center shadow-md"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
