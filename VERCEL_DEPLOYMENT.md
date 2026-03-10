# Vercel Deployment Guide

Panduan lengkap untuk deploy Ayam Geprek Sambal Ijo ke Vercel dengan database Neon.

## Prerequisites

✅ Project sudah diupload ke GitHub
✅ Database Neon sudah dibuat
✅ Schema sudah di-push ke database
✅ Database sudah di-seed dengan admin accounts

## Environment Variables untuk Vercel

Setelah deploy ke Vercel, tambahkan environment variables berikut di Vercel Dashboard:

### Langkah 1: Buka Vercel Project

1. Kunjungi: https://vercel.com/dashboard
2. Pilih atau import project: `websiteayamgepreksambalijo`

### Langkah 2: Tambah Environment Variables

Klik **Settings** → **Environment Variables**, lalu tambahkan:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `POSTGRES_URL` | `postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `POSTGRES_PRISMA_URL` | `postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require` | Production, Preview, Development |
| `POSTGRES_USER` | `neondb_owner` | Production, Preview, Development |
| `POSTGRES_PASSWORD` | `npg_IUiS3d0nwlhA` | Production, Preview, Development |
| `POSTGRES_HOST` | `ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech` | Production, Preview, Development |
| `POSTGRES_DATABASE` | `neondb` | Production, Preview, Development |

### Langkah 3: Redeploy

Setelah menambahkan environment variables:

1. Klik **Deployments** di sidebar
2. Klik **Redeploy** pada deployment terbaru
3. Tunggu deployment selesai

## Cara Cepat: Vercel CLI

Jika sudah install Vercel CLI:

```bash
# Login ke Vercel
vercel login

# Set environment variables
vercel env add DATABASE_URL
# Paste: postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
# Select: Production, Preview, Development

# Repeat untuk semua variables di atas

# Deploy
vercel --prod
```

## Build Configuration

Project sudah terkonfigurasi dengan script otomatis di `package.json`:

- `postinstall`: Otomatis generate Prisma Client
- `build`: Generate Prisma Client, build Next.js, dan copy static files

## Database Status

✅ Database Neon sudah dibuat
✅ Schema sudah di-push
✅ Admin accounts sudah dibuat:
  - Username: `admin`, Password: `000000`
  - Username: `deaflud`, Password: `000000`

## Testing After Deployment

1. Buka URL deployment di Vercel
2. Test fitur user:
   - Register akun baru
   - Login
   - Browse menu
   - Tambah ke cart
   - Checkout
   - Cek riwayat pesanan
   - Checkout dengan pembayaran tunai dan hitung kembalian otomatis
   - Cetak struk secara otomatis setelah bayar
3. Test fitur admin:
   - Login dengan username: `admin` atau `deaflud`
   - Password: `000000`
   - Cek dashboard
   - Cek orders
   - Cek menu management
   - Tambah menu baru dengan upload gambar dari HP
   - Edit menu yang sudah ada
   - Hapus menu

## Monitoring

### Neon Database

Buka dashboard Neon untuk monitoring:
- https://console.neon.tech
- Pilih project `ayam-geprek-sambal-ijo` (jika sudah dibuat)
- Monitor: CPU usage, storage, queries

### Vercel

Buka dashboard Vercel untuk monitoring:
- https://vercel.com/dashboard
- Pilih project
- Monitor: Bandwidth, function execution time, errors

## Troubleshooting

### Error: Database connection failed

Pastikan:
- `DATABASE_URL` environment variable sudah di-set di Vercel
- Connection string menggunakan `?sslmode=require`
- Database Neon aktif

### Error: Schema not found

Pastikan:
- `prisma generate` sudah dijalankan (otomatis via postinstall)
- Environment variables sudah di-set sebelum redeploy

### Error: Admin login tidak berhasil

Pastikan:
- Database sudah di-seed
- Admin accounts sudah dibuat:
  ```bash
  # Cek di Neon SQL Editor:
  SELECT * FROM "User" WHERE role = 'admin';
  ```

### Redeploy setelah perubahan

Jika ada perubahan schema atau environment variables:

1. Push ke GitHub
2. Di Vercel, klik **Redeploy**
3. Atau gunakan CLI:
   ```bash
   vercel --prod
   ```

### Image Upload Limitations

⚠️ **IMPORTANT**: Vercel adalah serverless platform, sehingga:
- File yang diupload ke `public/uploads` tidak persist antar deployment
- Setiap redeploy akan menghapus semua file yang diupload
- Untuk production, gunakan cloud storage seperti:
  - **Vercel Blob** (recommended untuk Vercel)
  - **AWS S3**
  - **Cloudflare R2**
  - **Cloudinary**

Untuk saat ini, gunakan URL gambar eksternal (misalnya dari layanan penyimpanan gambar gratis seperti Imgur, Postimg, dll) sebagai alternatif upload file.

## Security Notes

⚠️ **IMPORTANT**:
- Jangan commit file `.env` ke GitHub
- Gunakan `.env.example` atau `.env.production.example` sebagai template
- Rotasi password database secara berkala
- Monitor usage untuk mendeteksi aktivitas mencurigakan

## Next Steps

Setelah berhasil deploy:

1. Setup custom domain (opsional)
2. Setup monitoring dan alerts
3. Test semua fitur secara thorough
4. Setup backup strategy (Neon sudah auto backup)
5. Document API endpoints untuk integrasi tambahan

## Support

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs

## Useful Commands

```bash
# Development lokal dengan database Neon
DATABASE_URL="postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" bun run dev

# Generate Prisma Client
bun run db:generate

# Push schema changes
DATABASE_URL="postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" bun run db:push

# Seed database
DATABASE_URL="postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" bun run db:seed
```
