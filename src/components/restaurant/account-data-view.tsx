'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, ArrowLeft, Save } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AccountDataView() {
  const { goBack } = useUIStore();
  const { user, updateUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update user in store
      updateUser({
        ...user!,
        ...formData,
      });

      // Also update on server
      const response = await fetch(`/api/auth/profile?userId=${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data');
      }

      toast.success('Data akun berhasil diperbarui');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
        <h1 className="text-2xl font-display font-bold">Data Akun</h1>
      </div>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nama Lengkap
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              disabled
            />
            <p className="text-xs text-gray-500">Username tidak dapat diubah</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Nomor Telepon
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Masukkan nomor telepon"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white h-12"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Simpan Perubahan
          </>
        )}
      </Button>
    </div>
  );
}
