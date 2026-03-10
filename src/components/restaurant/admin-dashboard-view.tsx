'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingBag, Package, TrendingUp, Users, Clock, CheckCircle, XCircle, DollarSign, UserPlus, Gift, FileText } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalUsers: number;
}

export function AdminDashboardView() {
  const { goBack, setCurrentView } = useUIStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: ShoppingBag,
      label: 'Kelola Pesanan',
      description: 'Lihat dan kelola pesanan masuk',
      count: stats.pendingOrders + stats.processingOrders,
      color: 'bg-red-100 text-red-600',
      onClick: () => setCurrentView('admin-orders'),
    },
    {
      icon: Package,
      label: 'Kelola Menu',
      description: 'Tambah, edit, atau hapus menu',
      color: 'bg-blue-100 text-blue-600',
      onClick: () => setCurrentView('admin-menu'),
    },
    {
      icon: FileText,
      label: 'Laporan Keuangan',
      description: 'Lihat dan cetak laporan keuangan',
      color: 'bg-green-100 text-green-600',
      onClick: () => setCurrentView('admin-financial-report'),
    },
    {
      icon: UserPlus,
      label: 'Manajemen Kasir',
      description: 'Kelola akun kasir',
      color: 'bg-purple-100 text-purple-600',
      onClick: () => setCurrentView('cashier-management'),
    },
    {
      icon: Gift,
      label: 'Manajemen Rewards',
      description: 'Kelola reward dan penukaran',
      color: 'bg-amber-100 text-amber-600',
      onClick: () => setCurrentView('admin-rewards'),
    },
  ];

  const statCards = [
    {
      icon: ShoppingBag,
      label: 'Total Pesanan',
      value: stats.totalOrders,
      subvalue: `+${stats.todayOrders} hari ini`,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: DollarSign,
      label: 'Total Pendapatan',
      value: formatCurrency(stats.totalRevenue),
      subvalue: formatCurrency(stats.todayRevenue) + ' hari ini',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Users,
      label: 'Total Pelanggan',
      value: stats.totalUsers,
      subvalue: 'Terdaftar',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Clock,
      label: 'Pesanan Menunggu',
      value: stats.pendingOrders,
      subvalue: 'Perlu diproses',
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  const orderStatusCards = [
    {
      icon: Clock,
      label: 'Pending',
      value: stats.pendingOrders,
      color: 'bg-orange-100 text-orange-600 border-orange-200',
    },
    {
      icon: Package,
      label: 'Diproses',
      value: stats.processingOrders,
      color: 'bg-blue-100 text-blue-600 border-blue-200',
    },
    {
      icon: CheckCircle,
      label: 'Selesai',
      value: stats.completedOrders,
      color: 'bg-green-100 text-green-600 border-green-200',
    },
    {
      icon: XCircle,
      label: 'Dibatalkan',
      value: stats.cancelledOrders,
      color: 'bg-red-100 text-red-600 border-red-200',
    },
  ];

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard Admin</h1>
          <p className="text-sm text-gray-500">Selamat datang, Administrator</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subvalue}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {orderStatusCards.map((status) => (
              <div
                key={status.label}
                className={`p-4 rounded-lg border ${status.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <status.icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{status.label}</span>
                  </div>
                  <span className="text-xl font-bold">{status.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu Cepat</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="divide-y">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.label}</p>
                      {item.count !== undefined && item.count > 0 && (
                        <Badge variant="destructive" className="h-5 px-2 text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-gray-400"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <Button
        onClick={fetchDashboardStats}
        disabled={loading}
        variant="outline"
        className="w-full"
      >
        {loading ? 'Memuat...' : 'Refresh Data'}
      </Button>
    </div>
  );
}
