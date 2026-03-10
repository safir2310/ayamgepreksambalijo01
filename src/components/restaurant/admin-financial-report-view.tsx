'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Download, Printer, TrendingUp, DollarSign, Wallet, CreditCard, Scan, ChevronDown, FileText } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FinancialData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  cashPayments: number;
  cardPayments: number;
  ewalletPayments: number;
  qrisPayments: number;
  avgOrderValue: number;
}

export function AdminFinancialReportView() {
  const { goBack } = useUIStore();
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setDefaultDates();
    fetchFinancialData();
  }, [selectedPeriod]);

  const setDefaultDates = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (selectedPeriod) {
      case 'today':
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
        break;
      case 'yesterday':
        setStartDate(formatDate(yesterday));
        setEndDate(formatDate(yesterday));
        break;
      case 'week':
        setStartDate(formatDate(weekAgo));
        setEndDate(formatDate(today));
        break;
      case 'month':
        setStartDate(formatDate(monthAgo));
        setEndDate(formatDate(today));
        break;
      default:
        setStartDate(formatDate(today));
        setEndDate(formatDate(today));
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/financial-report?startDate=${startDate}&endDate=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    if (!printWindow) return;

    const reportHTML = generateReportHTML();
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generateReportHTML = () => {
    const totalRevenue = financialData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalOrders = financialData.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalCash = financialData.reduce((sum, item) => sum + item.cashPayments, 0);
    const totalCard = financialData.reduce((sum, item) => sum + item.cardPayments, 0);
    const totalEwallet = financialData.reduce((sum, item) => sum + item.ewalletPayments, 0);
    const totalQris = financialData.reduce((sum, item) => sum + item.qrisPayments, 0);

    const dailyDataHtml = financialData.map((item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; text-align: left;">${formatDate(item.date)}</td>
        <td style="padding: 8px; text-align: right;">${item.totalOrders}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.totalRevenue)}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.cashPayments)}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.cardPayments)}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.ewalletPayments)}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.qrisPayments)}</td>
        <td style="padding: 8px; text-align: right;">${formatCurrency(item.avgOrderValue)}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <title>Laporan Keuangan</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      padding: 20px;
      font-size: 12px;
      margin: 0;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
      border-bottom: 2px solid #000;
    }
    .summary {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 10px;
      color: #6b7280;
    }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>LAPORAN KEUANGAN</h1>
    <p>AYAM GEPREK SAMBAL IJO</p>
    <p>Jl. Medan-Banda Aceh, Simpang Camat, Gampong Tijue, 24151</p>
    <p>Telp: 085260812758</p>
  </div>

  <div style="margin: 20px 0;">
    <p><strong>Periode:</strong> ${formatDate(startDate)} s/d ${formatDate(endDate)}</p>
    <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleString('id-ID')}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <span>Total Pendapatan:</span>
      <span>${formatCurrency(totalRevenue)}</span>
    </div>
    <div class="summary-item">
      <span>Total Pesanan:</span>
      <span>${totalOrders}</span>
    </div>
    <div class="summary-item">
      <span>Rata-rata Order:</span>
      <span>${formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Total Order</th>
        <th>Total Pendapatan</th>
        <th>Tunai</th>
        <th>Kartu Debit</th>
        <th>E-Wallet</th>
        <th>QRIS</th>
        <th>Rata-rata Order</th>
      </tr>
    </thead>
    <tbody>
      ${dailyDataHtml}
    </tbody>
    <tfoot>
      <tr style="background-color: #f3f4f6; font-weight: bold;">
        <td style="border-top: 2px solid #000; padding: 8px;">TOTAL</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${totalOrders}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalRevenue)}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalCash)}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalCard)}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalEwallet)}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalQris)}</td>
        <td style="border-top: 2px solid #000; padding: 8px; text-align: right;">${formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="summary">
    <div class="summary-item">
      <span>Total Tunai:</span>
      <span>${formatCurrency(totalCash)}</span>
    </div>
    <div class="summary-item">
      <span>Total Kartu Debit:</span>
      <span>${formatCurrency(totalCard)}</span>
    </div>
    <div class="summary-item">
      <span>Total E-Wallet:</span>
      <span>${formatCurrency(totalEwallet)}</span>
    </div>
    <div class="summary-item">
      <span>Total QRIS:</span>
      <span>${formatCurrency(totalQris)}</span>
    </div>
  </div>

  <div class="footer">
    <p>Laporan Keuangan - AYAM GEPREK SAMBAL IJO</p>
    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
    <p>Simpan laporan ini sebagai arsip keuangan</p>
  </div>
</body>
</html>`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totals = financialData.reduce((acc, item) => ({
    totalOrders: acc.totalOrders + item.totalOrders,
    totalRevenue: acc.totalRevenue + item.totalRevenue,
    cashPayments: acc.cashPayments + item.cashPayments,
    cardPayments: acc.cardPayments + item.cardPayments,
    ewalletPayments: acc.ewalletPayments + item.ewalletPayments,
    qrisPayments: acc.qrisPayments + item.qrisPayments,
  }), {
    totalOrders: 0,
    totalRevenue: 0,
    cashPayments: 0,
    cardPayments: 0,
    ewalletPayments: 0,
    qrisPayments: 0,
  });

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
          <h1 className="text-2xl font-display font-bold">Laporan Keuangan</h1>
          <p className="text-sm text-gray-500">Lihat dan cetak laporan keuangan</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Periode</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="yesterday">Kemarin</SelectItem>
                  <SelectItem value="week">7 Hari Terakhir</SelectItem>
                  <SelectItem value="month">30 Hari Terakhir</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            {selectedPeriod === 'custom' && (
              <Button onClick={fetchFinancialData} disabled={loading}>
                <FileText className="w-4 h-4 mr-2" />
                Tampilkan
              </Button>
            )}
            <Button onClick={handlePrint} disabled={loading || financialData.length === 0} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Cetak Laporan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Total Pendapatan</span>
            </div>
            <p className="text-lg font-bold text-[#E53935]">{formatCurrency(totals.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Total Order</span>
            </div>
            <p className="text-lg font-bold">{totals.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-500">Tunai</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totals.cashPayments)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-500">Kartu Debit</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totals.cardPayments)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-gray-500">E-Wallet</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totals.ewalletPayments)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Scan className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-500">QRIS</span>
            </div>
            <p className="text-lg font-bold">{formatCurrency(totals.qrisPayments)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : financialData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Tidak ada data untuk periode yang dipilih</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Tanggal</th>
                    <th className="text-right p-3 font-medium">Total Order</th>
                    <th className="text-right p-3 font-medium">Total Pendapatan</th>
                    <th className="text-right p-3 font-medium">Tunai</th>
                    <th className="text-right p-3 font-medium">Kartu Debit</th>
                    <th className="text-right p-3 font-medium">E-Wallet</th>
                    <th className="text-right p-3 font-medium">QRIS</th>
                    <th className="text-right p-3 font-medium">Rata-rata Order</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(item.date)}</td>
                      <td className="p-3 text-right">{item.totalOrders}</td>
                      <td className="p-3 text-right font-semibold text-[#E53935]">
                        {formatCurrency(item.totalRevenue)}
                      </td>
                      <td className="p-3 text-right">{formatCurrency(item.cashPayments)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.cardPayments)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.ewalletPayments)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.qrisPayments)}</td>
                      <td className="p-3 text-right">{formatCurrency(item.avgOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">TOTAL</td>
                    <td className="p-3 text-right">{totals.totalOrders}</td>
                    <td className="p-3 text-right text-[#E53935]">{formatCurrency(totals.totalRevenue)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.cashPayments)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.cardPayments)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.ewalletPayments)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.qrisPayments)}</td>
                    <td className="p-3 text-right">{formatCurrency(totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
