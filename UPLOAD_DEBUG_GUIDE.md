# Debug Guide: Image Upload Issues

## Perbaikan yang Telah Dilakukan

### 1. API Upload (`/src/app/api/upload/route.ts`)
✅ Menambahkan detailed console logging
✅ Menampilkan file details (nama, tipe, ukuran)
✅ Menampilkan status directory uploads
✅ Menampilkan path file yang disimpan
✅ Error messages yang lebih jelas dalam Bahasa Indonesia

### 2. Frontend (`/src/components/restaurant/admin-menu-view.tsx`)
✅ Menambahkan console logging untuk setiap step
✅ Menampilkan tipe file dan ukuran file dalam error
✅ Menampilkan status code HTTP dalam error
✅ Better response parsing dengan error handling
✅ Deteksi network error

## Cara Debug Upload Gambar

### Langkah 1: Buka Browser DevTools
1. Buka website di browser
2. Tekan `F12` atau `Ctrl+Shift+I` (Windows/Linux) atau `Cmd+Option+I` (Mac)
3. Pilih tab **Console**

### Langkah 2: Coba Upload Gambar
1. Buka halaman **Kelola Menu** (admin)
2. Klik **Tambah Menu** atau **Edit** menu
3. Klik tombol **Upload dari HP**
4. Pilih file gambar
5. Lihat output di Console

### Langkah 3: Baca Console Logs

**Logs yang akan muncul:**

```
[Frontend] Starting image upload: {name: "photo.jpg", type: "image/jpeg", size: 123456}
[Frontend] Sending upload request...
[Frontend] Upload response status: 200 OK
[Frontend] Upload response body: {"url":"/uploads/...", ...}
[Frontend] Upload successful: {...}
```

**Error yang mungkin muncul:**

1. **Tipe file tidak valid**
   ```
   [Frontend] Invalid file type: image/svg+xml
   ```
   → Gunakan file JPEG, PNG, WebP, atau GIF

2. **Ukuran file terlalu besar**
   ```
   [Frontend] File too large: 6000000
   Ukuran file: 5.73MB
   ```
   → Gunakan file maksimal 5MB

3. **Network error**
   ```
   [Frontend] Network error uploading image: ...
   ```
   → Cek koneksi internet atau server

4. **Server error (500)**
   ```
   [Frontend] Upload response status: 500 Internal Server Error
   [Frontend] Upload response body: {"error":"..."}
   ```
   → Cek server logs

## Cek Server Logs

### Jika menjalankan server lokal:
```bash
# Cek dev.log
tail -f /home/z/my-project/dev.log

# Atau jalankan server dan lihat output langsung
bun run dev
```

### Logs yang akan muncul di server:

**Berhasil:**
```
[Upload API] Starting file upload...
[Upload API] File received: {name: "photo.jpg", type: "image/jpeg", size: 123456}
[Upload API] Upload directory: /home/z/my-project/public/uploads
[Upload API] Directory exists: true
[Upload API] Saving file to: /home/z/my-project/public/uploads/123456-abc.jpg
[Upload API] File saved successfully
[Upload API] Upload successful: {url: "/uploads/123456-abc.jpg", ...}
```

**Gagal:**
```
[Upload API] Invalid file type: image/svg+xml
[Upload API] File too large: 6000000
[Upload API] No file in request
[Upload API] Error uploading file: ...
```

## Masalah Umum dan Solusi

### 1. Folder uploads tidak ada/tidak bisa ditulis
**Symptom:** Error saat menyimpan file

**Solusi:**
```bash
# Pastikan folder ada
ls -la /home/z/my-project/public/uploads/

# Jika tidak ada, buat
mkdir -p /home/z/my-project/public/uploads/

# Cek permissions
chmod 755 /home/z/my-project/public/uploads/
```

### 2. Server tidak jalan
**Symptom:** Network error atau connection refused

**Solusi:**
```bash
# Cek apakah server jalan
ps aux | grep "next dev"

# Jika tidak jalan, jalankan
bun run dev
```

### 3. File terlalu besar
**Symptom:** "Ukuran file terlalu besar. Maksimal 5MB"

**Solusi:**
- Compress gambar sebelum upload
- Gunakan tool seperti tinypng.com
- Resize gambar ke ukuran yang wajar (max 1920x1080)

### 4. Tipe file tidak didukung
**Symptom:** "Tipe file tidak valid"

**Solusi:**
- Gunakan file dengan ekstensi: .jpg, .jpeg, .png, .webp, .gif
- Convert file jika menggunakan format lain

## Test dengan cURL (Alternatif)

Jika ingin test API secara manual:

```bash
# Test upload dengan curl
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/your/image.jpg" \
  -v
```

## Monitoring Production (Vercel)

Jika masalah terjadi di production:

1. Buka **Vercel Dashboard**
2. Pilih project
3. Klik **Functions** tab
4. Cari `/api/upload` function
5. Lihat logs dan error messages

## Next Steps

Setelah mengidentifikasi error dari console:

1. Catat error message yang muncul
2. Cek server logs untuk detail lebih lanjut
3. Refer ke "Masalah Umum dan Solusi" di atas
4. Jika masih bermasalah, hubungi developer dengan:
   - Screenshot console logs
   - File yang dicoba diupload (tipe dan ukuran)
   - Error message yang muncul
