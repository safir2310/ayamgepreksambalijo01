'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, UserPlus, ArrowLeft, Search, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Cashier {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export function CashierManagementView() {
  const { goBack } = useUIStore();
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [expandedCashier, setExpandedCashier] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cashiers');
      if (response.ok) {
        const data = await response.json();
        setCashiers(data);
      }
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      toast.error('Gagal memuat daftar kasir');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cashier?: Cashier) => {
    if (cashier) {
      setEditingCashier(cashier);
      setFormData({
        username: cashier.username,
        password: '',
        name: cashier.name || '',
        email: cashier.email || '',
        phone: cashier.phone || '',
        avatar: cashier.avatar || '',
      });
    } else {
      setEditingCashier(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        avatar: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCashier
        ? `/api/admin/cashiers/${editingCashier.id}`
        : '/api/admin/cashiers';

      const method = editingCashier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingCashier ? 'Kasir berhasil diperbarui' : 'Kasir berhasil ditambahkan');
        setIsDialogOpen(false);
        fetchCashiers();
        setFormData({
          username: '',
          password: '',
          name: '',
          email: '',
          phone: '',
          avatar: '',
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan kasir');
      }
    } catch (error) {
      console.error('Error saving cashier:', error);
      toast.error('Gagal menyimpan kasir');
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kasir ${username}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/cashiers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kasir berhasil dihapus');
        fetchCashiers();
      } else {
        toast.error('Gagal menghapus kasir');
      }
    } catch (error) {
      console.error('Error deleting cashier:', error);
      toast.error('Gagal menghapus kasir');
    }
  };

  const filteredCashiers = cashiers.filter(
    (cashier) =>
      cashier.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cashier.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-xl font-display font-bold">Manajemen Kasir</h1>
          <p className="text-sm text-gray-500">Kelola akun kasir aplikasi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#E53935]">{cashiers.length}</div>
            <div className="text-sm text-gray-500">Total Kasir</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Daftar Kasir</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari kasir..."
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
                    Tambah Kasir
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCashier ? 'Edit Kasir' : 'Tambah Kasir Baru'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Masukkan username"
                        required
                      />
                    </div>
                    {!editingCashier && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Masukkan password"
                          required
                        />
                      </div>
                    )}
                    {editingCashier && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password (Biarkan kosong jika tidak diubah)</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Password baru"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Masukkan email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Masukkan nomor telepon"
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                      >
                        {editingCashier ? 'Simpan' : 'Tambah'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCashiers.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Tidak ada kasir ditemukan</p>
              <p className="text-sm text-gray-400">
                {searchQuery ? 'Coba kata kunci lain' : 'Mulai dengan menambahkan kasir baru'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCashiers.map((cashier, index) => (
                <motion.div
                  key={cashier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-[#E53935] flex items-center justify-center text-white font-bold text-lg">
                              {cashier.name?.charAt(0) || cashier.username.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{cashier.name || cashier.username}</h3>
                                <Badge className="bg-[#FFC107] text-black border-[#FFC107]">Kasir</Badge>
                              </div>
                              <p className="text-sm text-gray-500">@{cashier.username}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            {cashier.phone && (
                              <span className="flex items-center gap-1">
                                📱 {cashier.phone}
                              </span>
                            )}
                            {cashier.email && (
                              <span className="flex items-center gap-1">
                                ✉️ {cashier.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setExpandedCashier(expandedCashier === cashier.id ? null : cashier.id)}
                            className="h-8 w-8"
                          >
                            {expandedCashier === cashier.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(cashier)}
                            className="h-8 w-8"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cashier.id, cashier.username)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedCashier === cashier.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t mt-4 pt-4"
                          >
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">ID:</span>
                                <span className="ml-2 font-mono text-xs">{cashier.id}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Poin:</span>
                                <span className="ml-2 font-semibold text-[#E53935]">{cashier.points}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Dibuat:</span>
                                <span className="ml-2">{new Date(cashier.createdAt).toLocaleDateString('id-ID')}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Terupdate:</span>
                                <span className="ml-2">{new Date(cashier.updatedAt).toLocaleDateString('id-ID')}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
