'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, QrCode, Wallet, X, Receipt, Loader2, CheckCircle2, Ticket } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useCartStore } from '@/store/cart-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RedeemCodeInfo {
  code: string;
  discountPercent: number;
  discountValue: number;
}

export function CartView() {
  const { setCurrentView, setSelectedOrderId } = useUIStore();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const { user } = useUserStore();
  const [notes, setNotes] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemCodeInfo, setRedeemCodeInfo] = useState<RedeemCodeInfo | null>(null);
  const [validatingRedeemCode, setValidatingRedeemCode] = useState(false);
  const [usedRedeemCodeInfo, setUsedRedeemCodeInfo] = useState<RedeemCodeInfo | null>(null);

  const deliveryFee = 5000;
  const subtotal = getTotalPrice();
  const discount = redeemCodeInfo ? redeemCodeInfo.discountValue : 0;
  const total = subtotal + deliveryFee - discount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const validateRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemCodeInfo(null);
      return;
    }

    setValidatingRedeemCode(true);

    try {
      const response = await fetch('/api/redeem-code/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: redeemCode,
          userId: user?.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRedeemCodeInfo(data);
        toast.success(`Kode redeem berhasil! Diskon ${data.discountPercent}% diterapkan`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Kode redeem tidak valid');
        setRedeemCodeInfo(null);
      }
    } catch (error) {
      console.error('Error validating redeem code:', error);
      toast.error('Gagal memvalidasi kode redeem');
      setRedeemCodeInfo(null);
    } finally {
      setValidatingRedeemCode(false);
    }
  };

  const handleCheckout = () => {
    // Open payment method dialog
    setPaymentDialogOpen(true);
  };

  const generateWhatsAppMessage = (orderData: any) => {
    const orderNumber = orderData.orderNumber;
    const paymentMethodText = selectedPayment === 'qris' ? 'QRIS' : 'Bayar di Tempat (Tunai)';
    const estimatedTime = '30-45 menit';

    let message = `🍗 *AYAM GEPREK SAMBAL IJO*\n`;
    message += `📋 *ORDER BARU*\n\n`;
    message += `🔢 No. Order: ${orderNumber}\n`;
    message += `💰 Total: ${formatCurrency(total)}\n`;
    message += `💳 Pembayaran: ${paymentMethodText}\n\n`;
    message += `📦 *Rincian Pesanan:*\n`;

    items.forEach((item, index) => {
      message += `\n${index + 1}. ${item.name}`;
      message += `\n   Qty: ${item.quantity} x Rp${item.price.toLocaleString('id-ID')}`;
      message += `\n   Subtotal: Rp${(item.price * item.quantity).toLocaleString('id-ID')}`;

      if (item.options) {
        if (item.options.spicyLevel !== undefined) {
          message += `\n   Level Sambal: ${item.options.spicyLevel}`;
        }
        if (item.options.extraCheese) {
          message += `\n   Extra Keju: +Rp5.000`;
        }
        if (item.options.extraRice) {
          message += `\n   Extra Nasi: +Rp5.000`;
        }
        if (item.options.notes) {
          message += `\n   Catatan: ${item.options.notes}`;
        }
      }
    });

    message += `\n\n*Ringkasan:*\n`;
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;
    message += `Ongkir: ${formatCurrency(deliveryFee)}\n`;
    message += `Total: ${formatCurrency(total)}\n\n`;

    if (notes) {
      message += `📝 *Catatan Tambahan:*\n${notes}\n\n`;
    }

    message += `⏱️ Estimasi Waktu: ${estimatedTime}\n\n`;
    message += `Terima kasih telah memesan! 🙏`;

    return encodeURIComponent(message);
  };

  const handlePaymentSelect = async (method: string) => {
    setSelectedPayment(method);
    setIsProcessing(true);

    try {
      // Use the validated redeem code if available
      let discount = 0;
      let discountPercent = 0;
      let redeemCodeId: string | undefined;

      // Get discount from validated redeem code
      if (redeemCodeInfo && redeemCodeInfo.discountValue > 0) {
        discount = redeemCodeInfo.discountValue;
        discountPercent = redeemCodeInfo.discountPercent;
      }

      // Recalculate total with discount
      const actualTotal = subtotal + deliveryFee - discount;

      // Prepare order data
      const orderData = {
        userId: user?.id || null,
        items: items.map((item) => ({
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          options: item.options,
          notes: item.options?.notes || '',
        })),
        notes: notes || '',
        address: user?.phone || '',
        paymentMethod: method === 'qris' ? 'QRIS' : 'CASH',
        paymentStatus: 'PENDING',
        subtotal,
        deliveryFee,
        discount,
        total: actualTotal,
      };

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat pesanan');
      }

      const order = await response.json();
      setCompletedOrder(order);
      setSelectedOrderId(order.id);

      // If redeem code was validated, use it now with the order
      if (redeemCodeInfo && redeemCodeInfo.discountValue > 0) {
        try {
          const useResponse = await fetch('/api/redeem-code/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: redeemCodeInfo.code,
              userId: user?.id,
              orderId: order.id
            })
          });

          if (useResponse.ok) {
            // Store used redeem code info for receipt
            setUsedRedeemCodeInfo(redeemCodeInfo);
            toast.success(`Kode redeem ${redeemCodeInfo.code} berhasil digunakan!`);
          } else {
            const error = await useResponse.json();
            toast.error(error.error || 'Gagal menggunakan kode redeem');
          }
        } catch (error) {
          console.error('Error using redeem code:', error);
          toast.error('Gagal menggunakan kode redeem');
        }

        // Clear redeem code state after use
        setRedeemCode('');
        setRedeemCodeInfo(null);
      }

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(order);
      const whatsappNumber = '6281234567890'; // Ganti dengan nomor WhatsApp restaurant
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Show receipt
      setPaymentDialogOpen(false);
      setReceiptDialogOpen(true);

      // Clear cart
      clearCart();
      setNotes('');

      toast.success('Pesanan berhasil dibuat!');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset selected payment when dialog is closed
      setSelectedPayment('');
    }
    setPaymentDialogOpen(open);
  };

  const handlePrintReceipt = () => {
    if (!completedOrder) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      const receiptHTML = generateReceiptHTML();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generateReceiptHTML = () => {
    if (!completedOrder) return '';

    const paymentMethodText = selectedPayment === 'qris' ? 'QRIS' : 'Bayar di Tempat (Tunai)';

    let itemsHTML = items.map((item, index) => {
      return `
        <div class="item">
          <span>${item.quantity}x ${item.name}</span>
          <span>Rp${(item.price * item.quantity).toLocaleString('id-ID')}</span>
        </div>
      `;
    }).join('');

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
    <p>Jalan Contoh No. 123</p>
    <p>Telp: 0812-3456-7890</p>
  </div>
  <div class="line">
    <p><strong>No. Order:</strong> ${completedOrder.orderNumber || 'N/A'}</p>
    <p><strong>Tanggal:</strong> ${new Date().toLocaleString('id-ID')}</p>
    <p><strong>Pelanggan:</strong> ${user?.name || 'Guest'}</p>
  </div>
  <div class="line">
    <p style="text-align:center; font-weight:bold;">RINCIAN PESANAN</p>
  </div>
  ${itemsHTML}
  <div class="line">
    <div class="item"><strong>Subtotal:</strong> <strong>Rp${subtotal.toLocaleString('id-ID')}</strong></div>
    <div class="item"><strong>Ongkir:</strong> <strong>Rp${deliveryFee.toLocaleString('id-ID')}</strong></div>
    {usedRedeemCodeInfo ? (
      <div class="item"><strong>Diskon:</strong> <strong>-Rp{usedRedeemCodeInfo.discountValue.toLocaleString('id-ID')} ({usedRedeemCodeInfo.discountPercent}%) - Kode: ${usedRedeemCodeInfo.code}</strong></div>
    ) : discount > 0 ? (
      <div class="item"><strong>Diskon:</strong> <strong>-Rp{discount.toLocaleString('id-ID')}</strong></div>
    ) : null}
    <div class="item total"><strong>TOTAL BAYAR:</strong> <strong>Rp{total.toLocaleString('id-ID')}</strong></div>
  </div>
  <div class="line">
    <p><strong>Metode Pembayaran:</strong> ${paymentMethodText}</p>
  </div>
  <div class="footer">
    <p>Pesanan telah dikirim ke WhatsApp</p>
    <p>Simpan struk ini sebagai bukti pembayaran</p>
  </div>
</body>
</html>`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Keranjang Kosong</h2>
            <p className="text-gray-500 mb-6">
              Belum ada item di keranjang Anda
            </p>
            <Button
              onClick={() => setCurrentView('menu')}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              Lihat Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-display font-bold">Keranjang Pesanan</h1>

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                {item.image && (
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2">{item.name}</h3>

                  {/* Options */}
                  {item.options && (
                    <div className="text-sm text-gray-500 mb-2 space-y-1">
                      {item.options.spicyLevel !== undefined && (
                        <p>Level Sambal: {item.options.spicyLevel}</p>
                      )}
                      {item.options.extraCheese && <p>Extra Keju (+Rp5.000)</p>}
                      {item.options.extraRice && <p>Extra Nasi (+Rp5.000)</p>}
                      {item.options.notes && <p>Catatan: {item.options.notes}</p>}
                    </div>
                  )}

                  <p className="font-bold text-[#E53935] text-lg">
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
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.menuId, item.quantity + 1, item.options)
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Notes */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Catatan Pesanan</h3>
          <Textarea
            placeholder="Contoh: Tidak pedas, sambal terpisah..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Redeem Code */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Kode Redeem</h3>
          <div className="space-y-2">
            <Input
              placeholder="Masukkan kode redeem"
              value={redeemCode}
              onChange={(e) => {
                setRedeemCode(e.target.value.toUpperCase());
                if (redeemCodeInfo) {
                  setRedeemCodeInfo(null);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  validateRedeemCode();
                }
              }}
              disabled={validatingRedeemCode}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={validateRedeemCode}
              disabled={!redeemCode.trim() || validatingRedeemCode}
            >
              {validatingRedeemCode ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validasi...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  {redeemCodeInfo ? 'Gunakan' : 'Validasi'}
                </>
              )}
            </Button>
            
            {redeemCodeInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Diskon:</span>
                  <span className="font-bold text-green-700">
                    {redeemCodeInfo.discountPercent}% ({formatCurrency(redeemCodeInfo.discountValue)})
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  ✓ Kode redeem akan otomatis digunakan saat checkout
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rp{subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Biaya Pengiriman</span>
            <span>Rp{deliveryFee.toLocaleString('id-ID')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>-Rp{discount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#E53935]">
              Rp{total.toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleCheckout}
          className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-14 text-base font-semibold"
        >
          Lanjut ke Pembayaran
        </Button>
        <Button
          variant="ghost"
          onClick={() => setCurrentView('menu')}
          className="w-full"
        >
          Tambah Menu Lain
        </Button>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={handlePaymentDialogOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Metode Pembayaran</span>
              <button
                onClick={() => handlePaymentDialogOpenChange(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="text-2xl font-bold text-[#E53935]">
                Rp{total.toLocaleString('id-ID')}
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-2">Pilih metode pembayaran:</p>

            {/* QRIS Option */}
            <button
              onClick={() => handlePaymentSelect('qris')}
              disabled={isProcessing}
              className="w-full flex items-center gap-4 p-4 border-2 rounded-xl hover:border-[#E53935] hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                {isProcessing && selectedPayment === 'qris' ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <QrCode className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900">QRIS</h3>
                <p className="text-sm text-gray-500">Scan QR untuk pembayaran</p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#E53935] flex items-center justify-center">
                {selectedPayment === 'qris' && !isProcessing && (
                  <div className="w-3 h-3 rounded-full bg-[#E53935]" />
                )}
              </div>
            </button>

            {/* Cash Option */}
            <button
              onClick={() => handlePaymentSelect('cash')}
              disabled={isProcessing}
              className="w-full flex items-center gap-4 p-4 border-2 rounded-xl hover:border-[#E53935] hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                {isProcessing && selectedPayment === 'cash' ? (
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                ) : (
                  <Wallet className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-semibold text-gray-900">Bayar di Tempat</h3>
                <p className="text-sm text-gray-500">Tunai saat pesanan diterima</p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#E53935] flex items-center justify-center">
                {selectedPayment === 'cash' && !isProcessing && (
                  <div className="w-3 h-3 rounded-full bg-[#E53935]" />
                )}
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-2xl">
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
                  <p className="text-xs text-gray-600">Jalan Contoh No. 123</p>
                  <p className="text-xs text-gray-600">Telp: 0812-3456-7890</p>
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
                    <span>Pelanggan:</span>
                    <span className="font-semibold">{user?.name || 'Guest'}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6 pb-4 border-b-2 border-dashed">
                  <div className="text-center font-bold mb-4">RINCIAN PESANAN</div>
                  <div className="space-y-2">
                    {items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">Rp{subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkir:</span>
                    <span className="font-semibold">Rp{deliveryFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-[#E53935]">Rp{total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-6 pt-4 border-t-2 border-dashed text-center">
                  <p className="text-sm">
                    <span className="font-semibold">Metode Pembayaran:</span>{' '}
                    {selectedPayment === 'qris' ? 'QRIS' : 'Bayar di Tempat (Tunai)'}
                  </p>
                </div>

                {/* Success Message */}
                <div className="mt-6 pt-4 border-t-2 border-dashed text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Pesanan Berhasil Dikirim!</span>
                  </div>
                  {usedRedeemCodeInfo && (
                    <p className="text-sm text-gray-600">
                      Diskon {usedRedeemCodeInfo.discountPercent}% (Rp{formatCurrency(usedRedeemCodeInfo.discountValue)}) dengan kode {usedRedeemCodeInfo.code}
                    </p>
                  )}
                  <p className="text-xs text-gray-600">Pesanan telah dikirim ke WhatsApp</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={handlePrintReceipt}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Cetak Struk
            </Button>
            <Button
              onClick={() => {
                setReceiptDialogOpen(false);
                setCurrentView('home');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Kembali ke Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
