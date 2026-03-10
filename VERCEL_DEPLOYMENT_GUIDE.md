# 🚀 Panduan Deploy ke Vercel (Langkah demi Langkah)

## ✅ Project sudah siap untuk Vercel!

Project Anda sudah dikonfigurasi untuk deployment ke Vercel dengan PostgreSQL (Neon).

---

## 📋 Langkah 1: Buat Database Neon

### Cara 1: Melalui Vercel (Paling Mudah)

1. Buka project Vercel Anda: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Klik **Storage** di sidebar kiri
3. Klik **"Create Database"**
4. Pilih **Neon Postgres**
5. Klik **Continue** dan ikuti instruksi
6. Vercel akan otomatis membuat database dan menambahkan environment variables

### Cara 2: Manual di Neon

1. Buka https://neon.tech dan sign up/login
2. Klik **"Create a project"**
3. Isi:
   - **Project name**: `ayam-geprek-sambal-ijo`
   - **Region**: Pilih yang terdekat (misal: Singapore)
   - **PostgreSQL Version**: 16 (atau default)
4. Klik **"Create Project"**
5. Tunggu beberapa detik
6. Copy **Connection String** yang akan muncul

   Format-nya seperti ini:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

## 📋 Langkah 2: Tambah Environment Variables di Vercel

### Jika menggunakan Cara 1 (Vercel Integration):
Environment variables akan otomatis ditambahkan. **Langkah ini bisa dilewati.**

### Jika menggunakan Cara 2 (Manual):

1. Buka project Vercel Anda
2. Klik **Settings** → **Environment Variables**
3. Klik **"Add New"** dan tambahkan variable berikut:

| Nama Variable | Value | Environments |
|---------------|-------|--------------|
| `DATABASE_URL` | Connection string dari Neon | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_URL` | Sama seperti DATABASE_URL | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_PRISMA_URL` | Sama seperti DATABASE_URL | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_USER` | Username dari connection string (contoh: `neondb_owner`) | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_PASSWORD` | Password dari connection string | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_HOST` | Host dari connection string (contoh: `ep-xxxxx-pooler.c-4.us-east-1.aws.neon.tech`) | ☑ Production, ☑ Preview, ☑ Development |
| `POSTGRES_DATABASE` | Nama database dari connection string (contoh: `neondb`) | ☑ Production, ☑ Preview, ☑ Development |

**PENTING**: Centang semua checkbox (Production, Preview, Development)!

4. Klik **Save**

---

## 📋 Langkah 3: Push Code ke GitHub

Project Anda sudah dikonfigurasi dengan PostgreSQL. Sekarang push ke GitHub:

```bash
# Add semua perubahan
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: Configure project for Vercel deployment with PostgreSQL"

# Push ke GitHub
git push origin main
```

Vercel akan otomatis mendeteksi perubahan dan mulai redeploy.

---

## 📋 Langkah 4: Setup Database Schema

Setelah deployment selesai, Anda perlu membuat tabel di database Neon.

### Opsi A: Menggunakan Vercel CLI (Recommended)

```bash
# Install Vercel CLI jika belum ada
npm i -g vercel

# Login ke Vercel
vercel login

# Pull environment variables dari Vercel
vercel env pull .env.production

# Push schema ke Neon database
bunx prisma db push

# Seed database dengan admin accounts
bun run db:seed
```

### Opsi B: Menggunakan Connection String Langsung

```bash
# Push schema
DATABASE_URL="postgresql://[neondb_owner]:[password]@[host]/[database]?sslmode=require" bunx prisma db push

