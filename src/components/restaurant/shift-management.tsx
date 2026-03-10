'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Printer, DollarSign, Clock, ShoppingCart, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, LogOut, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useUserStore } from '@/store/user-store';
import { useUIStore } from '@/store/ui-store';

interface Shift {
  id: string;
  shiftNumber: string;
  cashierId: string;
  cashier: {
    id: string;
    name: string | null;
    username: string | null;
  };
  startTime: string;
  endTime: string | null;
  openingBalance: number;
  closingBalance: number | null;
  cashReceived: number;
  expectedCash: number | null;
  cashDifference: number | null;
  totalOrders: number;
  totalSales: number;
  cardPayments: number;
  ewalletPayments: number;
  qrisPayments: number;
  status: 'OPEN' | 'CLOSED';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  orders?: any[];
  paymentBreakdown?: {
    cash: number;
    card: number;
    ewallet: number;
    qris: number;
    other: number;
  };
}

interface ShiftManagementProps {
  onShiftClosed?: () => void;
  onShiftOpened?: (shift: Shift) => void;
}

export function ShiftManagement({ onShiftClosed, onShiftOpened }: ShiftManagementProps) {
  const { user } = useUserStore();
  const { setCurrentView } = useUIStore();

  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [openShiftDialogOpen, setOpenShiftDialogOpen] = useState(false);
  const [closeShiftDialogOpen, setCloseShiftDialogOpen] = useState(false);
  const [shiftReportOpen, setShiftReportOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Open shift form
  const [openingBalance, setOpeningBalance] = useState('');

  // Close shift form
  const [closingBalance, setClosingBalance] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  // Fetch active shift and history on mount and when user changes
  useEffect(() => {
    fetchActiveShift();
    fetchShiftHistory();
  }, [user?.id]);

  const fetchActiveShift = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/shifts/active?cashierId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setActiveShift(data.shift);
      }
    } catch (error) {
      console.error('Error fetching active shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftHistory = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/shifts?status=CLOSED&cashierId=${user.id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setShiftHistory(data);
      }
    } catch (error) {
      console.error('Error fetching shift history:', error);
    }
  };

  const handleOpenShift = async () => {
    if (!openingBalance || parseFloat(openingBalance) < 0) {
      toast.error('Masukkan modal awal yang valid');
      return;
    }

    if (!user?.id) {
      toast.error('User tidak ditemukan');
      return;
    }

    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: user.id,
          openingBalance: Math.round(parseFloat(openingBalance)),
        }),
      });

      if (response.ok) {
        const shift = await response.json();
        setActiveShift(shift);
        setOpenShiftDialogOpen(false);
        setOpeningBalance('');
        toast.success(`Shift ${shift.shiftNumber} berhasil dibuka!`);
        onShiftOpened?.(shift);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal membuka shift');
      }
    } catch (error) {
      console.error('Error opening shift:', error);
      toast.error('Gagal membuka shift');
    }
  };

  const handleCloseShift = async () => {
    if (!closingBalance || parseFloat(closingBalance) < 0) {
      toast.error('Masukkan saldo akhir yang valid');
      return;
    }

    if (!activeShift) return;

    try {
      const response = await fetch(`/api/shifts/${activeShift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closingBalance: Math.round(parseFloat(closingBalance)),
          notes: closingNotes,
        }),
      });

      if (response.ok) {
        const closedShift = await response.json();
        setActiveShift(null);
        setCloseShiftDialogOpen(false);
        setClosingBalance('');
        setClosingNotes('');
        toast.success('Shift berhasil ditutup!');
        onShiftClosed?.();

        // Show report
        setSelectedShift(closedShift);
        setShiftReportOpen(true);

        // Refresh history
        fetchShiftHistory();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menutup shift');
      }
    } catch (error) {
      console.error('Error closing shift:', error);
      toast.error('Gagal menutup shift');
    }
  };

  const handleViewShiftReport = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/shifts/${shiftId}`);
      if (response.ok) {
        const shift = await response.json();
        setSelectedShift(shift);
        setShiftReportOpen(true);
      }
    } catch (error) {
      console.error('Error fetching shift report:', error);
      toast.error('Gagal memuat laporan shift');
    }
  };

  const handlePrintReport = () => {
    if (!selectedShift) return;

    const printWindow = window.open('', '', 'width=400,height=600');
    if (printWindow) {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(amount);
      };

      const startDate = new Date(selectedShift.startTime);
      const endDate = selectedShift.endTime ? new Date(selectedShift.endTime) : null;

      const html = `
        <html>
        <head>
          <title>Laporan Shift ${selectedShift.shiftNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              font-size: 12px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px dashed #000;
            }
            .header h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .section {
              margin-bottom: 15px;
              padding: 10px 0;
              border-bottom: 1px dashed #000;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .row.total {
              font-weight: bold;
              font-size: 14px;
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #000;
            }
            .cash-diff {
              font-weight: bold;
              padding: 8px;
              margin: 10px 0;
              text-align: center;
            }
            .cash-diff.positive {
              background: #e8f5e9;
              color: #2e7d32;
            }
            .cash-diff.negative {
              background: #ffebee;
              color: #c62828;
            }
            .cash-diff.zero {
              background: #f5f5f5;
              color: #616161;
            }
            .orders-list {
              max-height: 200px;
              overflow-y: auto;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px dashed #000;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍗 AYAM GEPREK SAMBAL IJO</h1>
            <p>LAPORAN SHIFT KASIR</p>
            <p>${selectedShift.shiftNumber}</p>
          </div>

          <div class="section">
            <div class="row"><span>Kasir:</span><span>${selectedShift.cashier.name || selectedShift.cashier.username || 'N/A'}</span></div>
            <div class="row"><span>Mulai:</span><span>${startDate.toLocaleString('id-ID')}</span></div>
            ${endDate ? `<div class="row"><span>Selesai:</span><span>${endDate.toLocaleString('id-ID')}</span></div>` : ''}
            <div class="row"><span>Durasi:</span><span>${endDate ? Math.round((endDate.getTime() - startDate.getTime()) / 60000) + ' menit' : 'Sedang berjalan'}</span></div>
          </div>

          <div class="section">
            <div class="row"><span>Modal Awal:</span><span>${formatCurrency(selectedShift.openingBalance)}</span></div>
            <div class="row"><span>Total Tunai:</span><span>${formatCurrency(selectedShift.cashReceived)}</span></div>
            <div class="row"><span>Seharusnya Ada:</span><span>${formatCurrency(selectedShift.expectedCash || 0)}</span></div>
            ${selectedShift.closingBalance !== null ? `
              <div class="row"><span>Saldo Akhir:</span><span>${formatCurrency(selectedShift.closingBalance)}</span></div>
            ` : ''}
            ${selectedShift.cashDifference !== null ? `
              <div class="cash-diff ${selectedShift.cashDifference > 0 ? 'positive' : selectedShift.cashDifference < 0 ? 'negative' : 'zero'}">
                ${selectedShift.cashDifference > 0 ? '✓ KELEBIHAN' : selectedShift.cashDifference < 0 ? '✗ KEKURANGAN' : '✓ PAS'} ${formatCurrency(Math.abs(selectedShift.cashDifference))}
              </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="row"><span>Total Order:</span><span>${selectedShift.totalOrders} transaksi</span></div>
            <div class="row"><span>Total Penjualan:</span><span>${formatCurrency(selectedShift.totalSales)}</span></div>
          </div>

          <div class="section">
            <div class="row"><span>Tunai:</span><span>${formatCurrency(selectedShift.paymentBreakdown?.cash || 0)}</span></div>
            <div class="row"><span>Kartu Debit:</span><span>${formatCurrency(selectedShift.cardPayments)}</span></div>
            <div class="row"><span>E-Wallet:</span><span>${formatCurrency(selectedShift.ewalletPayments)}</span></div>
            <div class="row"><span>QRIS:</span><span>${formatCurrency(selectedShift.qrisPayments)}</span></div>
            <div class="row total"><span>TOTAL:</span><span>${formatCurrency(selectedShift.totalSales)}</span></div>
          </div>

          ${selectedShift.notes ? `
          <div class="section">
            <strong>Catatan:</strong>
            <p>${selectedShift.notes}</p>
          </div>
          ` : ''}

          <div class="footer">
            <p>================================</p>
            <p>Laporan ini dicetak pada ${new Date().toLocaleString('id-ID')}</p>
            <p>================================</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {/* Active Shift Status Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              Status Shift
            </CardTitle>
            <Badge variant={activeShift ? 'default' : 'secondary'} className={activeShift ? 'bg-green-600' : ''}>
              {activeShift ? 'SEDANG BERJALAN' : 'BELUM BUKA SHIFT'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeShift ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">No. Shift:</span>
                <span className="font-semibold">{activeShift.shiftNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mulai:</span>
                <span className="font-semibold">{formatDate(activeShift.startTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Modal Awal:</span>
                <span className="font-semibold">{formatCurrency(activeShift.openingBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Order:</span>
                <span className="font-semibold">{activeShift.totalOrders}</span>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setCloseShiftDialogOpen(true)}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Tutup Shift
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Anda belum membuka shift kerja hari ini
              </p>
              <Button
                size="sm"
                onClick={() => setOpenShiftDialogOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Buka Shift Baru
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift History */}
      {shiftHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              Riwayat Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2">
                {shiftHistory.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleViewShiftReport(shift.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{shift.shiftNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(shift.startTime).split(',')[0]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{shift.totalOrders} order</span>
                      <span className="font-semibold">{formatCurrency(shift.totalSales)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Open Shift Dialog */}
      <Dialog open={openShiftDialogOpen} onOpenChange={setOpenShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Buka Shift Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Modal Awal</strong> adalah jumlah uang kas yang ada di kasir saat memulai shift.
                Ini akan digunakan untuk menghitung selisih saat menutup shift.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Modal Awal (Rp)</Label>
              <Input
                id="openingBalance"
                type="number"
                placeholder="Masukkan modal awal"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenShiftDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleOpenShift} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Buka Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Shift Dialog */}
      <Dialog open={closeShiftDialogOpen} onOpenChange={setCloseShiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-600" />
              Tutup Shift
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {activeShift && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">No. Shift:</span>
                  <span className="font-semibold">{activeShift.shiftNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Modal Awal:</span>
                  <span className="font-semibold">{formatCurrency(activeShift.openingBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tunai Diterima:</span>
                  <span className="font-semibold">{formatCurrency(activeShift.cashReceived)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Seharusnya Ada:</span>
                  <span className="text-green-600">{formatCurrency(activeShift.openingBalance + activeShift.cashReceived)}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="closingBalance">Saldo Akhir di Kasir (Rp)</Label>
              <Input
                id="closingBalance"
                type="number"
                placeholder="Masukkan saldo akhir"
                value={closingBalance}
                onChange={(e) => setClosingBalance(e.target.value)}
                autoFocus
              />
              {activeShift && closingBalance && (
                <div className="mt-2 p-3 rounded-lg text-center font-semibold">
                  {(() => {
                    const expected = activeShift.openingBalance + activeShift.cashReceived;
                    const diff = parseFloat(closingBalance) - expected;
                    if (diff > 0) {
                      return (
                        <div className="bg-green-50 text-green-700 p-2 rounded">
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          Kelebihan {formatCurrency(Math.abs(diff))}
                        </div>
                      );
                    } else if (diff < 0) {
                      return (
                        <div className="bg-red-50 text-red-700 p-2 rounded">
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                          Kekurangan {formatCurrency(Math.abs(diff))}
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-gray-50 text-gray-700 p-2 rounded">
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          Pas! Tidak ada selisih
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingNotes">Catatan (Opsional)</Label>
              <Textarea
                id="closingNotes"
                placeholder="Catatan untuk shift ini..."
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseShiftDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCloseShift} className="bg-red-600 hover:bg-red-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Tutup Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Report Dialog */}
      <Dialog open={shiftReportOpen} onOpenChange={setShiftReportOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Laporan Shift
            </DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4 py-4">
              {/* Shift Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{selectedShift.shiftNumber}</h3>
                  <Badge className={selectedShift.status === 'OPEN' ? 'bg-green-600' : 'bg-gray-600'}>
                    {selectedShift.status === 'OPEN' ? 'SEDANG BERJALAN' : 'DITUTUP'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Kasir:</span>
                    <p className="font-semibold">{selectedShift.cashier.name || selectedShift.cashier.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Order:</span>
                    <p className="font-semibold">{selectedShift.totalOrders} transaksi</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mulai:</span>
                    <p className="font-semibold">{formatDate(selectedShift.startTime)}</p>
                  </div>
                  {selectedShift.endTime && (
                    <div>
                      <span className="text-gray-600">Selesai:</span>
                      <p className="font-semibold">{formatDate(selectedShift.endTime)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cash Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Ringkasan Kas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modal Awal:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Tunai:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.cashReceived)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Seharusnya Ada:</span>
                    <span className="text-green-600">{formatCurrency(selectedShift.expectedCash || 0)}</span>
                  </div>
                  {selectedShift.closingBalance !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Saldo Akhir:</span>
                      <span className="font-semibold">{formatCurrency(selectedShift.closingBalance)}</span>
                    </div>
                  )}
                  {selectedShift.cashDifference !== null && (
                    <div className={`mt-2 p-3 rounded-lg text-center font-semibold ${
                      selectedShift.cashDifference > 0 ? 'bg-green-50 text-green-700' :
                      selectedShift.cashDifference < 0 ? 'bg-red-50 text-red-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {selectedShift.cashDifference > 0 ? (
                        <><TrendingUp className="w-4 h-4 inline mr-1" /> Kelebihan {formatCurrency(Math.abs(selectedShift.cashDifference))}</>
                      ) : selectedShift.cashDifference < 0 ? (
                        <><TrendingDown className="w-4 h-4 inline mr-1" /> Kekurangan {formatCurrency(Math.abs(selectedShift.cashDifference))}</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4 inline mr-1" /> Pas! Tidak ada selisih</>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tunai:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.paymentBreakdown?.cash || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kartu Debit:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.cardPayments)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">E-Wallet:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.ewalletPayments)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">QRIS:</span>
                    <span className="font-semibold">{formatCurrency(selectedShift.qrisPayments)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Penjualan:</span>
                    <span className="text-blue-600">{formatCurrency(selectedShift.totalSales)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              {selectedShift.orders && selectedShift.orders.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      Daftar Transaksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[200px]">
                      <div className="space-y-2">
                        {selectedShift.orders.map((order: any) => (
                          <div key={order.id} className="p-2 bg-gray-50 rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{order.orderNumber}</span>
                              <span className="text-xs text-gray-500">{formatDate(order.createdAt).split(',').pop()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-600">{order.paymentMethod}</span>
                              <span className="font-semibold">{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedShift.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Catatan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{selectedShift.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShiftReportOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handlePrintReport} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
