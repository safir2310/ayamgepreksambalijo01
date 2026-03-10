'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Package, CheckCircle, XCircle, Truck, Search, Filter } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  menuId: string;
  menu: {
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  options?: string;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  address?: string;
  user?: {
    name?: string;
    phone?: string;
  };
  createdAt: string;
  items: OrderItem[];
}

type OrderStatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

export function AdminOrdersView() {
  const { goBack } = useUIStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${statusFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status pesanan berhasil diperbarui');
        fetchOrders();
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error('Gagal memperbarui status pesanan');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Gagal memperbarui status pesanan');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { icon: Clock, label: 'Menunggu', color: 'bg-orange-100 text-orange-600' };
      case 'CONFIRMED':
        return { icon: CheckCircle, label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-600' };
      case 'PROCESSING':
        return { icon: Package, label: 'Diproses', color: 'bg-purple-100 text-purple-600' };
      case 'READY':
        return { icon: CheckCircle, label: 'Siap', color: 'bg-green-100 text-green-600' };
      case 'DELIVERING':
        return { icon: Truck, label: 'Diantar', color: 'bg-cyan-100 text-cyan-600' };
      case 'COMPLETED':
        return { icon: CheckCircle, label: 'Selesai', color: 'bg-green-100 text-green-600' };
      case 'CANCELLED':
        return { icon: XCircle, label: 'Dibatalkan', color: 'bg-red-100 text-red-600' };
      default:
        return { icon: Clock, label: status, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.user?.phone?.includes(searchQuery)
  );

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, string> = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PROCESSING',
      'PROCESSING': 'READY',
      'READY': 'DELIVERING',
      'DELIVERING': 'COMPLETED',
    };
    return statusFlow[currentStatus];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-display font-bold">Kelola Pesanan</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="PENDING">Menunggu</SelectItem>
                <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                <SelectItem value="PROCESSING">Diproses</SelectItem>
                <SelectItem value="READY">Siap</SelectItem>
                <SelectItem value="DELIVERING">Diantar</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchOrders} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Memuat pesanan...</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Tidak ada pesanan</p>
            <p className="text-sm text-gray-400">
              {searchQuery || statusFilter !== 'all'
                ? 'Coba ubah filter atau pencarian'
                : 'Belum ada pesanan masuk'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const nextStatus = getNextStatus(order.status);

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{order.orderNumber}</h3>
                        <Badge className={`${statusInfo.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#E53935]">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} item</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-medium">
                      {order.user?.name || 'Guest'} - {order.user?.phone || '-'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailDialogOpen(true);
                      }}
                    >
                      Detail
                    </Button>

                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                      >
                        {statusInfo.label} → {getStatusInfo(nextStatus).label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedOrder.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <Badge className={getStatusInfo(selectedOrder.status).color}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informasi Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nama: </span>
                    <span className="font-medium">{selectedOrder.user?.name || 'Guest'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Telepon: </span>
                    <span className="font-medium">{selectedOrder.user?.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Alamat: </span>
                    <span className="font-medium">{selectedOrder.address || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Item Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.menu.name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} x {formatCurrency(item.price)}
                            {item.options && <span className="ml-2">• {item.options}</span>}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Biaya Pengiriman</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-[#E53935]">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Catatan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'CANCELLED');
                      setDetailDialogOpen(false);
                    }}
                  >
                    Batalkan
                  </Button>
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      className="flex-1 bg-[#E53935] hover:bg-[#D32F2F] text-white"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!);
                        setDetailDialogOpen(false);
                      }}
                    >
                      {getStatusInfo(selectedOrder.status).label} → {getStatusInfo(getNextStatus(selectedOrder.status)!).label}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