# Seed database
DATABASE_URL="postgresql://[neondb_owner]:[password]@[host]/[database]?sslmode=require" bun run db:seed
```

### Opsi C: Menggunakan Neon Dashboard

1. Buka https://console.neon.tech
2. Pilih project `ayam-geprek-sambal-ijo`
3. Klik **SQL Editor**
4. Jalankan perintah berikut untuk melihat schema:
   ```bash
   bunx prisma db push --print
   ```
5. Copy output-nya dan paste ke SQL Editor Neon
6. Klik **Run**
7. Untuk seeding admin accounts, jalankan seed script secara lokal dengan Neon connection string

---

## 📋 Langkah 5: Trigger Redeploy

Setelah database setup selesai, trigger redeploy di Vercel:

1. Buka project Vercel Anda
2. Klik **Deployments**
3. Klik **Redeploy** pada deployment terbaru
4. Tunggu deployment selesai (biasanya 2-3 menit)

---

## ✅ Langkah 6: Test Deployment

1. Buka URL Vercel deployment Anda
2. Aplikasi seharusnya sudah berjalan tanpa error
3. Test login dengan admin account:
   - **Username**: `admin`
   - **Password**: `000000`

4. Test beberapa fitur:
   - Browse menu
   - Add ke cart
   - Login user
   - Cek order history

---

## 🔧 Troubleshooting

### Error: "Application error: a client-side exception has occurred"

**Cara memperbaiki:**
1. Cek Vercel Function Logs:
   - Deployments → pilih deployment terbaru → Function Logs
2. Pastikan semua environment variables sudah di-set
3. Pastikan database schema sudah di-push (`prisma db push`)

### Error: "Database connection failed"

**Cara memperbaiki:**
1. Cek `DATABASE_URL` di Vercel environment variables
2. Pastikan connection string menggunakan `?sslmode=require`
3. Pastikan database Neon aktif (tidak suspend)

### Error: "Schema not found"

**Cara memperbaiki:**
1. Jalankan `prisma db push` dengan connection string yang benar
2. Trigger redeploy di Vercel

### Error: "Cannot read properties of undefined"

**Cara memperbaiki:**
1. Pastikan Prisma Client sudah di-generate (`prisma generate`)
2. Pastikan `DATABASE_URL` environment variable ada di Vercel
3. Trigger redeploy

---

## 📊 Admin Accounts

Setelah seeding, admin accounts berikut akan dibuat:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `000000` | Admin |
| `deaflud` | `000000` | Admin |

Gunakan untuk login ke admin dashboard.

---

## 🔄 Untuk Local Development

Jika Anda ingin development lokal dengan SQLite:

1. Buat file `.env.local`:
   ```env
   DATABASE_URL=file:./db/custom.db
   ```

2. Ubah `prisma/schema.prisma` sementara:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. Generate Prisma Client dan push schema:
   ```bash
   bunx prisma generate
   bunx prisma db push
   bun run db:seed
   ```

4. Setelah selesai development, ubah kembali ke `postgresql` sebelum commit untuk production.

---

## 📝 Checklist Sebelum Deploy

- [ ] Database Neon sudah dibuat
- [ ] Environment variables sudah ditambah di Vercel (SEMUA variables)
- [ ] Environment variables dicentang untuk Production, Preview, dan Development
- [ ] Prisma schema menggunakan `provider = "postgresql"`
- [ ] Code sudah push ke GitHub
- [ ] `prisma db push` sudah dijalankan untuk Neon database
- - [ ] `bun run db:seed` sudah dijalankan
- [ ] Redeploy sudah di-trigger di Vercel
- [ ] Testing login dengan admin account berhasil

---

## 📚 File Konfigurasi

File-file berikut sudah dikonfigurasi untuk Vercel:

1. **`prisma/schema.prisma`** - Menggunakan PostgreSQL
2. **`.env.example`** - Template environment variables
3. **`vercel.json`** - Konfigurasi deployment Vercel
4. **`next.config.ts`** - Konfigurasi Next.js dengan `output: "standalone"`
5. **`package.json`** - Build script sudah includes `prisma generate`

---

## 🎉 Selesai!

Project Anda sekarang siap untuk deployment ke Vercel!

Jika ada masalah, cek:
- Vercel Build Logs
- Vercel Function Logs
- Neon Dashboard untuk database status
- Environment variables di Vercel Dashboard

---

## 💡 Tips Tambahan

1. **Monitoring**:
   - Monitor database usage di Neon Dashboard
   - Monitor deployment logs di Vercel Dashboard

2. **Backup**:
   - Neon menyediakan automatic backup
   - Untuk backup manual, buat branch di Neon

3. **Custom Domain**:
   - Setup custom domain di Vercel Settings → Domains

4. **Environment Protection**:
   - Jangan commit credentials ke Git
   - Gunakan environment variables untuk semua sensitive data

---

## 🆘 Butuh Bantuan?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
- Project Issues: Cek Vercel Deployment Logs
