'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, ArrowLeft, Sparkles, Info, X, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  pointsCost: number;
  stock: number;
  category: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Redemption {
  id: string;
  status: string;
  pointsUsed: number;
  notes: string | null;
  createdAt: string;
  reward: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    pointsCost: number;
  };
}

interface RedeemCode {
  code: string;
  discountPercent: number;
  discountValue: number;
  pointsUsed: number;
  expiresAt: string;
}

export function RewardsView() {
  const { goBack } = useUIStore();
  const { user } = useUserStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [notes, setNotes] = useState('');
  const [showMyRedemptions, setShowMyRedemptions] = useState(false);
  const [redeemCode, setRedeemCode] = useState<RedeemCode | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = useState(false);

  useEffect(() => {
    fetchRewards();
    if (user?.id) {
      fetchMyRedemptions();
    }
  }, [user]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const url = user?.id ? `/api/rewards?userId=${user.id}` : '/api/rewards';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
        setUserPoints(data.userPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Gagal memuat rewards');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRedemptions = async () => {
    if (!user?.id) return;

    try {
      setLoadingRedemptions(true);
      const response = await fetch(`/api/admin/redemptions?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user?.id) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    setSelectedReward(reward);
    setNotes('');
    setRedeemDialogOpen(true);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !user?.id) return;

    try {
      setRedeeming(true);
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          rewardId: selectedReward.id,
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Save redeem code if available
        if (data.redeemCode) {
          setRedeemCode(data.redeemCode);
          setRedeemCodeDialogOpen(true);
        }
        toast.success('Reward berhasil ditukar!');
        setRedeemDialogOpen(false);
        setUserPoints(data.userPoints);
        fetchRewards();
        fetchMyRedemptions();
        setNotes('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menukar reward');
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Gagal menukar reward');
    } finally {
      setRedeeming(false);
    }
  };

  const handleCopyCode = () => {
    if (redeemCode) {
      navigator.clipboard.writeText(redeemCode.code);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Menunggu', color: 'bg-orange-100 text-orange-600 border-orange-200' },
      APPROVED: { label: 'Disetujui', color: 'bg-blue-100 text-blue-600 border-blue-200' },
      COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-600 border-green-200' },
      REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-600 border-red-200' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold">Tukar Poin</h1>
          <p className="text-sm text-gray-500">Menukarkan poin dengan reward menarik</p>
        </div>
      </div>

      {/* Points Card */}
      <Card className="bg-gradient-to-r from-[#E53935] to-[#D32F2F] text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Poin Saya</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-bold">{userPoints}</h2>
                <Coins className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">
                {userPoints > 0 ? 'Bisa ditukar!' : 'Kumpulkan lebih banyak poin'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={!showMyRedemptions ? 'default' : 'outline'}
          onClick={() => setShowMyRedemptions(false)}
          className={!showMyRedemptions ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
        >
          <Gift className="w-4 h-4 mr-2" />
          Daftar Reward
        </Button>
        <Button
          variant={showMyRedemptions ? 'default' : 'outline'}
          onClick={() => setShowMyRedemptions(true)}
          className={showMyRedemptions ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Riwayat Penukaran
        </Button>
      </div>

      {/* Rewards List */}
      {!showMyRedemptions && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-32 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Belum ada reward tersedia</p>
                <p className="text-sm text-gray-400">Nantikan reward menarik yang akan datang!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward, index) => {
                  const canRedeem = userPoints >= reward.pointsCost && (reward.stock < 0 || reward.stock > 0);
                  const outOfStock = reward.stock === 0;

                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className={`h-full ${outOfStock ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}>
                        {reward.image && (
                          <div className="w-full h-40 overflow-hidden bg-gray-100">
                            <img
                              src={reward.image}
                              alt={reward.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold line-clamp-1 flex-1">{reward.name}</h3>
                            {outOfStock && (
                              <Badge className="bg-red-100 text-red-600 border-red-200 ml-2">
                                Habis
                              </Badge>
                            )}
                          </div>
                          {reward.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {reward.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[#E53935] font-bold">
                              <Coins className="w-4 h-4" />
                              {reward.pointsCost} Poin
                            </div>
                            {reward.stock >= 0 && (
                              <span className="text-xs text-gray-500">
                                Stok: {reward.stock}
                              </span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canRedeem || outOfStock}
                            className="w-full mt-3 bg-[#E53935] hover:bg-[#D32F2F] text-white"
                          >
                            {canRedeem ? 'Tukar Poin' : outOfStock ? 'Stok Habis' : 'Poin Tidak Cukup'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Redemptions */}
      {showMyRedemptions && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Penukaran</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRedemptions ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : redemptions.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Belum ada penukaran</p>
                <p className="text-sm text-gray-400">
                  {user ? 'Mulai tukar poin dengan reward!' : 'Login untuk melihat riwayat penukaran'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {redemptions.map((redemption, index) => (
                  <motion.div
                    key={redemption.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{redemption.reward.name}</h3>
                              {getStatusBadge(redemption.status)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Coins className="w-4 h-4" />
                              <span>{redemption.pointsUsed} poin</span>
                              <span>•</span>
                              <span>{new Date(redemption.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            {redemption.notes && (
                              <p className="text-sm text-gray-500 mt-2">Catatan: {redemption.notes}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#E53935]" />
              Tukar Poin
            </DialogTitle>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-1">{selectedReward.name}</h3>
                {selectedReward.description && (
                  <p className="text-sm text-gray-600 mb-2">{selectedReward.description}</p>
                )}
                <div className="flex items-center gap-2 text-[#E53935] font-bold">
                  <Coins className="w-4 h-4" />
                  {selectedReward.pointsCost} Poin
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                  Poin Anda akan berkurang {selectedReward.pointsCost} poin setelah penukaran.
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan untuk kasir..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRedeemDialogOpen(false)} disabled={redeeming}>
                  Batal
                </Button>
                <Button
                  onClick={confirmRedeem}
                  disabled={redeeming}
                  className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                >
                  {redeeming ? 'Memproses...' : 'Konfirmasi Tukar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Redeem Code Success Dialog */}
      <Dialog open={redeemCodeDialogOpen} onOpenChange={setRedeemCodeDialogOpen}>
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
            {redeemCode && (
              <>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">Kode Redeem Anda:</p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg">
                      <span className="font-mono text-2xl font-bold tracking-wider">
                        {redeemCode.code}
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
                      Rp{redeemCode.discountValue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon:</span>
                    <span className="font-semibold">
                      {redeemCode.discountPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Poin yang ditukar:</span>
                    <span className="font-semibold">
                      {redeemCode.pointsUsed} Poin
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Masa berlaku:</span>
                    <span className="font-semibold">
                      {formatDate(redeemCode.expiresAt)}
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
              onClick={() => setRedeemCodeDialogOpen(false)}
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
