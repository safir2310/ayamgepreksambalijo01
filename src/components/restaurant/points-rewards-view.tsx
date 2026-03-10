'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, TrendingUp, Gift, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PointTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED';
  description: string;
  points: number;
  date: string;
}

interface RedeemCode {
  code: string;
  discountPercent: number;
  discountValue: number;
  pointsUsed: number;
  expiresAt: string;
  isUsed: boolean;
  usedAt?: string;
}

export function PointsRewardsView() {
  const { goBack } = useUIStore();
  const { user, fetchUser } = useUserStore();

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(200);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [createdRedeemCode, setCreatedRedeemCode] = useState<RedeemCode | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  // Load user transactions and redeem codes
  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
      fetchRedeemCodes();
    }
  }, [user?.id]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/point-transactions?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchRedeemCodes = async () => {
    try {
      const response = await fetch(`/api/redeem-codes?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setRedeemCodes(data);
      }
    } catch (error) {
      console.error('Error fetching redeem codes:', error);
    }
  };

  const handleRedeemPoints = async () => {
    if (!user?.id) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (pointsToRedeem < 200) {
      toast.error('Minimum poin untuk ditukar adalah 200');
      return;
    }

    if (pointsToRedeem > (user.points || 0)) {
      toast.error('Poin tidak mencukupi');
      return;
    }

    setRedeemLoading(true);

    try {
      const response = await fetch('/api/redeem-code/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pointsToRedeem
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedRedeemCode(data);
        setRedeemDialogOpen(true);
        fetchUser(); // Refresh user points
        fetchRedeemCodes(); // Refresh redeem codes
        setPointsToRedeem(200); // Reset to default
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal membuat kode redeem');
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast.error('Gagal menukar poin');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRedeemCode) {
      navigator.clipboard.writeText(createdRedeemCode.code);
      setCodeCopied(true);
      toast.success('Kode berhasil disalin!');
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalEarned = transactions
    .filter((t) => t.type === 'EARNED')
    .reduce((sum, t) => sum + t.points, 0);

  const totalRedeemed = Math.abs(
    transactions
      .filter((t) => t.type === 'REDEEMED')
      .reduce((sum, t) => sum + t.points, 0)
  );

  // Calculate discount info
  const calculateDiscount = () => {
    const points = pointsToRedeem;
    const discountValue = points * 10;
    const discountPercent = Math.min(50, Math.round((discountValue / 50000) * 100));
    return { discountValue, discountPercent };
  };

  const { discountValue, discountPercent } = calculateDiscount();

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
        <h1 className="text-2xl font-display font-bold">Poin & Reward</h1>
      </div>

      {/* Points Balance Card */}
      <Card className="bg-gradient-to-br from-[#E53935] to-[#D32F2F] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-1">Total Poin Anda</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-bold">{user?.points || 0}</h2>
                <p className="text-white/80">Poin</p>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Diperoleh</p>
                <p className="text-lg font-bold text-green-600">+{totalEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Ditukar</p>
                <p className="text-lg font-bold text-red-600">{totalRedeemed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redeem Points Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tukar Poin Menjadi Kode Diskon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Tukar poin Anda untuk mendapatkan kode diskon yang bisa digunakan di keranjang.
            1 poin = Rp 10 diskon. Maksimal 50% diskon.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2">
                Jumlah Poin (Min. 200):
              </label>
              <Input
                type="number"
                min="200"
                max={user?.points || 0}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 200)}
                disabled={redeemLoading}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon yang didapat:</span>
                <span className="font-semibold text-[#E53935]">
                  {discountPercent >= 100 ? 'Maks 50%' : `${discountPercent}%`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nilai Diskon:</span>
                <span className="font-semibold">
                  Rp{discountValue.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <Button
              onClick={handleRedeemPoints}
              className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-12"
              disabled={redeemLoading || (user?.points || 0) < 200}
            >
              {redeemLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Tukar {pointsToRedeem} Poin
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Redeem Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kode Redeem Saya</CardTitle>
        </CardHeader>
        <CardContent>
          {redeemCodes.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Belum ada kode redeem</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redeemCodes.map((redeemCode) => (
                <div
                  key={redeemCode.code}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg ${
                    redeemCode.isUsed
                      ? 'bg-gray-50 opacity-60'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg tracking-wider">
                        {redeemCode.code}
                      </span>
                      {redeemCode.isUsed && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Digunakan
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Nilai: Rp{redeemCode.discountValue.toLocaleString('id-ID')}</div>
                      <div>{redeemCode.discountPercent}% diskon</div>
                      <div>Kadaluarsa: {formatDateTime(redeemCode.expiresAt)}</div>
                    </div>
                  </div>
                  {!redeemCode.isUsed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(redeemCode.code);
                        toast.success('Kode berhasil disalin!');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Salin
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cara Dapatkan Poin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">1</span>
            </div>
            <div>
              <p className="font-medium text-sm">Beli Menu</p>
              <p className="text-xs text-gray-500">
                Dapatkan 1 poin untuk setiap Rp 1.000 pembelanjaan
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">2</span>
            </div>
            <div>
              <p className="font-medium text-sm">Bonus Pendaftaran</p>
              <p className="text-xs text-gray-500">
                Dapatkan 100 poin saat pertama kali mendaftar
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            <div>
              <p className="font-medium text-sm">Referal Teman</p>
              <p className="text-xs text-gray-500">
                Dapatkan 50 poin untuk setiap teman yang berhasil mendaftar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Belum ada riwayat transaksi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'EARNED'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          transaction.type === 'EARNED'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.type === 'EARNED'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'EARNED' ? '+' : ''}
                    {transaction.points} Poin
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redeem Success Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              Kode Redeem Berhasil Dibuat!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {createdRedeemCode && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Kode Redeem Anda:</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <span className="font-mono text-2xl font-bold tracking-wider">
                        {createdRedeemCode.code}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyCode}
                      disabled={codeCopied}
                    >
                      {codeCopied ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  {codeCopied && (
                    <p className="text-sm text-green-600 text-center">
                      Kode berhasil disalin ke clipboard!
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nilai Diskon:</span>
                    <span className="font-semibold text-[#E53935]">
                      Rp{createdRedeemCode.discountValue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon:</span>
                    <span className="font-semibold">
                      {createdRedeemCode.discountPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Poin yang ditukar:</span>
                    <span className="font-semibold">
                      {createdRedeemCode.pointsUsed} Poin
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Masa berlaku:</span>
                    <span className="font-semibold">
                      {formatDate(createdRedeemCode.expiresAt)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Gunakan kode ini di halaman keranjang saat checkout untuk mendapatkan diskon
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setRedeemDialogOpen(false)}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              Mengerti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
