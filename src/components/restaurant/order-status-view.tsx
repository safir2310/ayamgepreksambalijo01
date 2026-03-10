'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Package, Truck, Home, Phone, MapPin, ChefHat, Flame, ArrowLeft } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  notes?: string;
  address?: string;
  estimatedTime?: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menu: {
      id: string;
      name: string;
      image?: string;
    };
  }>;
}

const ORDER_STEPS = [
  { id: 'PENDING', label: 'Menunggu Konfirmasi', icon: Clock },
  { id: 'CONFIRMED', label: 'Dikonfirmasi', icon: CheckCircle2 },
  { id: 'PROCESSING', label: 'Sedang Diproses', icon: ChefHat },
  { id: 'READY', label: 'Siap Diantar', icon: Package },
  { id: 'DELIVERING', label: 'Sedang Diantar', icon: Truck },
  { id: 'COMPLETED', label: 'Selesai', icon: Home },
] as const;

export function OrderStatusView() {
  const { selectedOrderId, setCurrentView, goBack } = useUIStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!selectedOrderId) {
          // If no specific order ID, fetch the most recent order for current user
          const { user } = await import('@/store/user-store').then(m => m.useUserStore.getState());
          const url = user?.id ? `/api/orders?userId=${user.id}` : '/api/orders';
          
          const response = await fetch(url);
          if (response.ok) {
            const orders = await response.json();
            if (orders.length > 0) {
              setOrder(orders[0]);
            }
          }
        } else {
          // Fetch specific order by ID
          const response = await fetch(`/api/orders/${selectedOrderId}`);
          if (response.ok) {
            const data = await response.json();
            setOrder(data);
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [selectedOrderId]);

  const currentStepIndex = order
    ? ORDER_STEPS.findIndex((step) => step.id === order.status)
    : -1;

  const handleNewOrder = () => {
    setCurrentView('menu');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Tidak ada pesanan ditemukan</p>
        <Button onClick={handleNewOrder} className="bg-[#E53935] hover:bg-[#D32F2F] text-white">
          Buat Pesanan Baru
        </Button>
      </div>
    );
  }

  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Detail Pesanan</h1>
      </div>

      {/* Order Header */}
      <div className="text-center space-y-2">
        {isCompleted ? (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        ) : isCancelled ? (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <div className="w-10 h-10 text-red-600 text-2xl">✕</div>
          </div>
        ) : (
          <div className="w-16 h-16 bg-[#E53935]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame className="w-10 h-10 text-[#E53935] animate-pulse" />
          </div>
        )}

        <h1 className="text-2xl font-display font-bold">
          {isCompleted
            ? 'Pesanan Selesai! 🎉'
            : isCancelled
            ? 'Pesanan Dibatalkan'
            : 'Pesanan Sedang Diproses'}
        </h1>
        <p className="text-gray-500">
          Order #{order.orderNumber}
        </p>
      </div>

      {/* Progress Steps */}
      {!isCancelled && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Progress Bar */}
              <Progress
                value={((currentStepIndex + 1) / ORDER_STEPS.length) * 100}
                className="h-2"
              />

              {/* Steps */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6">
                {ORDER_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isPast = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isFuture = index > currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center text-center ${
                        index % 2 === 0 ? 'col-span-1' : 'col-span-1'
                      } ${index >= 3 ? 'hidden sm:flex' : ''}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          isPast || isCurrent
                            ? 'bg-[#E53935] text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`text-xs font-medium ${
                          isCurrent ? 'text-[#E53935]' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estimated Time */}
      {!isCompleted && !isCancelled && order.estimatedTime && (
        <Card className="bg-[#FFC107]/10 border-[#FFC107]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#E53935]" />
                <div>
                  <p className="font-semibold">Estimasi Waktu</p>
                  <p className="text-sm text-gray-600">
                    Pesanan akan sampai dalam {order.estimatedTime} menit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Detail Pesanan</h3>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                {item.menu.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.menu.image}
                      alt={item.menu.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.menu.name}</p>
                  <p className="text-sm text-gray-500">x{item.quantity}</p>
                </div>
                <p className="font-semibold">
                  Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Metode Pembayaran</span>
              <span className="font-medium text-gray-900">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Status Pembayaran</span>
              <span className="font-medium text-gray-900">
                {order.paymentStatus}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-[#E53935]">
                Rp{order.total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      {order.address && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#E53935] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#E53935]" />
            <div>
              <p className="font-semibold mb-1">Butuh Bantuan?</p>
              <a
                href="https://wa.me/6285260812758"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E53935] font-medium hover:underline"
              >
                Hubungi Kami di WhatsApp
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Order Button */}
      <Button
        onClick={handleNewOrder}
        className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-14 text-base font-semibold"
      >
        Buat Pesanan Baru
      </Button>
    </div>
  );
}
