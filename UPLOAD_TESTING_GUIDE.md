# Guide: Testing Image Upload

## Perbaikan yang Telah Dilakukan

### 1. API Upload (`/src/app/api/upload/route.ts`)
✅ Logging lebih detail dengan separator untuk debugging mudah
✅ Dukungan untuk file SVG
✅ Validasi tipe file lebih fleksibel (cek MIME type dan ekstensi)
✅ Validasi file kosong
✅ Error handling saat membuat direktori
✅ Log buffer size dan cek file setelah save
✅ Error messages yang lebih jelas

### 2. Frontend Upload Handler (`/src/components/restaurant/admin-menu-view.tsx`)
✅ Logging detail dengan separator
✅ Validasi tipe file lebih fleksibel (cek MIME type dan ekstensi)
✅ Validasi file kosong
✅ Log lastModified file
✅ Log detail FormData preparation
✅ Error messages dengan emoji
✅ Accept attribute: `image/*` (semua jenis gambar)
✅ `capture="environment"` untuk mobile (kamera belakang)
✅ Error handling response parsing lebih baik
✅ Logging network error detail

## Cara Testing Upload Gambar

### Langkah 1: Buka Browser DevTools
1. Buka website di browser
2. Tekan `F12` atau `Ctrl+Shift+I` (Windows/Linux) atau `Cmd+Option+I` (Mac)
3. Pilih tab **Console**

### Langkah 2: Coba Upload Gambar
1. Login sebagai admin
2. Buka **Kelola Menu**
3. Klik **Tambah Menu** atau **Edit** menu
4. Klik tombol **"Upload dari HP"**
5. Pilih file gambar
6. Lihat output di Console

### Langkah 3: Baca Console Logs

**Logs yang akan muncul saat sukses:**

```
[Frontend] ========================================
[Frontend] Starting image upload: {name: "photo.jpg", type: "image/jpeg", size: 123456, ...}
[Frontend] Sending upload request...
[Frontend] FormData prepared, file: photo.jpg, size: 123456
[Frontend] Upload response status: 200 OK
[Frontend] Upload response body: {"url":"/uploads/...", ...}
[Frontend] Upload successful: {url: "/uploads/...", ...}
[Upload API] ========================================
[Upload API] Starting file upload...
[Upload API] File received: {name: "photo.jpg", type: "image/jpeg", size: 123456, ...}
[Upload API] Saving file to: /path/to/file.jpg
[Upload API] File saved successfully
[Upload API] Upload successful: {url: "/uploads/...", ...}
[Upload API] ========================================
[Frontend] Upload process completed
[Frontend] ========================================
```

### Langkah 4: Cek Berbagai Tipe File

Test dengan berbagai tipe file:

| Tipe File | Ekstensi | Status |
|-----------|----------|--------|
| JPEG | .jpg, .jpeg | ✅ Didukung |
| PNG | .png | ✅ Didukung |
| WebP | .webp | ✅ Didukung |
| GIF | .gif | ✅ Didukung |
| SVG | .svg | ✅ Didukung |
| Lainnya | .pdf, .doc, dll | ❌ Ditolak |

### Langkah 5: Test Error Scenarios

#### 1. File Terlalu Besar (>5MB)
```
❌ Ukuran file terlalu besar. Maksimal 5MB
Ukuran file: 6.5MB
```

#### 2. Tipe File Tidak Valid
```
❌ Tipe file tidak valid. Gunakan: JPEG, PNG, WebP, GIF, atau SVG.
File Anda: application/pdf
```

#### 3. File Kosong
```
❌ File kosong. Silakan pilih file lain.
```

#### 4. Network Error
```
❌ Terjadi kesalahan jaringan. Silakan coba lagi.
```

## Perbedaan Implementasi Baru

### File Input Attribute

**Sebelum:**
```html
<input
  type="file"
  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
  onChange={handleImageUpload}
/>
```

**Sesudah:**
```html
<input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handleImageUpload}
/>
```

### Keuntungan:
- ✅ `accept="image/*"` - Menerima semua jenis gambar
- ✅ `capture="environment"` - Di mobile, membuka kamera belakang
- ✅ Lebih fleksibel untuk berbagai device dan browser

### Validasi File Type

**Sebelum:** Hanya cek MIME type
```typescript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
if (!allowedTypes.includes(file.type)) { ... }
```

**Sesudah:** Cek MIME type DAN ekstensi file
```typescript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const fileExt = file.name.split('.').pop()?.toLowerCase();
const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

const isValidType = allowedTypes.includes(file.type) || validExtensions.includes(fileExt || '');
```

### Keuntungan:
- ✅ Beberapa browser/OS tidak mengirim MIME type yang benar
- ✅ Fallback ke validasi ekstensi file
- ✅ Lebih robust untuk berbagai platform

## Troubleshooting

### Masalah 1: Tombol Upload Tidak Berfungsi
**Solusi:**
- Cek console untuk error JavaScript
- Pastikan `fileInputRef` terinisialisasi dengan benar
- Cek apakah event handler terpasang

### Masalah 2: Error 500 dari API
**Solusi:**
- Buka console dan cari log `[Upload API] Error uploading file:`
- Cek error details di log
- Pastikan folder `public/uploads/` bisa ditulis

### Masalah 3: File Tidak Terupload ke Folder
**Solusi:**
```bash
# Cek permissions folder uploads
ls -la /home/z/my-project/public/uploads/

# Pastikan folder bisa ditulis
chmod 755 /home/z/my-project/public/uploads/
```

### Masalah 4: Preview Gambar Tidak Muncul
**Solusi:**
- Cek URL yang dikembalikan API
- Pastikan file benar-benar ada di folder `public/uploads/`
- Cek browser console untuk error 404

### Masalah 5: Mobile Camera Tidak Muncul
**Solusi:**
- Pastikan menggunakan HTTPS (di production)
- Pastikan attribute `capture="environment"` ada di input
- Coba tanpa `capture` attribute jika ada masalah

## Test Checklist

- [ ] Upload file JPEG kecil (< 1MB)
- [ ] Upload file PNG kecil (< 1MB)
- [ ] Upload file WebP kecil (< 1MB)
- [ ] Upload file GIF kecil (< 1MB)
- [ ] Upload file SVG kecil (< 1MB)
- [ ] Coba upload file besar (> 5MB) - harus gagal
- [ ] Coba upload PDF - harus gagal
- [ ] Cek preview gambar muncul
- [ ] Cek error messages jelas saat gagal
- [ ] Test di mobile device (jika memungkinkan)

## Monitoring Production

### Di Vercel:
1. Buka **Vercel Dashboard**
2. Pilih project
3. Klik tab **Functions**
4. Cari `/api/upload`
5. Lihat logs dan error messages

### Logs yang Perlu Diperhatikan:
- `[Upload API] Error uploading file:` - Error saat save file
- `[Frontend] Network error uploading image:` - Error jaringan
- `[Upload API] Failed to create directory:` - Tidak bisa buat folder

## Next Steps

Jika masih ada masalah setelah testing:

1. Screenshot console logs (frontend dan backend)
2. Catat tipe file dan ukuran file yang dicoba
3. Catat error message yang muncul
4. Catat browser dan device yang digunakan
5. Kirim semua informasi ke developer

## Tips Tambahan

### Untuk Mobile:
- Gunakan file size kecil (< 2MB) untuk testing lebih cepat
- Coba kamera langsung via `capture="environment"`
- Test di browser berbeda (Chrome, Safari, Firefox)

### Untuk Desktop:
- Drag & drop file ke browser untuk testing cepat
- Coba berbagai format gambar
- Test dengan file yang sudah di-compress
