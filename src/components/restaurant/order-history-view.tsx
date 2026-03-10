'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, Package, Truck, Home, XCircle, ChefHat, Calendar, Filter, Printer } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    menu: {
      name: string;
    };
  }>;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', icon: Clock, color: 'bg-orange-100 text-orange-600 border-orange-200' },
  CONFIRMED: { label: 'Dikonfirmasi', icon: CheckCircle2, color: 'bg-blue-100 text-blue-600 border-blue-200' },
  PROCESSING: { label: 'Diproses', icon: ChefHat, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  READY: { label: 'Siap', icon: Package, color: 'bg-green-100 text-green-600 border-green-200' },
  DELIVERING: { label: 'Diantar', icon: Truck, color: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
  COMPLETED: { label: 'Selesai', icon: CheckCircle2, color: 'bg-green-100 text-green-600 border-green-200' },
  CANCELLED: { label: 'Dibatalkan', icon: XCircle, color: 'bg-red-100 text-red-600 border-red-200' },
} as const;

export function OrderHistoryView() {
  const { goBack, navigateToOrder } = useUIStore();
  const { user } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/orders';
      
      // Filter by user if logged in
      if (user?.id) {
        url += `?userId=${user.id}`;
      }
      
      // Filter by status if selected
      if (filterStatus !== 'all') {
        url += user?.id ? `&status=${filterStatus}` : `?status=${filterStatus}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hari ini';
    } else if (diffDays === 1) {
      return 'Kemarin';
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrintReceipt = async (order: Order) => {
    try {
      // Fetch complete order details with prices
      const response = await fetch(`/api/orders/${order.id}`);
      if (!response.ok) {
        console.error('Failed to fetch order details');
        return;
      }

      const completeOrder = await response.json();
      const printWindow = window.open('', '', 'width=400,height=600');
      
      if (printWindow) {
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>Struk Pembayaran</title>
  <style>
    body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18px; }
    .line { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { font-weight: bold; font-size: 14px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>AYAM GEPREK SAMBAL IJO</h1>
    <p>Jl. Medan-Banda Aceh, Simpang Camat,<br>Gampong Tijue, 24151</p>
    <p>Telp: 085260812758</p>
  </div>
  <div class="line">
    <p><strong>No. Order:</strong> ${completeOrder.orderNumber}</p>
    <p><strong>Tanggal:</strong> ${new Date(completeOrder.createdAt).toLocaleString('id-ID')}</p>
    ${completeOrder.user ? `<p><strong>Pelanggan:</strong> ${completeOrder.user.name || completeOrder.user.phone || 'N/A'}</p>` : ''}
  </div>
  <div class="line">
    <p style="text-align:center; font-weight:bold;">RINCIAN PESANAN</p>
  </div>
  ${completeOrder.items?.map((item: any) => `
    <div class="item"><span>${item.quantity}x ${item.menu.name}</span><span>${formatCurrency(item.price * item.quantity)}</span></div>
  `).join('') || ''}
  <div class="line">
    <div class="item"><strong>Subtotal:</strong> <strong>${formatCurrency(completeOrder.subtotal || completeOrder.total)}</strong></div>
    <div class="item"><strong>Biaya Kirim:</strong> <strong>${formatCurrency(completeOrder.deliveryFee || 0)}</strong></div>
    <div class="item"><strong>Diskon:</strong> <strong>${formatCurrency(completeOrder.discount || 0)}</strong></div>
    <div class="item total"><strong>TOTAL BAYAR:</strong> <strong>${formatCurrency(completeOrder.total)}</strong></div>
  </div>
  <div class="line">
    <p><strong>Metode Pembayaran:</strong> ${completeOrder.paymentMethod || 'N/A'}</p>
    <p><strong>Status Pembayaran:</strong> ${completeOrder.paymentStatus === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}</p>
  </div>
  <div class="footer">
    <p>Terima kasih telah berbelanja!</p>
    <p>Simpan struk ini sebagai bukti pembayaran</p>
  </div>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display font-bold">Riwayat Pesanan</h1>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              size="sm"
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
            >
              Semua
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('COMPLETED')}
              className={filterStatus === 'COMPLETED' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
            >
              Selesai
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'PROCESSING' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('PROCESSING')}
              className={filterStatus === 'PROCESSING' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
            >
              Diproses
            </Button>
            <Button
              size="sm"
              variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('PENDING')}
              className={filterStatus === 'PENDING' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
            >
              Menunggu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Belum ada pesanan</p>
            <p className="text-sm text-gray-400 mb-4">
              {user ? 'Mulai pesan Ayam Geprek favoritmu' : 'Login untuk melihat riwayat pesanan'}
            </p>
            <Button
              onClick={() => goBack()}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              {user ? 'Pesan Sekarang' : 'Kembali'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">#{order.orderNumber}</h3>
                          <Badge className={`text-xs ${statusInfo.color} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#E53935] text-sm">
                          {formatCurrency(order.total)}
                        </p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintReceipt(order);
                          }}
                          title="Cetak Struk"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="border-t pt-3 cursor-pointer" onClick={() => navigateToOrder(order.id)}>
                      <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="truncate">
                            {item.menu.name} x{item.quantity}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-gray-400">
                            +{order.items.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
