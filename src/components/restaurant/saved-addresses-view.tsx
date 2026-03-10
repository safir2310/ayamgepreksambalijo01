'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Plus, Trash2, Edit, Navigation } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export function SavedAddressesView() {
  const { goBack } = useUIStore();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Rumah',
      address: 'Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, Kec. Pidie, Kab. Pidie, 24151',
      isDefault: true,
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        address: address.address,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: '',
        address: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSaveAddress = () => {
    if (!formData.label || !formData.address) {
      toast.error('Mohon lengkapi semua data');
      return;
    }

    if (editingAddress) {
      // Update existing address
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : addr
        )
      );
      toast.success('Alamat berhasil diperbarui');
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        label: formData.label,
        address: formData.address,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Alamat berhasil ditambahkan');
    }

    setDialogOpen(false);
  };

  const handleDeleteAddress = (id: string) => {
    const addressToDelete = addresses.find((addr) => addr.id === id);
    if (addressToDelete?.isDefault && addresses.length > 1) {
      toast.error('Tidak dapat menghapus alamat utama. Setel alamat lain sebagai utama terlebih dahulu.');
      return;
    }

    setAddresses(addresses.filter((addr) => addr.id !== id));
    toast.success('Alamat berhasil dihapus');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    toast.success('Alamat utama berhasil diubah');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold">Alamat Tersimpan</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Alamat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label Alamat</Label>
                <Input
                  id="label"
                  placeholder="Contoh: Rumah, Kantor, Kost"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Input
                  id="address"
                  placeholder="Masukkan alamat lengkap"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleSaveAddress}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white"
              >
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address List */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Belum ada alamat tersimpan</p>
              <p className="text-sm text-gray-400">
                Tambahkan alamat untuk memudahkan proses pengiriman
              </p>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-[#E53935]' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#E53935] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{address.label}</h3>
                      {address.isDefault && (
                        <span className="text-xs bg-[#E53935] text-white px-2 py-0.5 rounded-full">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 break-words">
                      {address.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetDefault(address.id)}
                        className="h-8 w-8"
                        title="Jadikan Utama"
                      >
                        <Navigation className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(address)}
                      className="h-8 w-8"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
