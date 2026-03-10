'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Search, Package, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ImageCropDialog } from './image-crop-dialog';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  spicyLevel?: number;
  isPopular: boolean;
  isPromo: boolean;
  discountPercent: number;
}

export function AdminMenuView() {
  const { goBack } = useUIStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Ayam Geprek',
    image: '',
    spicyLevel: '0',
    discountPercent: '0',
    isPopular: false,
    isPromo: false,
    available: true,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal memuat menu');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category: item.category,
        image: item.image || '',
        spicyLevel: (item.spicyLevel || 0).toString(),
        discountPercent: (item.discountPercent || 0).toString(),
        isPopular: item.isPopular,
        isPromo: item.isPromo,
        available: item.available,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Ayam Geprek',
        image: '',
        spicyLevel: '0',
        discountPercent: '0',
        isPopular: false,
        isPromo: false,
        available: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.price) {
      toast.error('Nama dan harga menu wajib diisi');
      return;
    }

    if (!formData.image) {
      toast.error('Gambar produk wajib diupload');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        image: formData.image,
        spicyLevel: parseInt(formData.spicyLevel),
        discountPercent: parseInt(formData.discountPercent) || 0,
        isPopular: formData.isPopular,
        isPromo: formData.isPromo,
        available: formData.available,
      };

      const url = editingItem
        ? `/api/menu/${editingItem.id}`
        : '/api/menu';

      const response = await fetch(url, {
        method: editingItem ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingItem ? 'Menu berhasil diperbarui' : 'Menu berhasil ditambahkan');
        setDialogOpen(false);
        fetchMenuItems();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menyimpan menu');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Gagal menyimpan menu');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Menu berhasil dihapus');
        fetchMenuItems();
      } else {
        toast.error('Gagal menghapus menu');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Gagal menghapus menu');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error('[Frontend] No file selected');
      return;
    }

    console.log('[Frontend] ========================================');
    console.log('[Frontend] Starting image upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    });

    // More flexible file type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    
    const isValidType = allowedTypes.includes(file.type) || validExtensions.includes(fileExt || '');
    
    if (!isValidType) {
      const errorMsg = `Tipe file tidak valid. Gunakan: JPEG, PNG, WebP, GIF, atau SVG.\nFile Anda: ${file.type || fileExt}`;
      console.error('[Frontend] Invalid file type:', file.type, 'Extension:', fileExt);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `Ukuran file terlalu besar. Maksimal 5MB\nUkuran file: ${sizeInMB}MB`;
      console.error('[Frontend] File too large:', file.size, 'MB:', sizeInMB);
      toast.error(errorMsg);
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      console.error('[Frontend] Empty file selected');
      toast.error('File kosong. Silakan pilih file lain.');
      return;
    }

    // Open crop dialog
    setSelectedFile(file);
    setCropDialogOpen(true);
  };

  const handleUploadCroppedImage = async (croppedFile: File) => {
    if (!croppedFile) {
      console.error('[Frontend] No cropped file');
      return;
    }

    try {
      setUploading(true);
      console.log('[Frontend] Sending cropped image upload request...');

      const uploadFormData = new FormData();
      uploadFormData.append('file', croppedFile);
      console.log('[Frontend] FormData prepared, file:', croppedFile.name, 'size:', croppedFile.size);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('[Frontend] Upload response status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('[Frontend] Upload response body length:', responseText.length);
      console.log('[Frontend] Upload response body:', responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log('[Frontend] Upload successful:', data);
          setFormData((prev) => ({ ...prev, image: data.url }));
          toast.success('✅ Gambar berhasil diupload!');
        } catch (parseError) {
          console.error('[Frontend] Failed to parse response:', parseError);
          console.error('[Frontend] Response text:', responseText);
          toast.error('Gagal memproses response server. Response tidak valid.');
        }
      } else {
        try {
          const errorData = JSON.parse(responseText);
          console.error('[Frontend] Upload failed:', errorData);
          toast.error(`❌ ${errorData.error || `Gagal upload gambar (Status: ${response.status})`}`);
        } catch {
          console.error('[Frontend] Upload failed with invalid response:', responseText);
          toast.error(`❌ Gagal upload gambar (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error('[Frontend] ========================================');
      console.error('[Frontend] Network error uploading image:', error);
      console.error('[Frontend] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error('[Frontend] ========================================');
      toast.error('❌ Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setUploading(false);
      console.log('[Frontend] Upload process completed');
      console.log('[Frontend] ========================================');
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
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
          <h1 className="text-2xl font-display font-bold">Kelola Menu</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Menu *</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Ayam Geprek Sambal Ijo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  placeholder="Deskripsi menu"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="15000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Input
                    id="category"
                    placeholder="Ayam Geprek"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Gambar Produk *</Label>

                {/* Image Preview Container */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                    {formData.image ? (
                      <>
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 shadow-lg"
                          onClick={handleRemoveImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-xs">Belum ada gambar</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.image ? 'Ganti Gambar' : 'Upload & Crop Gambar'}
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Instructions */}
                {!formData.image && (
                  <p className="text-xs text-gray-500 text-center">
                    Format gambar akan otomatis di-crop menjadi square (1:1)
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spicyLevel">Tingkat Pedas (0-10)</Label>
                  <Input
                    id="spicyLevel"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData({ ...formData, spicyLevel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPercent">Diskon (%)</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0-100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  />
                  <p className="text-xs text-gray-500">Masukkan 0 jika tidak ada diskon</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPromo}
                    onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Produk Promo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Menu Populer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Tersedia</span>
                </label>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white"
                disabled={!formData.name || !formData.price || !formData.image}
              >
                {editingItem ? 'Simpan Perubahan' : 'Tambah Menu'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Memuat menu...</p>
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Tidak ada menu</p>
            <p className="text-sm text-gray-400">
              {searchQuery
                ? 'Coba kata kunci lain'
                : 'Mulai dengan menambahkan menu baru'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className={`transition-shadow hover:shadow-md ${!item.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold truncate flex-1">{item.name}</h3>
                      {!item.available && (
                        <Badge variant="secondary" className="ml-2">
                          Tidak Tersedia
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                    {item.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {item.discountPercent > 0 ? (
                          <>
                            <p className="font-bold text-[#E53935]">
                              {formatCurrency(item.price * (1 - item.discountPercent / 100))}
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(item.price)}
                            </p>
                          </>
                        ) : (
                          <p className="font-bold text-[#E53935]">
                            {formatCurrency(item.price)}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.isPromo && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            Promo
                          </Badge>
                        )}
                        {item.discountPercent > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            {item.discountPercent}% OFF
                          </Badge>
                        )}
                        {item.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            Populer
                          </Badge>
                        )}
                        {item.spicyLevel && item.spicyLevel > 0 && (
                          <Badge variant="outline" className="text-xs">
                            🌶️ {item.spicyLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(item.id, item.name)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onClose={() => {
          setCropDialogOpen(false);
          setSelectedFile(null);
        }}
        imageFile={selectedFile}
        onCropComplete={handleUploadCroppedImage}
      />
    </div>
  );
}
