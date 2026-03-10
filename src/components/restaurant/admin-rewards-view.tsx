'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Gift, ArrowLeft, Search, X, CheckCircle2, XCircle, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  _count: {
    redemptions: number;
  };
}

interface Redemption {
  id: string;
  status: string;
  pointsUsed: number;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
  };
  reward: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    pointsCost: number;
  };
}

export function AdminRewardsView() {
  const { goBack } = useUIStore();
  const [activeTab, setActiveTab] = useState<'rewards' | 'redemptions'>('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [expandedReward, setExpandedReward] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    pointsCost: 0,
    stock: 0,
    category: 'general',
    active: true,
  });

  useEffect(() => {
    fetchRewards();
    fetchRedemptions();
  }, [statusFilter]);

  const fetchRewards = async () => {
    try {
      setLoadingRewards(true);
      const response = await fetch('/api/admin/rewards');
      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Gagal memuat rewards');
    } finally {
      setLoadingRewards(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      setLoadingRedemptions(true);
      const url = statusFilter !== 'all' ? `/api/admin/redemptions?status=${statusFilter}` : '/api/admin/redemptions';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      toast.error('Gagal memuat penukaran');
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const handleOpenDialog = (reward?: Reward) => {
    if (reward) {
      setEditingReward(reward);
      setFormData({
        name: reward.name,
        description: reward.description || '',
        image: reward.image || '',
        pointsCost: reward.pointsCost,
        stock: reward.stock,
        category: reward.category || 'general',
        active: reward.active,
      });
    } else {
      setEditingReward(null);
      setFormData({
        name: '',
        description: '',
        image: '',
        pointsCost: 0,
        stock: 0,
        category: 'general',
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingReward
        ? `/api/admin/rewards/${editingReward.id}`
        : '/api/admin/rewards';

      const method = editingReward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingReward ? 'Reward berhasil diperbarui' : 'Reward berhasil ditambahkan');
        setIsDialogOpen(false);
        fetchRewards();
        setFormData({
          name: '',
          description: '',
          image: '',
          pointsCost: 0,
          stock: 0,
          category: 'general',
          active: true,
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan reward');
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('Gagal menyimpan reward');
    }
  };

  const handleDeleteReward = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus reward "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rewards/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Reward berhasil dihapus');
        fetchRewards();
      } else {
        toast.error('Gagal menghapus reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Gagal menghapus reward');
    }
  };

  const handleUpdateStatus = async (redemptionId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/redemptions/${redemptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Status berhasil diperbarui');
        fetchRedemptions();
      } else {
        toast.error('Gagal memperbarui status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal memperbarui status');
    }
  };

  const filteredRewards = rewards.filter(
    (reward) =>
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Menunggu', color: 'bg-orange-100 text-orange-600 border-orange-200', icon: Clock },
      APPROVED: { label: 'Disetujui', color: 'bg-blue-100 text-blue-600 border-blue-200', icon: CheckCircle2 },
      COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-600 border-green-200', icon: CheckCircle2 },
      REJECTED: { label: 'Ditolak', color: 'bg-red-100 text-red-600 border-red-200', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
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
          <h1 className="text-xl font-display font-bold">Manajemen Rewards</h1>
          <p className="text-sm text-gray-500">Kelola reward dan penukaran poin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#E53935]">{rewards.length}</div>
            <div className="text-sm text-gray-500">Total Rewards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{redemptions.filter(r => r.status === 'COMPLETED').length}</div>
            <div className="text-sm text-gray-500">Penukaran Selesai</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{redemptions.filter(r => r.status === 'PENDING').length}</div>
            <div className="text-sm text-gray-500">Menunggu Persetujuan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{redemptions.length}</div>
            <div className="text-sm text-gray-500">Total Penukaran</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'rewards' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rewards')}
          className={activeTab === 'rewards' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
        >
          <Gift className="w-4 h-4 mr-2" />
          Rewards
        </Button>
        <Button
          variant={activeTab === 'redemptions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('redemptions')}
          className={activeTab === 'redemptions' ? 'bg-[#E53935] hover:bg-[#D32F2F] text-white' : ''}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Penukaran
        </Button>
      </div>

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Daftar Rewards</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari reward..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => handleOpenDialog()}
                      className="bg-[#E53935] hover:bg-[#D32F2F] text-white whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Reward
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingReward ? 'Edit Reward' : 'Tambah Reward Baru'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Reward *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Masukkan nama reward"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Masukkan deskripsi reward"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image">URL Gambar</Label>
                        <Input
                          id="image"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pointsCost">Poin *</Label>
                          <Input
                            id="pointsCost"
                            type="number"
                            value={formData.pointsCost}
                            onChange={(e) => setFormData({ ...formData, pointsCost: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            required
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stok (0 = tak terbatas)</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Umum</SelectItem>
                            <SelectItem value="food">Makanan</SelectItem>
                            <SelectItem value="drink">Minuman</SelectItem>
                            <SelectItem value="merchandise">Merchandise</SelectItem>
                            <SelectItem value="voucher">Voucher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="active">Aktif</Label>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                        >
                          {editingReward ? 'Simpan' : 'Tambah'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingRewards ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Tidak ada reward ditemukan</p>
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'Coba kata kunci lain' : 'Mulai dengan menambahkan reward baru'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {reward.image && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={reward.image}
                                  alt={reward.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{reward.name}</h3>
                                {!reward.active && (
                                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                    Non-aktif
                                  </Badge>
                                )}
                              </div>
                              {reward.description && (
                                <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                                  {reward.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-[#E53935] font-semibold">
                                  {reward.pointsCost} poin
                                </span>
                                <span className="text-gray-500">
                                  Stok: {reward.stock < 0 ? 'Tak terbatas' : reward.stock}
                                </span>
                                <span className="text-gray-500">
                                  {reward._count.redemptions} penukaran
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedReward(expandedReward === reward.id ? null : reward.id)}
                              className="h-8 w-8"
                            >
                              {expandedReward === reward.id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(reward)}
                              className="h-8 w-8"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteReward(reward.id, reward.name)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Redemptions Tab */}
      {activeTab === 'redemptions' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Daftar Penukaran</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Menunggu</SelectItem>
                  <SelectItem value="APPROVED">Disetujui</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="REJECTED">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Tidak ada penukaran ditemukan</p>
                <p className="text-sm text-gray-400">
                  {statusFilter !== 'all' ? 'Coba filter lain' : 'Belum ada penukaran'}
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
                            <div className="flex items-start gap-4 mb-3">
                              <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {redemption.user.name?.charAt(0) || redemption.user.username.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold">{redemption.reward.name}</h3>
                                <p className="text-sm text-gray-600">{redemption.user.name || redemption.user.username}</p>
                                <p className="text-xs text-gray-500">{redemption.user.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusBadge(redemption.status)}
                              <span className="text-sm text-gray-600">
                                {redemption.pointsUsed} poin • {new Date(redemption.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            {redemption.notes && (
                              <p className="text-sm text-gray-500">Catatan: {redemption.notes}</p>
                            )}
                          </div>
                          {redemption.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(redemption.id, 'APPROVED')}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Setuju
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUpdateStatus(redemption.id, 'REJECTED')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          )}
                          {redemption.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(redemption.id, 'COMPLETED')}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Selesai
                            </Button>
                          )}
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
    </div>
  );
}
