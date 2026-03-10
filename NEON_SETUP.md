# Setup Database Neon di Vercel

Panduan lengkap untuk menghubungkan project Ayam Geprek Sambal Ijo dengan database Neon di Vercel.

## Langkah 1: Membuat Database Neon

### Opsi A: Melalui Dashboard Neon (Recommended)

1. Buka [https://neon.tech](https://neon.tech)
2. Sign up atau login dengan akun Anda
3. Klik **"Create a project"**
4. Isi form:
   - **Project Name**: `ayam-geprek-sambal-ijo`
   - **Region**: Pilih region terdekat (misal: Singapore)
   - **PostgreSQL Version**: 16 (atau default)
5. Klik **"Create Project"**
6. Tunggu beberapa detik hingga database selesai dibuat
7. Copy **Connection String** dari dashboard

Format Connection String akan seperti:
```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

### Opsi B: Melalui Vercel Integration (Lebih Mudah)

1. Buka [https://vercel.com](https://vercel.com) dan login
2. Buka project Anda: `https://vercel.com/safir2310/websiteayamgepreksambalijo`
3. Klik **Storage** di sidebar kiri
4. Klik **"Create Database"**
5. Pilih **Neon Postgres**
6. Klik **"Continue"** dan ikuti instruksi
7. Vercel akan otomatis membuat database Neon dan menghubungkannya ke project

## Langkah 2: Setup Environment Variables

### Untuk Development (Lokal)

1. Edit file `.env` di root project:
```env
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

Ganti dengan Connection String dari Neon.

2. Generate Prisma Client:
```bash
bun run db:generate
```

3. Push schema ke database:
```bash
bun run db:push
```

4. Seed database (buat admin users):
```bash
bun run db:seed
```

### Untuk Production (Vercel)

Vercel Integration akan otomatis menambahkan environment variable:
- `DATABASE_URL` - Neon connection string
- `POSTGRES_URL` - Alternative Neon connection string
- `POSTGRES_PRISMA_URL` - Prisma-specific connection string

## Langkah 3: Deploy ke Vercel

### Jika belum connect ke Vercel:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Deploy project:
```bash
vercel
```

### Jika sudah connect:

1. Commit dan push perubahan ke GitHub:
```bash
git add .
git commit -m "Update database to PostgreSQL (Neon)"
git push
```

2. Vercel akan otomatis redeploy project

## Langkah 4: Setup Database Migrations di Vercel

Setelah deployment, jalankan migration di production:

### Opsi 1: Melalui Vercel CLI

```bash
vercel env pull .env.production
bun run db:push
```

### Opsi 2: Melalui Vercel Dashboard

1. Buka project di Vercel
2. Klik **Settings** → **Environment Variables**
3. Pastikan `DATABASE_URL` sudah ada
4. Vercel akan otomatis menjalankan `prisma generate` dan `prisma db push` saat build jika sudah diconfigure

## Script Tambahan untuk Deployment

Update `package.json` dengan script berikut jika belum ada:

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "bun prisma/seed.ts"
  }
}
```

## Troubleshooting

### Error: Connection refused

Pastikan Connection String benar dan mengandung `?sslmode=require` untuk koneksi SSL.

### Error: Schema tidak terdeteksi

Jalankan:
```bash
bun run db:generate
bun run db:push
```

### Error: Database kosong

Jalankan seed untuk membuat admin users:
```bash
bun run db:seed
```

### Di Vercel: Database not found

Pastikan database Neon sudah dibuat dan `DATABASE_URL` environment variable sudah di-set di Vercel dashboard.

## Manajemen Database Neon

### Melalui Dashboard Neon

- Buka [https://console.neon.tech](https://console.neon.tech)
- Pilih project `ayam-geprek-sambal-ijo`
- Klik **SQL Editor** untuk menjalankan query langsung
- Klik **Tables** untuk melihat data
- Klik **Branches** untuk manajemen branches

### Melalui Vercel Storage

- Buka project di Vercel
- Klik **Storage** → pilih database Neon
- Akses dashboard Neon dari sini

## Backup Database

Neon menyediakan backup otomatis. Untuk backup manual:

1. Buka dashboard Neon
2. Klik **Branches**
3. Pilih branch `main`
4. Klik **Create backup**

## Admin Accounts

Setelah seeding, dua admin account akan dibuat:

1. **Username**: `admin` | **Password**: `000000`
2. **Username**: `deaflud` | **Password**: `000000`

Gunakan ini untuk login ke admin dashboard.

## Next Steps

Setelah setup berhasil:

1. Test application di development:
```bash
bun run dev
```

2. Test di production:
   - Buka URL Vercel project
   - Login dengan admin account
   - Cek semua fitur berfungsi dengan baik

3. Monitor database:
   - Cek dashboard Neon untuk penggunaan resource
   - Monitor queries yang lambat
   - Atur scaling jika diperlukan

## Support

Jika mengalami masalah:

- Neon Docs: https://neon.tech/docs
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
