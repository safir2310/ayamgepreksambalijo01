'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, ShoppingCart, DollarSign, Printer, Clock, LogOut, CheckCircle2, X, XCircle, Scan, Wallet, CreditCard, RefreshCw, Receipt, Bell, Lock, ChevronDown, User } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price: number;
  category: string;
  categoryId: string;
  available: boolean;
  spicyLevel: number | null;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export function CashierPOSView() {
  const { goBack, setCurrentView } = useUIStore();
  const { user, logout, isAuthenticated, isCashier, hasHydrated } = useUserStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [ewalletProvider, setEwalletProvider] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [todaySales, setTodaySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [cashReceived, setCashReceived] = useState('');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedOnlineOrder, setSelectedOnlineOrder] = useState<any>(null);
  const [cashierPassword, setCashierPassword] = useState('');
  const [isPrePaid, setIsPrePaid] = useState(false);
  const [prePaidOrderInfo, setPrePaidOrderInfo] = useState<any>(null);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [closeShiftDialogOpen, setCloseShiftDialogOpen] = useState(false);
  const [actualCashCount, setActualCashCount] = useState('');
  const [shiftSummaryOpen, setShiftSummaryOpen] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<any>(null);

  // Daily sales report dialog states
  const [dailySalesDialogOpen, setDailySalesDialogOpen] = useState(false);
  const [dailySalesInput, setDailySalesInput] = useState('');
  const [dailySalesData, setDailySalesData] = useState<any>(null);

  // Check authentication and role
  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !isCashier)) {
      setCurrentView('login');
    }
  }, [hasHydrated, isAuthenticated, isCashier, setCurrentView]);

  useEffect(() => {
    if (isAuthenticated && isCashier) {
      fetchMenuItems();
      fetchTodayStats();
      fetchOnlineOrders();
      fetchCurrentShift(true); // Auto-open shift on initial load
    }
  }, [isAuthenticated, isCashier]);

  // Update time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Countdown timer for auto-refresh
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Reset to 5 seconds
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  // Auto-refresh data every 5 seconds (improved real-time sync with database)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setRefreshCountdown(5);
      Promise.all([
        fetchMenuItems(),
        fetchTodayStats(),
        fetchOnlineOrders(),
        fetchCurrentShift()
      ]).finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
    }, 5000); // Refresh every 5 seconds for better sync

    return () => clearInterval(interval);
  }, []);

  // Sync when window/tab becomes visible (after being in background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && isCashier) {
        setIsRefreshing(true);
        Promise.all([
          fetchMenuItems(),
          fetchTodayStats(),
          fetchOnlineOrders(),
          fetchCurrentShift()
        ]).finally(() => {
          setTimeout(() => setIsRefreshing(false), 500);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, isCashier]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);

        // Extract unique categories
        const cats = Array.from(new Set(data.map((item: MenuItem) => item.category)));
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast.error('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setTodaySales(data.todayRevenue);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOnlineOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=PENDING');
      if (response.ok) {
        const data = await response.json();
        // Filter out orders from current cashier and orders that are already processing (to show only online orders)
        const onlineOnly = data.filter((order: any) => order.userId !== user?.id && order.status === 'PENDING');
        setOnlineOrders(onlineOnly);
      }
    } catch (error) {
      console.error('Error fetching online orders:', error);
    }
  };

  const fetchCurrentShift = async (autoOpen: boolean = false) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/shifts/active?cashierId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentShift(data.shift);
      } else {
        // No active shift
        setCurrentShift(null);
        // Only auto-open shift if explicitly requested (e.g., on initial load)
        if (autoOpen) {
          await autoOpenShift();
        }
      }
    } catch (error) {
      console.error('Error fetching current shift:', error);
    }
  };

  const autoOpenShift = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cashierId: user.id,
          openingBalance: 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentShift(data);
        toast.success('Shift otomatis dibuka');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal membuka shift otomatis');
      }
    } catch (error) {
      console.error('Error auto-opening shift:', error);
    }
  };

  const handleCloseShift = () => {
    setCloseShiftDialogOpen(true);
  };

  const confirmCloseShift = async () => {
    if (!currentShift || !user?.id) return;

    try {
      setProcessing(true);

      const response = await fetch(`/api/shifts/${currentShift.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closingBalance: parseInt(actualCashCount) || 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShiftSummary(data);
        setShiftSummaryOpen(true);
        setCloseShiftDialogOpen(false);
        setCurrentShift(null);
        setActualCashCount('');
        toast.success('Shift berhasil ditutup!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menutup shift');
      }
    } catch (error) {
      console.error('Error closing shift:', error);
      toast.error('Gagal menutup shift');
    } finally {
      setProcessing(false);
    }
  };

  const takeOrder = async (order: any) => {
    setSelectedOnlineOrder(order);
    setCashierPassword(''); // Reset password when opening dialog
    setAuthDialogOpen(true);
  };

  const confirmTakeOrder = async () => {
    if (!selectedOnlineOrder) return;

    try {
      // Verify cashier password
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user?.username,
          password: cashierPassword,
        }),
      });

      if (!response.ok) {
        toast.error('Password salah!');
        return;
      }

      // Check if order is prepaid
      const isPaid = selectedOnlineOrder.paymentStatus === 'PAID';

      // Add order items to cart
      selectedOnlineOrder.items.forEach((item: any) => {
        const existingItem = cart.find((c) => c.menuItemId === item.menuId);

        if (existingItem) {
          setCart(cart.map((c) =>
            c.menuItemId === item.menuId
              ? { ...c, quantity: c.quantity + item.quantity, notes: item.notes || c.notes }
              : c
          ));
        } else {
          setCart((prevCart) => [...prevCart, {
            menuItemId: item.menuId,
            name: item.menu?.name || item.customName || 'Item',
            price: item.price,
            quantity: item.quantity,
            notes: item.notes || '',
          }]);
        }
      });

      // Update order status to PROCESSING
      const updateResponse = await fetch(`/api/admin/orders/${selectedOnlineOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PROCESSING' }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Gagal memperbarui status pesanan');
      }

      // Set prepaid info if applicable
      if (isPaid) {
        setIsPrePaid(true);
        setPrePaidOrderInfo({
          orderId: selectedOnlineOrder.id,
          orderNumber: selectedOnlineOrder.orderNumber,
          paymentMethod: selectedOnlineOrder.paymentMethod,
        });
      }

      // Remove from online orders list
      setOnlineOrders(onlineOrders.filter((o) => o.id !== selectedOnlineOrder.id));

      toast.success(`Pesanan ${selectedOnlineOrder.orderNumber} berhasil diambil!`);
      setNotificationOpen(false);
      setAuthDialogOpen(false);
      setCashierPassword('');
      setSelectedOnlineOrder(null);
    } catch (error: any) {
      console.error('Error taking order:', error);
      toast.error(error.message || 'Gagal mengambil pesanan');
    }
  };

  const markOrderAsCancelled = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        setOnlineOrders(onlineOrders.filter((o) => o.id !== orderId));
        toast.success('Pesanan ditolak');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Gagal menolak pesanan');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Gagal menolak pesanan');
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItem.id);

    if (existingItem) {
      setCart(cart.map((item) =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: '',
      }]);
    }
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart(cart.map((item) =>
      item.menuItemId === menuItem.id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCart(cart.map((item) =>
      item.menuItemId === menuItem.id
        ? { ...item, notes }
        : item
    ));
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((item) => item.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
    setIsPrePaid(false);
    setPrePaidOrderInfo(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    // If it's a prepaid order, process directly without payment dialog
    if (isPrePaid) {
      await processOrder();
    } else {
      setPaymentDialogOpen(true);
    }
  };

  const processOrder = async () => {
    if (!user?.id) {
      toast.error('Session expired, silakan login kembali');
      return;
    }

    // If it's a prepaid order, update existing order
    if (isPrePaid && prePaidOrderInfo) {
      try {
        setProcessing(true);

        // Update order status to COMPLETED
        const updateResponse = await fetch(`/api/admin/orders/${prePaidOrderInfo.orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            notes: `Processed by cashier: ${user?.name}`,
          }),
        });

        if (updateResponse.ok) {
          const orderResult = await updateResponse.json();

          // Set completed order data for receipt
          setCompletedOrder({
            ...orderResult.order,
            items: cart.map((item) => ({
              ...item,
              totalPrice: item.price * item.quantity
            }))
          });

          // Show success message with points earned
          const pointsEarned = orderResult.pointsEarned || 0;
          if (pointsEarned > 0) {
            toast.success(`✅ Pesanan selesai! +${pointsEarned} point`);
          } else {
            toast.success('✅ Pesanan selesai!');
          }
          setReceiptDialogOpen(true);
          setTimeout(() => {
            handlePrintReceipt();
          }, 1000);

          clearCart();
          setIsPrePaid(false);
          setPrePaidOrderInfo(null);
          fetchTodayStats();
        } else {
          toast.error('Gagal memproses pesanan');
        }
      } catch (error) {
        console.error('Error processing prepaid order:', error);
        toast.error('Gagal memproses pesanan');
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Regular order flow (not prepaid)
    // Validate payment method specific fields
    if (paymentMethod === 'ewallet' && !ewalletProvider) {
      toast.error('Pilih provider e-wallet');
      return;
    }

    // Validate cash payment
    if (paymentMethod === 'cash' && !isCashSufficient()) {
      toast.error('Jumlah uang tunai kurang!');
      return;
    }

    try {
      setProcessing(true);

      // Build payment details
      let paymentDetails = paymentMethod.toUpperCase();
      if (paymentMethod === 'ewallet') {
        paymentDetails = `E-WALLET (${ewalletProvider.toUpperCase()})`;
      } else if (paymentMethod === 'debit_card') {
        paymentDetails = 'KARTU DEBIT';
      }

      const orderData = {
        userId: user.id,
        items: cart.map((item) => ({
          menuId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        notes: `${paymentMethod ? `Payment: ${paymentDetails}` : ''}${paymentMethod === 'cash' ? `, Cash Received: Rp${parseInt(cashReceived).toLocaleString('id-ID')}, Change: Rp${calculateChange().toLocaleString('id-ID')}` : ''}`,
        paymentMethod: paymentDetails,
        paymentStatus: 'PAID',
        subtotal: cartTotal,
        deliveryFee: 0,
        discount: 0,
        total: cartTotal,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResult = await response.json();

        // Set completed order data for receipt
        setCompletedOrder({
          ...orderResult,
          items: cart.map((item) => ({
            ...item,
            totalPrice: item.price * item.quantity
          }))
        });

        toast.success('✅ Order berhasil dibuat!');
        setPaymentDialogOpen(false);

        // Show receipt dialog and auto print
        setReceiptDialogOpen(true);
        setTimeout(() => {
          handlePrintReceipt();
        }, 1000);

        clearCart();
        setEwalletProvider('');
        setCashReceived('');
        fetchTodayStats();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal membuat order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Gagal membuat order');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    // Open daily sales input dialog
    await fetchDailySalesData();
    setDailySalesDialogOpen(true);
  };

  const fetchDailySalesData = async () => {
    try {
      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Fetch completed orders for today
      const response = await fetch(
        `/api/orders?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}&status=COMPLETED`
      );

      if (response.ok) {
        const orders = await response.json();

        // Calculate payment method breakdown
        let cashPayments = 0;
        let cardPayments = 0;
        let ewalletPayments = 0;
        let qrisPayments = 0;

        orders.forEach((order: any) => {
          const paymentMethod = order.paymentMethod?.toUpperCase() || '';
          if (paymentMethod === 'CASH' || paymentMethod === 'TUNAI') {
            cashPayments += order.total;
          } else if (paymentMethod.includes('KARTU') || paymentMethod.includes('DEBIT') || paymentMethod.includes('CREDIT CARD')) {
            cardPayments += order.total;
          } else if (paymentMethod.includes('E-WALLET') || paymentMethod.includes('GOPAY') || paymentMethod.includes('OVO') || paymentMethod.includes('DANA') || paymentMethod.includes('SHOPEEPAY')) {
            ewalletPayments += order.total;
          } else if (paymentMethod.includes('QRIS')) {
            qrisPayments += order.total;
          }
        });

        const totalSales = orders.reduce((sum: number, order: any) => sum + order.total, 0);

        setDailySalesData({
          orders,
          totalOrders: orders.length,
          totalSales,
          cashPayments,
          cardPayments,
          ewalletPayments,
          qrisPayments,
        });
      } else {
        toast.error('Gagal mengambil data penjualan');
      }
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      toast.error('Gagal mengambil data penjualan');
    }
  };

  const handleGenerateDailySalesReport = () => {
    if (!dailySalesInput || !dailySalesData) {
      toast.error('Silakan input jumlah uang tunai');
      return;
    }

    const actualCash = parseInt(dailySalesInput) || 0;
    const expectedCash = dailySalesData.cashPayments;
    const cashDifference = actualCash - expectedCash;

    setDailySalesData({
      ...dailySalesData,
      actualCash,
      expectedCash,
      cashDifference,
    });
    toast.success('Selisih dihitung. Silakan cetak laporan.');
  };

  const handleLogoutConfirm = async () => {
    // If there's an active shift, close it first
    if (currentShift) {
      setDailySalesDialogOpen(false);
      setCloseShiftDialogOpen(true);
      toast.info('Silakan tutup shift terlebih dahulu');
      return;
    }

    // If no active shift, proceed with logout
    await logout();
    toast.success('Kasir berhasil ditutup');
    setCurrentView('login');
    setDailySalesDialogOpen(false);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      fetchMenuItems(),
      fetchTodayStats(),
      fetchOnlineOrders(),
      fetchCurrentShift()
    ]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
    toast.success('Data diperbarui');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = () => {
    const received = parseInt(cashReceived) || 0;
    return Math.max(0, received - cartTotal);
  };

  const isCashSufficient = () => {
    const received = parseInt(cashReceived) || 0;
    return received >= cartTotal;
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow && completedOrder) {
      printWindow.document.write(generateReceiptHTML());
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generateReceiptHTML = () => {
    if (!completedOrder) return '';

    const total = completedOrder.total || cartTotal;
    const change = paymentMethod === 'cash' ? calculateChange() : 0;
    const received = parseInt(cashReceived) || 0;
    const isPrepaidOrder = isPrePaid || completedOrder.paymentStatus === 'PAID';

    let effectivePaymentMethod = paymentMethod;
    let effectivePaymentMethodText = 'Tunai';
    let cashDetailsHtml = '';

    if (isPrepaidOrder && prePaidOrderInfo) {
      effectivePaymentMethodText = prePaidOrderInfo.paymentMethod || 'Sudah Dibayar';
      cashDetailsHtml = `<div class="item" style="color: green; font-weight: bold; font-size: 14px;"><strong>STATUS: LUNAS</strong></div>`;
    } else {
      const change = paymentMethod === 'cash' ? calculateChange() : 0;
      const received = parseInt(cashReceived) || 0;

      if (paymentMethod === 'cash') {
        cashDetailsHtml = `<div class="item"><strong>Tunai Diterima:</strong> <strong>${formatCurrency(received)}</strong></div><div class="item"><strong>Kembalian:</strong> <strong>${formatCurrency(change)}</strong></div>`;
      }

      if (paymentMethod === 'qris') {
        effectivePaymentMethodText = 'QRIS';
      } else if (paymentMethod === 'ewallet') {
        effectivePaymentMethodText = `E-Wallet (${ewalletProvider})`;
      } else if (paymentMethod === 'debit_card') {
        effectivePaymentMethodText = 'Kartu Debit';
      }
    }

    const itemsHtml = (completedOrder.items || cart).map((item, index) => {
      const qty = item.quantity;
      const name = item.name;
      const price = formatCurrency(item.price * item.quantity);
      return `<div class="item"><span>${qty}x ${name}</span><span>${price}</span></div>`;
    }).join('');

    const orderInfo = `
      <div class="line">
        <p><strong>No. Order:</strong> ${completedOrder.orderNumber || 'N/A'}</p>
        <p><strong>Tanggal:</strong> ${new Date().toLocaleString('id-ID')}</p>
        <p><strong>Kasir:</strong> ${user?.name || user?.username || 'N/A'}</p>
      </div>
    `;

    const totalsHtml = `
      <div class="line">
        <div class="item"><strong>Subtotal:</strong> <strong>${formatCurrency(total)}</strong></div>
        <div class="item"><strong>Pajak (0%):</strong> <strong>Rp 0</strong></div>
        ${cashDetailsHtml}
        <div class="item total"><strong>TOTAL BAYAR:</strong> <strong>${formatCurrency(total)}</strong></div>
      </div>
    `;

    const paymentHtml = `
      <div class="line">
        <p><strong>Metode Pembayaran:</strong> ${effectivePaymentMethodText}</p>
      </div>
    `;

    return `<!DOCTYPE html>
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
  ${orderInfo}
  <div class="line">
    <p style="text-align:center; font-weight:bold;">RINCIAN PESANAN</p>
  </div>
  ${itemsHtml}
  ${totalsHtml}
  ${paymentHtml}
  <div class="footer">
    <p>Terima kasih telah berbelanja!</p>
    <p>Simpan struk ini sebagai bukti pembayaran</p>
  </div>
</body>
</html>`;
  };

  const handlePrintShiftReport = () => {
    if (!shiftSummary) return;

    const printWindow = window.open('', '', 'width=600,height=800');
    if (printWindow) {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Laporan Shift - ${shiftSummary.shiftNumber}</title>
  <style>
    body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18px; }
    .line { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { font-weight: bold; font-size: 14px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    .section { margin-bottom: 15px; }
    .section-title { font-weight: bold; margin-bottom: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>AYAM GEPREK SAMBAL IJO</h1>
    <p>Laporan Penjualan Shift</p>
    <p>Jl. Medan-Banda Aceh, Simpang Camat, Gampong Tijue, 24151</p>
  </div>
  <div class="line">
    <div class="item"><strong>No. Shift:</strong> <strong>${shiftSummary.shiftNumber}</strong></div>
    <div class="item"><strong>Kasir:</strong> <strong>${shiftSummary.cashier?.name || shiftSummary.cashier?.username || 'N/A'}</strong></div>
    <div class="item"><strong>Mulai:</strong> <strong>${new Date(shiftSummary.startTime).toLocaleString('id-ID')}</strong></div>
    <div class="item"><strong>Selesai:</strong> <strong>${new Date(shiftSummary.endTime || new Date()).toLocaleString('id-ID')}</strong></div>
  </div>
  <div class="section">
    <div class="section-title">RINGKASAN PENJUALAN</div>
    <div class="line">
      <div class="item"><strong>Total Penjualan:</strong> <strong>${formatCurrency(shiftSummary.totalSales)}</strong></div>
      <div class="item"><strong>Total Order:</strong> <strong>${shiftSummary.totalOrders}</strong></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">RINCIAN PEMBAYARAN</div>
    <div class="line">
      <div class="item"><span>Tunai:</span> <span>${formatCurrency(shiftSummary.cashReceived)}</span></div>
      <div class="item"><span>Kartu Debit:</span> <span>${formatCurrency(shiftSummary.cardPayments)}</span></div>
      <div class="item"><span>E-Wallet:</span> <span>${formatCurrency(shiftSummary.ewalletPayments)}</span></div>
      <div class="item"><span>QRIS:</span> <span>${formatCurrency(shiftSummary.qrisPayments)}</span></div>
      <div class="item total"><strong>Total:</strong> <strong>${formatCurrency(shiftSummary.cashReceived + shiftSummary.cardPayments + shiftSummary.ewalletPayments + shiftSummary.qrisPayments)}</strong></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">REKONSILIASI TUNAI</div>
    <div class="line">
      <div class="item"><span>Tunai Diterima:</span> <span>${formatCurrency(shiftSummary.cashReceived)}</span></div>
      <div class="item"><strong>Harus Ada:</strong> <strong>${formatCurrency(shiftSummary.cashReceived)}</strong></div>
      <div class="item"><strong>Uang Aktual:</strong> <strong>${formatCurrency(shiftSummary.closingBalance || 0)}</strong></div>
      <div class="item total"><strong>Selisih:</strong> <strong>${formatCurrency(Math.abs(shiftSummary.cashDifference || 0))} ${shiftSummary.cashDifference === 0 ? '(Sesuai)' : shiftSummary.cashDifference > 0 ? '(Lebih)' : '(Kurang)'}</strong></div>
    </div>
  </div>
  <div class="footer">
    <p>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
  </div>
</body>
</html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintDailySalesReport = () => {
    if (!dailySalesData) return;

    const printWindow = window.open('', '', 'width=600,height=800');
    if (printWindow) {
      const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Laporan Penjualan Harian</title>
  <style>
    body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 18px; }
    .line { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
    .item { display: flex; justify-content: space-between; margin: 5px 0; }
    .total { font-weight: bold; font-size: 14px; }
    .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    .section { margin-bottom: 15px; }
    .section-title { font-weight: bold; margin-bottom: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>AYAM GEPREK SAMBAL IJO</h1>
    <p>Laporan Penjualan Harian</p>
    <p>Jl. Medan-Banda Aceh, Simpang Camat, Gampong Tijue, 24151</p>
  </div>
  <div class="line">
    <div class="item"><strong>Tanggal:</strong> <strong>${today}</strong></div>
    <div class="item"><strong>Kasir:</strong> <strong>${user?.name || user?.username || 'N/A'}</strong></div>
  </div>
  <div class="section">
    <div class="section-title">RINGKASAN PENJUALAN</div>
    <div class="line">
      <div class="item"><strong>Total Penjualan:</strong> <strong>${formatCurrency(dailySalesData.totalSales)}</strong></div>
      <div class="item"><strong>Total Order:</strong> <strong>${dailySalesData.totalOrders}</strong></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">RINCIAN PEMBAYARAN</div>
    <div class="line">
      <div class="item"><span>Tunai:</span> <span>${formatCurrency(dailySalesData.cashPayments)}</span></div>
      <div class="item"><span>Kartu Debit:</span> <span>${formatCurrency(dailySalesData.cardPayments)}</span></div>
      <div class="item"><span>E-Wallet:</span> <span>${formatCurrency(dailySalesData.ewalletPayments)}</span></div>
      <div class="item"><span>QRIS:</span> <span>${formatCurrency(dailySalesData.qrisPayments)}</span></div>
      <div class="item total"><strong>Total:</strong> <strong>${formatCurrency(dailySalesData.totalSales)}</strong></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">REKONSILIASI TUNAI</div>
    <div class="line">
      <div class="item"><span>Tunai Diterima:</span> <span>${formatCurrency(dailySalesData.cashPayments)}</span></div>
      <div class="item"><strong>Harus Ada:</strong> <strong>${formatCurrency(dailySalesData.cashPayments)}</strong></div>
      ${dailySalesData.actualCash !== undefined ? `
      <div class="item"><strong>Uang Aktual:</strong> <strong>${formatCurrency(dailySalesData.actualCash)}</strong></div>
      <div class="item total"><strong>Selisih:</strong> <strong>${formatCurrency(Math.abs(dailySalesData.cashDifference))} ${dailySalesData.cashDifference === 0 ? '(Sesuai)' : dailySalesData.cashDifference > 0 ? '(Lebih)' : '(Kurang)'}</strong></div>
      ` : ''}
    </div>
  </div>
  <div class="footer">
    <p>Laporan dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
  </div>
</body>
</html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="h-screen flex flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#E53935] text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleManualRefresh}
              className="h-9 w-9 text-white hover:bg-white/20"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationOpen(true)}
              className="h-9 w-9 text-white hover:bg-white/20 relative"
              title="Pesanan Online"
            >
              <Bell className={`w-5 h-5 ${onlineOrders.length > 0 ? 'animate-pulse' : ''}`} />
              {onlineOrders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {onlineOrders.length}
                </span>
              )}
            </Button>
            <div>
              <h1 className="text-xl font-bold">POS Kasir</h1>
              <p className="text-sm opacity-90">
                {user?.name || user?.username}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-right items-center">
            {isRefreshing ? (
              <div className="text-xs opacity-90 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memuat...</span>
              </div>
            ) : (
              <div className={`text-xs opacity-90 flex items-center gap-1 ${refreshCountdown <= 5 ? 'text-yellow-300' : ''}`}>
                <RefreshCw className="w-3 h-3" />
                <span>Auto-refresh: {refreshCountdown}s</span>
              </div>
            )}
            <div>
              <p className="text-xs opacity-90">Penjualan Hari Ini</p>
              <p className="text-lg font-bold">{formatCurrency(todaySales)}</p>
            </div>
            <div>
              <p className="text-xs opacity-90">Waktu</p>
              <p className="text-lg font-bold">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            {currentShift && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseShift}
                className="text-white border-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Tutup Shift
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 text-white border-white/30 hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Tutup Kasir
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Categories */}
          <div className="p-4 bg-white border-b">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                >
                  Semua
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Menu Items Grid */}
          <ScrollArea className="flex-1 p-4">
            {loading ? (
              <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {[...Array(9)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="h-40 bg-gray-200 rounded mb-3 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada menu ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                      onClick={() => addToCart(item)}
                    >
                      {item.image && (
                        <div className="h-40 overflow-hidden bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{item.name}</h3>
                        <p className="text-[#E53935] font-bold">{formatCurrency(item.price)}</p>
                        {item.spicyLevel && item.spicyLevel > 0 && (
                          <div className="flex gap-0.5 mt-2">
                            {[...Array(Math.min(item.spicyLevel, 5))].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-[#E53935]" />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Cart Section */}
        <div className="w-[520px] bg-white border-l flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">Keranjang</h2>
              <Badge variant="outline">{cartCount} item</Badge>
            </div>
            {isPrePaid && prePaidOrderInfo && (
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-green-100 text-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Sudah Dibayar
                </Badge>
                <span className="text-gray-500">{prePaidOrderInfo.orderNumber}</span>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4 max-h-[calc(100vh-380px)] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keranjang kosong</p>
                <p className="text-sm text-gray-400">Klik menu untuk menambah</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={item.menuItemId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className={item.quantity > 1 ? 'opacity-75' : ''}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm flex-1">{item.name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.menuItemId)}
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-[#E53935]">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItemId, -1)}
                              className="h-7 w-7"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.menuItemId, 1)}
                              className="h-7 w-7"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Catatan..."
                          value={item.notes}
                          onChange={(e) => updateNotes(item.menuItemId, e.target.value)}
                          className="text-sm min-h-[60px] resize-none"
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Cart Footer */}
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak (0%)</span>
              <span className="font-medium">Rp 0</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total</span>
              <span className="text-[#E53935]">{formatCurrency(cartTotal)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-12 text-lg font-semibold"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Bayar
            </Button>
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Kosongkan Keranjang
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Online Orders Notification Dialog */}
      <Dialog open={notificationOpen} onOpenChange={setNotificationOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#E53935]" />
              Pesanan Online ({onlineOrders.length})
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {onlineOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada pesanan online</p>
              </div>
            ) : (
              <div className="space-y-4">
                {onlineOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {order.paymentStatus === 'PAID' && (
                                <Badge className="bg-green-100 text-green-600 border-green-200">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Sudah Bayar
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => takeOrder(order)}
                              className="flex-1 bg-[#E53935] hover:bg-[#D32F2F] text-white"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Ambil Pesanan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                markOrderAsCancelled(order.id);
                              }}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Tolak
                            </Button>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-xs text-gray-500 mb-1">Item:</p>
                          <div className="space-y-1 text-sm">
                            {order.items.slice(0, 3).map((item: any, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate">{item.quantity}x {item.menu?.name || item.customName || 'Item'}</span>
                                <span>{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="text-gray-400 text-xs">
                                +{order.items.length - 3} lainnya
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#E53935]" />
              Otorisasi Kasir
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-gray-600">
              Masukkan password untuk mengambil pesanan <strong>{selectedOnlineOrder?.orderNumber}</strong>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashierPassword">Password Kasir</Label>
              <Input
                id="cashierPassword"
                name="cashier_password"
                type="password"
                placeholder="Masukkan password"
                value={cashierPassword}
                onChange={(e) => setCashierPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmTakeOrder();
                  }
                }}
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            {selectedOnlineOrder?.paymentStatus === 'PAID' && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Pesanan sudah dibayar</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Total: {formatCurrency(selectedOnlineOrder.total)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAuthDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={confirmTakeOrder}
              disabled={!cashierPassword || processing}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              {processing ? 'Memproses...' : 'Ambil Pesanan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
        setPaymentDialogOpen(open);
        if (!open) {
          setCashReceived('');
          setEwalletProvider('');
        }
      }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#E53935]" />
              Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Total Pembayaran</div>
              <div className="text-2xl font-bold text-[#E53935]">{formatCurrency(cartTotal)}</div>
            </div>

            {/* Payment Method Selection - Tap Buttons */}
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className={paymentMethod === 'cash' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Tunai
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('qris')}
                  className={paymentMethod === 'qris' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  QRIS
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'ewallet' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('ewallet')}
                  className={paymentMethod === 'ewallet' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  E-Wallet
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'debit_card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('debit_card')}
                  className={paymentMethod === 'debit_card' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Kartu Debit
                </Button>
              </div>
            </div>

            {paymentMethod === 'ewallet' && (
              <div className="space-y-2">
                <Label>Provider E-Wallet</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={ewalletProvider === 'GoPay' ? 'default' : 'outline'}
                    onClick={() => setEwalletProvider('GoPay')}
                    className={ewalletProvider === 'GoPay' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                  >
                    GoPay
                  </Button>
                  <Button
                    type="button"
                    variant={ewalletProvider === 'OVO' ? 'default' : 'outline'}
                    onClick={() => setEwalletProvider('OVO')}
                    className={ewalletProvider === 'OVO' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                  >
                    OVO
                  </Button>
                  <Button
                    type="button"
                    variant={ewalletProvider === 'DANA' ? 'default' : 'outline'}
                    onClick={() => setEwalletProvider('DANA')}
                    className={ewalletProvider === 'DANA' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                  >
                    DANA
                  </Button>
                  <Button
                    type="button"
                    variant={ewalletProvider === 'ShopeePay' ? 'default' : 'outline'}
                    onClick={() => setEwalletProvider('ShopeePay')}
                    className={ewalletProvider === 'ShopeePay' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
                  >
                    ShopeePay
                  </Button>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <Label htmlFor="cashReceived">Cash</Label>
                <Input
                  id="cashReceived"
                  type="number"
                  placeholder="Masukkan jumlah uang"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  min={cartTotal}
                  step="1000"
                  className="text-lg font-semibold"
                />
                {cashReceived && !isCashSufficient() && (
                  <p className="text-sm text-red-500">
                    Uang kurang {formatCurrency(cartTotal - (parseInt(cashReceived) || 0))}
                  </p>
                )}
                {cashReceived && isCashSufficient() && (
                  <div className="bg-green-50 p-2 rounded border border-green-200 text-sm">
                    <div className="flex justify-between">
                      <span>Kembalian:</span>
                      <span className="font-bold text-green-700">{formatCurrency(calculateChange())}</span>
                    </div>
                  </div>
                )}
                {/* Cash Recommendations */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Rekomendasi Uang</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      // Generate recommendations based on cart total
                      const recommendations: number[] = [];
                      const total = cartTotal;

                      // Add common denominations that are >= total
                      const denominations = [5000, 10000, 20000, 50000, 100000, 200000, 500000];
                      for (const denom of denominations) {
                        if (denom >= total) {
                          recommendations.push(denom);
                        }
                      }

                      // Add rounded up values
                      const roundedUp = Math.ceil(total / 10000) * 10000;
                      if (!recommendations.includes(roundedUp)) {
                        recommendations.push(roundedUp);
                      }
                      const roundedUp50 = Math.ceil(total / 50000) * 50000;
                      if (!recommendations.includes(roundedUp50)) {
                        recommendations.push(roundedUp50);
                      }
                      const roundedUp100 = Math.ceil(total / 100000) * 100000;
                      if (!recommendations.includes(roundedUp100)) {
                        recommendations.push(roundedUp100);
                      }

                      // Sort and take first 6
                      recommendations.sort((a, b) => a - b);
                      return recommendations.slice(0, 6).map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCashReceived(amount.toString())}
                          className="text-sm"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={processOrder}
              disabled={
                processing ||
                (paymentMethod === 'cash' && !isCashSufficient()) ||
                (paymentMethod === 'ewallet' && !ewalletProvider)
              }
              className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              {processing ? 'Memproses...' : `Proses Pembayaran ${formatCurrency(cartTotal)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={closeShiftDialogOpen} onOpenChange={(open) => {
        setCloseShiftDialogOpen(open);
        if (!open) {
          setActualCashCount('');
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-[#E53935]" />
              Tutup Shift
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentShift && (
              <div className="space-y-4">
                {/* Shift Summary */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                  <div className="font-semibold text-sm text-blue-800 mb-2">Ringkasan Shift</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">No. Shift:</span>
                    <span className="font-semibold">{currentShift.shiftNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Waktu Mulai:</span>
                    <span className="font-semibold">
                      {new Date(currentShift.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Order:</span>
                    <span className="font-semibold">{currentShift.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Penjualan:</span>
                    <span className="font-bold text-[#E53935]">{formatCurrency(currentShift.totalSales)}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                  <div className="font-semibold text-sm text-gray-800 mb-2">Rincian Pembayaran</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tunai Diterima:</span>
                    <span className="font-semibold">{formatCurrency(currentShift.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kartu Debit:</span>
                    <span className="font-semibold">{formatCurrency(currentShift.cardPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">E-Wallet:</span>
                    <span className="font-semibold">{formatCurrency(currentShift.ewalletPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">QRIS:</span>
                    <span className="font-semibold">{formatCurrency(currentShift.qrisPayments)}</span>
                  </div>
                </div>

                {/* Cash Calculation */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-3">
                  <div className="font-semibold text-sm text-orange-800">Perhitungan Tunai</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hasil Penjualan Tunai:</span>
                    <span className="font-semibold">{formatCurrency(currentShift.cashReceived)}</span>
                  </div>
                  <div className="border-t border-orange-300 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Harus Ada di Kasir:</span>
                      <span className="font-bold text-orange-700">{formatCurrency(currentShift.cashReceived)}</span>
                    </div>
                  </div>
                </div>

                {/* Input Actual Cash */}
                <div className="space-y-3">
                  <Label htmlFor="actualCashCount" className="font-semibold">
                    Input Uang Tunai Aktual di Kasir
                  </Label>
                  <Input
                    id="actualCashCount"
                    type="number"
                    placeholder="Masukkan jumlah uang tunai yang ada di kasir"
                    value={actualCashCount}
                    onChange={(e) => setActualCashCount(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500">
                    Hitung semua uang tunai hasil penjualan yang ada di laci kasir
                  </p>
                </div>

                {/* Real-time Difference */}
                {actualCashCount && (() => {
                  const expectedCash = currentShift.cashReceived;
                  const cashDifference = parseInt(actualCashCount) - expectedCash;
                  return (
                    <div className={`p-4 rounded-lg border ${
                      cashDifference === 0 
                        ? 'bg-green-50 border-green-200' 
                        : cashDifference > 0 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Selisih:</span>
                        <span className={`font-bold text-lg ${
                          cashDifference === 0 
                            ? 'text-green-600' 
                            : cashDifference > 0 
                              ? 'text-blue-600' 
                              : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(cashDifference))}
                          {cashDifference === 0 
                            ? ' (Sesuai)' 
                            : cashDifference > 0 
                              ? ' (Lebih)' 
                              : ' (Kurang)'}
                        </span>
                      </div>
                      {cashDifference !== 0 && (
                        <p className="text-xs mt-2 text-gray-600">
                          {cashDifference > 0 
                            ? `Uang di kasir lebih Rp${Math.abs(cashDifference).toLocaleString('id-ID')} dari yang seharusnya`
                            : `Uang di kasir kurang Rp${Math.abs(cashDifference).toLocaleString('id-ID')} dari yang seharusnya`}
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCloseShiftDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={confirmCloseShift}
              disabled={!actualCashCount || processing}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              {processing ? 'Memproses...' : 'Tutup Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Summary Dialog */}
      <Dialog open={shiftSummaryOpen} onOpenChange={setShiftSummaryOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Shift Selesai
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {shiftSummary && (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">Shift Berhasil Ditutup</h3>
                  <p className="text-sm text-gray-500">{shiftSummary.shiftNumber}</p>
                </div>

                {/* Sales Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Penjualan:</span>
                    <span className="font-bold text-green-700">{formatCurrency(shiftSummary.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Order:</span>
                    <span className="font-bold">{shiftSummary.totalOrders}</span>
                  </div>
                </div>

                {/* Payment Method Breakdown */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                  <div className="font-semibold text-sm text-blue-800 mb-2">Pembayaran Per Metode:</div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tunai:</span>
                    <span className="font-semibold">{formatCurrency(shiftSummary.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Kartu Debit:</span>
                    <span className="font-semibold">{formatCurrency(shiftSummary.cardPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">E-Wallet:</span>
                    <span className="font-semibold">{formatCurrency(shiftSummary.ewalletPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">QRIS:</span>
                    <span className="font-semibold">{formatCurrency(shiftSummary.qrisPayments)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2">
                    <span className="text-sm font-semibold">Total Pembayaran:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(shiftSummary.cashReceived + shiftSummary.cardPayments + shiftSummary.ewalletPayments + shiftSummary.qrisPayments)}</span>
                  </div>
                </div>

                {/* Cash Reconciliation */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 space-y-2">
                  <div className="font-semibold text-sm text-orange-800 mb-2">Rekonsiliasi Tunai:</div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tunai Diterima:</span>
                    <span className="font-semibold">{formatCurrency(shiftSummary.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between border-t border-orange-300 pt-2">
                    <span className="text-sm font-semibold">Harus Ada:</span>
                    <span className="font-bold">{formatCurrency(shiftSummary.cashReceived)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Uang Aktual:</span>
                    <span className="font-bold">{formatCurrency(shiftSummary.closingBalance || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-orange-300 pt-2">
                    <span className="text-sm font-bold">Selisih:</span>
                    <span className={`font-bold ${shiftSummary.cashDifference === 0 ? 'text-green-600' : shiftSummary.cashDifference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(shiftSummary.cashDifference || 0))}
                      {shiftSummary.cashDifference === 0 ? ' (Sesuai)' : shiftSummary.cashDifference > 0 ? ' (Lebih)' : ' (Kurang)'}
                    </span>
                  </div>
                </div>

                {/* Cashier Info */}
                {shiftSummary.cashier && (
                  <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kasir:</span>
                      <span className="font-semibold">{shiftSummary.cashier.name || shiftSummary.cashier.username}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 flex-col">
            <div className="flex gap-2 w-full">
              <Button
                onClick={handlePrintShiftReport}
                className="flex-1 bg-[#E53935] hover:bg-[#D32F2F] text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak Laporan
              </Button>
            </div>
            <Button
              onClick={async () => {
                await logout();
                toast.success('Kasir berhasil ditutup');
                setCurrentView('login');
              }}
              className="w-1/2 mx-auto bg-gray-600 hover:bg-gray-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Tutup Kasir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Daily Sales Report Dialog */}
      <Dialog open={dailySalesDialogOpen} onOpenChange={(open) => {
        setDailySalesDialogOpen(open);
        if (!open) {
          setDailySalesInput('');
          setDailySalesData(null);
        }
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#E53935]" />
              Laporan Penjualan Hari Ini
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {dailySalesData && (
              <>
                {/* Sales Summary */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Penjualan:</span>
                    <span className="font-bold text-green-700">{formatCurrency(dailySalesData.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Order:</span>
                    <span className="font-bold">{dailySalesData.totalOrders}</span>
                  </div>
                </div>

                {/* Payment Method Breakdown */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                  <div className="font-semibold text-sm text-blue-800 mb-2">Pembayaran Per Metode:</div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tunai:</span>
                    <span className="font-semibold">{formatCurrency(dailySalesData.cashPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Kartu Debit:</span>
                    <span className="font-semibold">{formatCurrency(dailySalesData.cardPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">E-Wallet:</span>
                    <span className="font-semibold">{formatCurrency(dailySalesData.ewalletPayments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">QRIS:</span>
                    <span className="font-semibold">{formatCurrency(dailySalesData.qrisPayments)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-300 pt-2">
                    <span className="text-sm font-semibold">Total Pembayaran:</span>
                    <span className="font-bold text-blue-700">{formatCurrency(dailySalesData.totalSales)}</span>
                  </div>
                </div>

                {/* Cash Input */}
                <div className="space-y-3">
                  <Label htmlFor="dailySalesInput" className="font-semibold">
                    Input Uang Tunai Hasil Penjualan
                  </Label>
                  <Input
                    id="dailySalesInput"
                    type="number"
                    placeholder="Masukkan jumlah uang tunai hasil penjualan"
                    value={dailySalesInput}
                    onChange={(e) => setDailySalesInput(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-500">
                    Hitung semua uang tunai hasil penjualan hari ini
                  </p>
                </div>

                {/* Difference - Only show after Setor */}
                {dailySalesData?.actualCash !== undefined && (
                  <div className={`p-4 rounded-lg border ${
                    dailySalesData.cashDifference === 0
                      ? 'bg-green-50 border-green-200'
                      : dailySalesData.cashDifference > 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">Selisih:</span>
                      <span className={`font-bold text-lg ${
                        dailySalesData.cashDifference === 0
                          ? 'text-green-600'
                          : dailySalesData.cashDifference > 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(dailySalesData.cashDifference))}
                        {dailySalesData.cashDifference === 0
                          ? ' (Sesuai)'
                          : dailySalesData.cashDifference > 0
                            ? ' (Lebih)'
                            : ' (Kurang)'}
                      </span>
                    </div>
                    {dailySalesData.cashDifference !== 0 && (
                      <p className="text-xs mt-2 text-gray-600">
                        {dailySalesData.cashDifference > 0
                          ? `Uang tunai lebih Rp${Math.abs(dailySalesData.cashDifference).toLocaleString('id-ID')} dari yang seharusnya`
                          : `Uang tunai kurang Rp${Math.abs(dailySalesData.cashDifference).toLocaleString('id-ID')} dari yang seharusnya`}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2 flex-col">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setDailySalesDialogOpen(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleGenerateDailySalesReport}
                disabled={!dailySalesInput || !dailySalesData}
                className="flex-1 bg-[#E53935] hover:bg-[#D32F2F] text-white"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Setor
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                onClick={handlePrintDailySalesReport}
                disabled={dailySalesData?.actualCash === undefined}
                className="flex-1 bg-[#E53935] hover:bg-[#D32F2F] text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak Laporan
              </Button>
            </div>
            <Button
              onClick={handleLogoutConfirm}
              className="w-1/2 mx-auto bg-gray-600 hover:bg-gray-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Tutup Kasir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#E53935]" />
              Struk Pembayaran
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {completedOrder && (
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 font-mono text-sm">
                {/* Header */}
                <div className="text-center mb-6 pb-4 border-b-2 border-dashed">
                  <h2 className="text-xl font-bold mb-2">🍗 AYAM GEPREK SAMBAL IJO</h2>
                  <p>Jl. Medan-Banda Aceh, Simpang Camat,<br />Gampong Tijue, 24151</p>
                  <p>Telp: 085260812758</p>
                </div>

                {/* Order Info */}
                <div className="mb-6 pb-4 border-b-2 border-dashed space-y-1">
                  <div className="flex justify-between">
                    <span>No. Order:</span>
                    <span className="font-semibold">{completedOrder.orderNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span className="font-semibold">{new Date().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span className="font-semibold">{user?.name || user?.username || 'N/A'}</span>
                  </div>
                  {isPrePaid ? (
                    <div className="flex justify-center bg-green-50 p-3 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      <span className="font-semibold text-green-600">STATUS: LUNAS</span>
                    </div>
                  ) : null}
                </div>

                {/* Items */}
                <div className="mb-6 pb-4 border-b-2 border-dashed">
                  <div className="text-center font-bold mb-4">RINCIAN PESANAN</div>
                  <div className="space-y-2">
                    {(completedOrder.items || cart).map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(completedOrder.total || cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (0%):</span>
                    <span className="font-semibold">Rp 0</span>
                  </div>

                  {paymentMethod === 'cash' && !isPrePaid && (
                    <>
                      <div className="flex justify-between">
                        <span>Tunai Diterima:</span>
                        <span className="font-semibold">{formatCurrency(parseInt(cashReceived) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kembalian:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(calculateChange())}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-[#E53935]">{formatCurrency(completedOrder.total || cartTotal)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6 pt-4 border-t-2 border-dashed text-center">
                  <p className="text-sm">
                    <span className="font-semibold">Metode Pembayaran:</span>{' '}
                    {isPrePaid && prePaidOrderInfo
                      ? prePaidOrderInfo.paymentMethod || 'Sudah Dibayar'
                      : paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'qris' ? 'QRIS' : paymentMethod === 'ewallet' ? `E-Wallet (${ewalletProvider})` : 'Kartu Debit'}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Tutup
            </Button>
            <Button
              onClick={handlePrintReceipt}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Ulang
            </Button>
            <Button
              onClick={() => {
                setReceiptDialogOpen(false);
                toast.success('Transaksi selesai!');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Transaksi Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
