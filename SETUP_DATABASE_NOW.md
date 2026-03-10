# 🚀 Setup Database Neon - Langkah Demi Langkah

## ✅ Database Neon Anda Sudah Siap!

Koneksi database Neon Anda:
- **Host**: `ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech`
- **Database**: `neondb`
- **User**: `neondb_owner`
- **Password**: `npg_IUiS3d0nwlhA`

---

## 📋 Langkah 1: Tambah Environment Variables di Vercel (Wajib!)

### Buka Vercel Dashboard:
https://vercel.com/safir2310/ayamgepreksambalijo01

### Tambah Environment Variables:

1. Klik **Settings** di sidebar
2. Klik **Environment Variables**
3. Klik **Add New**
4. Tambahkan SEMUA variables berikut ini:

---

### Variable 1: DATABASE_URL

**Name**: `DATABASE_URL`
**Value**:
```
postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 2: POSTGRES_URL

**Name**: `POSTGRES_URL`
**Value**:
```
postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 3: POSTGRES_PRISMA_URL

**Name**: `POSTGRES_PRISMA_URL`
**Value**:
```
postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 4: POSTGRES_USER

**Name**: `POSTGRES_USER`
**Value**:
```
neondb_owner
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 5: POSTGRES_PASSWORD

**Name**: `POSTGRES_PASSWORD`
**Value**:
```
npg_IUiS3d0nwlhA
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 6: POSTGRES_HOST

**Name**: `POSTGRES_HOST`
**Value**:
```
ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

### Variable 7: POSTGRES_DATABASE

**Name**: `POSTGRES_DATABASE`
**Value**:
```
neondb
```
**Environments**: ☑ Production ☑ Preview ☑ Development
**Klik**: Save

---

## ✅ Checklist Environment Variables:

Setelah selesai, pastikan di Vercel Environment Variables ada:

| Variable Name | Value | Status |
|---------------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | ☐ |
| `POSTGRES_URL` | `postgresql://...` | ☐ |
| `POSTGRES_PRISMA_URL` | `postgresql://...` | ☐ |
| `POSTGRES_USER` | `neondb_owner` | ☐ |
| `POSTGRES_PASSWORD` | `npg_IUiS3d0nwlhA` | ☐ |
| `POSTGRES_HOST` | `ep-ancient-paper-aiifvyrx-pooler...` | ☐ |
| `POSTGRES_DATABASE` | `neondb` | ☐ |

**PENTING**: Centang ketiga checkbox (Production, Preview, Development) untuk SEMUA variables!

---

## 📋 Langkah 2: Setup Database Schema

### Opsi A: Menggunakan Terminal (Recommended - Paling Mudah!)

Buka terminal di komputer Anda dan jalankan perintah berikut:

```bash
# 1. Install Vercel CLI (jika belum ada)
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Pull environment variables dari Vercel
vercel env pull .env.production

# 4. Cek apakah .env.production terbuat dengan benar
cat .env.production
```

Pastikan file `.env.production` berisi `DATABASE_URL` dengan koneksi Neon.

```bash
# 5. Push schema ke Neon database (buat semua tabel)
bunx prisma db push

# 6. Seed database dengan admin accounts dan data awal
bun run db:seed
```

**Selesai! Database sudah siap.** Lanjut ke Langkah 3.

---

### Opsi B: Menggunakan Neon Dashboard (Manual)

Jika Anda tidak bisa menggunakan terminal:

1. Buka: https://console.neon.tech
2. Pilih database `neondb`
3. Klik **SQL Editor**
4. Copy dan paste SQL script lengkap dari file `FIX_VERCEL_NOW.md`
5. Klik **Run**
6. Untuk membuat admin accounts, jalankan script seed secara lokal atau manually insert user

**Opsi A jauh lebih mudah dan recommended!**

---

## 📋 Langkah 3: Trigger Redeploy di Vercel

Setelah database setup selesai:

1. Buka: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Klik **Deployments** di sidebar kiri
3. Cari deployment terbaru (paling atas)
4. Klik tombol **Redeploy** (ikon refresh ↻)
5. Tunggu 2-3 menit hingga deployment selesai

---

## 📋 Langkah 4: Test Deployment

1. Buka URL deployment Vercel Anda:
   - `ayamgepreksambalijo01-2pxzveg36-safir2310s-projects.vercel.app`
   - Atau buka dari Vercel Dashboard

2. Coba login dengan admin account:
   - **Username**: `admin`
   - **Password**: `000000`

3. Test beberapa fitur:
   - ✅ Browse menu
   - ✅ Lihat categories
   - ✅ Tambah item ke cart
   - ✅ Register akun baru
   - ✅ Cek profile

Jika semua berjalan lancar, deployment berhasil! 🎉

---

## 🔍 Cek Status Deployment

### Cek Build Logs:
1. Buka Vercel Dashboard
2. Deployments → klik deployment terbaru
3. Lihat **Build Logs** untuk memastikan tidak ada error

### Cek Function Logs:
1. Di halaman deployment yang sama
2. Scroll ke **Function Logs**
3. Pastikan tidak ada error pada saat load halaman

---

## 📝 Summary Commands

Copy dan paste semua command ini ke terminal:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.production

# Push schema ke Neon
bunx prisma db push

# Seed database
bun run db:seed

# Done!
echo "✅ Database setup selesai! Redeploy di Vercel sekarang."
```

---

## 🎯 Checklist Lengkap

- [ ] 7 Environment variables sudah ditambah di Vercel
- [ ] Semua environment variables dicentang untuk Production, Preview, Development
- [ ] Vercel CLI sudah terinstall
- [ ] `vercel login` sudah berhasil
- [ ] `vercel env pull .env.production` sudah dijalankan
- [ ] `prisma db push` sudah selesai (tidak ada error)
- [ ] `bun run db:seed` sudah selesai (tidak ada error)
- [ ] Redeploy sudah di-trigger di Vercel
- [ ] Login dengan admin/000000 berhasil
- [] Aplikasi berjalan tanpa error

---

## ❓ Troubleshooting

### Error: "vercel: command not found"
**Solusi**: Install Vercel CLI:
```bash
npm i -g vercel
```

### Error: "Can't reach database server"
**Solusi**:
1. Cek `DATABASE_URL` di Vercel environment variables
2. Pastikan value sama persis dengan yang diberikan di atas
3. Pastikan database Neon aktif

### Error: "Schema not found"
**Solusi**:
1. Pastikan `prisma db push` sudah dijalankan
2. Cek output - harusnya ada "✔ Database is now in sync"
3. Jika error, coba lagi

### Error: "Seed failed"
**Solusi**:
1. Pastikan schema sudah di-push (`prisma db push`)
2. Cek apakah ada user dengan username `admin` sudah ada
3. Cek error message di terminal

### Error Vercel masih muncul setelah semua langkah
**Solusi**:
1. Trigger redeploy lagi di Vercel Dashboard
2. Tunggu 3-5 menit
3. Clear browser cache dan refresh
4. Cek Vercel Function Logs untuk error spesifik

---

## 📚 File Terkait

- `FIX_VERCEL_NOW.md` - SQL script untuk manual setup
- `VERCEL_DEPLOYMENT_GUIDE.md` - Panduan deployment lengkap
- `DEPLOYMENT_READY.md` - Ringkasan deployment

---

## ✨ Next Steps

Setelah berhasil deploy:

1. **Custom Admin Password**: Ganti password admin default
2. **Test Semua Fitur**: Cek semua menu dan functionality
3. **Setup Custom Domain** (opsional) di Vercel Dashboard
4. **Monitor**: Cek Neon Dashboard dan Vercel Dashboard secara berkala

---

**Mulai dari Langkah 1 sekarang! Tambahkan 7 environment variables di Vercel. 🚀**
