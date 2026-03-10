# 🚨 FIX: Client-Side Exception Error di Vercel

## ❌ Error Message:
"Application error: a client-side exception has occurred while loading ayamgepreksambalijo01-zeta.vercel.app"

---

## 🔍 ROOT CAUSE DITEMUKAN:

**Prisma schema menggunakan SQLite tapi Vercel butuh PostgreSQL!**

```prisma
// ❌ SALAH (Yang Anda punya sekarang):
datasource db {
  provider = "sqlite"  // Ini tidak bekerja di Vercel!
  url      = env("DATABASE_URL")
}

// ✅ BENAR (Yang harus digunakan di Vercel):
datasource db {
  provider = "postgresql"  // Ini yang harus dipakai!
  url      = env("DATABASE_URL")
}
```

---

## ✅ SOLUSI (3 Langkah Saja):

### 📌 LANGKAH 1: Update Prisma Schema & Push ke GitHub

**Saya sudah mengubah schema ke PostgreSQL untuk Anda. Sekarang push ke GitHub:**

```bash
# Commit perubahan
git add prisma/schema.prisma
git commit -m "fix: Switch Prisma schema to PostgreSQL for Vercel"
git push
```

**ATAU jika Anda tidak punya akses terminal:**
1. Buka GitHub: https://github.com/safir2310/ayamgepreksambalijo01
2. Klik file `prisma/schema.prisma`
3. Klik tombol edit (pencil)
4. Ubah baris 9:
   ```prisma
   # Dari ini:
   provider = "sqlite"
   
   # Ke ini:
   provider = "postgresql"
   ```
5. Scroll ke bawah, klik "Commit changes"

---

### 📌 LANGKAH 2: Setup Database Neon (CRITICAL!)

Setelah code di-push dan Vercel redeploy, database masih kosong. Anda HARUS setup database:

#### Opsi A: Menggunakan Terminal (Recommended - Paling Mudah!)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Pull environment variables dari Vercel
vercel env pull .env.production

# 4. Cek apakah .env.production terbuat dengan benar
cat .env.production
# Pastikan DATABASE_URL ada di sana

# 5. Push schema ke Neon database (buat semua tabel)
bunx prisma db push

# 6. Seed database dengan admin accounts dan data awal
bun run db:seed
```

**Output yang diharapkan:**
```
✔ Database is now in sync with the Prisma schema
🌱 Starting database seed...
✅ Created category: Ayam Geprek
✅ Created admin: admin
✅ Seed completed successfully!
```

#### Opsi B: Menggunakan Neon Dashboard (Manual)

Jika tidak bisa menggunakan terminal:

1. **Buka Neon Dashboard:** https://console.neon.tech
2. **Pilih database** `neondb`
3. **Klik SQL Editor**
4. **Copy dan paste SQL script di bawah ini:**

```sql
-- Create Categories
INSERT INTO "Category" (id, name, slug, icon, description, "order", active, "createdAt", "updatedAt")
VALUES
  ('cat-1', 'Ayam Geprek', 'ayam-geprek', '🍗', 'Ayam geprek dengan berbagai pilihan sambal', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-2', 'Paket Hemat', 'paket-hemat', '🍱', 'Paket makan lengkap dengan harga hemat', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-3', 'Minuman', 'minuman', '🥤', 'Berbagai pilihan minuman segar', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-4', 'Sambal Level', 'sambal-level', '🌶️', 'Pilihan level kepedasan sambal', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cat-5', 'Pelengkap', 'pelengkap', '🥗', 'Menu tambahan pelengkap makan', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create Menu Items
INSERT INTO "MenuItem" (id, name, slug, description, price, discountPercent, rating, reviewCount, category, categoryId, available, spicyLevel, isPopular, isPromo, "createdAt", "updatedAt")
VALUES
  -- Ayam Geprek
  ('menu-1', 'Ayam Geprek Original', 'ayam-geprek-original', 'Ayam goreng crispy yang digeprek dengan sambal bawang merah khas', 18000, 0, 4.8, 234, 'Ayam Geprek', 'cat-1', true, 3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu-2', 'Ayam Geprek Keju', 'ayam-geprek-keju', 'Ayam geprek dengan taburan keju mozzarella yang lumer', 22000, 0, 4.9, 189, 'Ayam Geprek', 'cat-1', true, 3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu-3', 'Ayam Geprek Sambal Ijo', 'ayam-geprek-sambal-ijo', 'Ayam geprek dengan sambal ijo pedas yang segar', 20000, 0, 4.8, 267, 'Ayam Geprek', 'cat-1', true, 4, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Paket Hemat
  ('menu-4', 'Paket Nasi Ayam Geprek', 'paket-nasi-ayam-geprek', 'Ayam geprek original + nasi + es teh manis', 28000, 0, 4.8, 423, 'Paket Hemat', 'cat-2', true, 3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Minuman
  ('menu-5', 'Es Teh Manis', 'es-teh-manis', 'Es teh manis segar yang menyegarkan', 5000, 0, 4.5, 567, 'Minuman', 'cat-3', true, 0, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu-6', 'Thai Tea', 'thai-tea', 'Thai tea dengan rasa teh thai yang otentik', 12000, 0, 4.8, 412, 'Minuman', 'cat-3', true, 0, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  
  -- Pelengkap
  ('menu-7', 'Nasi Putih', 'nasi-putih', 'Nasi putih hangat', 5000, 0, 4.3, 456, 'Pelengkap', 'cat-5', true, 0, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('menu-8', 'Sambal Extra', 'sambal-extra', 'Sambal tambahan untuk yang suka pedas', 3000, 0, 4.6, 567, 'Pelengkap', 'cat-5', true, 5, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create Reward Items
INSERT INTO "RewardItem" (id, name, description, pointsCost, stock, category, active, "createdAt", "updatedAt")
VALUES
  ('reward-1', 'Es Teh Manis Gratis', 'Tukar 50 poin untuk mendapatkan es teh manis gratis', 50, -1, 'minuman', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('reward-2', 'Diskon Rp5.000', 'Tukar 100 poin untuk mendapatkan diskon Rp5.000', 100, -1, 'diskon', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('reward-3', 'Ayam Geprek Gratis', 'Tukar 300 poin untuk mendapatkan ayam geprek original gratis', 300, 50, 'makanan', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

5. **Klik "Run" untuk menjalankan SQL**

6. **Buat Admin Accounts:**

```sql
-- Create Admin Users
-- Note: Password untuk kedua admin adalah "000000"
-- Hash untuk "000000" = $2a$10$rK...

INSERT INTO "User" (id, username, password, name, email, role, points, "createdAt", "updatedAt")
VALUES
  ('admin-001', 'admin', '$2a$10$rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy', 'Administrator', 'admin@ayamgeprek.com', 'admin', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('admin-002', 'deaflud', '$2a$10$rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy/rK5Yy', 'Deaflud', 'deaflud@ayamgeprek.com', 'admin', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

**Note:** Hash password di atas hanya contoh. Untuk hash password yang benar untuk "000000", jalankan:

```bash
# Di terminal Anda:
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('000000', 10));"
```

Copy output-nya dan gunakan di SQL di atas.

---

### 📌 LANGKAH 3: Redeploy di Vercel

Setelah database setup selesai:

1. **Buka Vercel Dashboard:** https://vercel.com/safir2310/ayamgepreksambalijo01
2. **Klik "Deployments"** di sidebar
3. **Cari deployment terbaru** (paling atas)
4. **Klik tombol "Redeploy"** (ikon refresh ↻)
5. **Tunggu 2-3 menit** hingga deployment selesai

---

## ✅ TEST DEPLOYMENT

Setelah redeploy selesai:

1. **Buka URL:** `ayamgepreksambalijo01-zeta.vercel.app`
2. **Coba login dengan:**
   - **Username:** `admin`
   - **Password:** `000000`
3. **Harus berhasil login dan tidak ada error!**

---

## 🔍 Cek Environment Variables di Vercel

Pastikan SEMUA 7 variables ada di Vercel:

**Buka:** Settings → Environment Variables

| Variable | Status |
|----------|--------|
| `DATABASE_URL` | ☐ |
| `POSTGRES_URL` | ☐ |
| `POSTGRES_PRISMA_URL` | ☐ |
| `POSTGRES_USER` | ☐ |
| `POSTGRES_PASSWORD` | ☐ |
| `POSTGRES_HOST` | ☐ |
| `POSTGRES_DATABASE` | ☐ |

**Jika ada yang kosong, tambahkan sekarang!**

Values untuk reference:
```
DATABASE_URL=postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=Sama dengan DATABASE_URL
POSTGRES_PRISMA_URL=Sama dengan DATABASE_URL (tambah &connect_timeout=15)
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_IUiS3d0nwlhA
POSTGRES_HOST=ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech
POSTGRES_DATABASE=neondb
```

**CENTANG:** ☑ Production ☑ Preview ☑ Development

---

## 📋 Checklist Perbaikan:

- [ ] Prisma schema sudah diubah ke PostgreSQL
- [ ] Code sudah push ke GitHub
- [ ] Vercel sudah redeploy
- [ ] 7 environment variables ada di Vercel
- [ ] `prisma db push` sudah dijalankan
- [ ] `bun run db:seed` sudah dijalankan
- [ ] Redeploy lagi setelah database setup
- [ ] Login admin berhasil
- [ ] Aplikasi berjalan tanpa error

---

## ❓ Jika Masih Error Setelah Semua Langkah

### Cek 1: Vercel Build Logs
```
Vercel Dashboard → Deployments → [Latest] → Build Logs
```
Cari error messages dan screenshot.

### Cek 2: Vercel Function Logs
```
Vercel Dashboard → Deployments → [Latest] → Function Logs
```
Cari error pada saat load halaman.

### Cek 3: Browser Console
1. Buka aplikasi di browser
2. Tekan F12
3. Klik tab "Console"
4. Screenshot error yang muncul

### Cek 4: Database Status
1. Buka https://console.neon.tech
2. Pilih database `neondb`
3. Cek apakah tabel-tabel sudah dibuat:
   - User
   - Category
   - MenuItem
   - dll

---

## 💡 Quick Fix Summary

```bash
# 1. Push schema update ke GitHub
git add prisma/schema.prisma
git commit -m "fix: Use PostgreSQL for Vercel"
git push

# 2. Setup database
npm i -g vercel
vercel login
vercel env pull .env.production
bunx prisma db push
bun run db:seed

# 3. Redeploy di Vercel Dashboard
# 4. Test login: admin / 000000
```

---

## 🎯 Kesimpulan

**Root Cause:** Prisma schema menggunakan SQLite di Vercel (yang tidak support SQLite).

**Solution:**
1. ✅ Ubah schema ke PostgreSQL (sudah saya lakukan)
2. ✅ Push ke GitHub
3. ✅ Setup database Neon
4. ✅ Redeploy

**Setelah semua langkah di atas selesai, error akan hilang! 🎉**

---

**Ikuti LANGKAH 1, 2, dan 3 di atas secara berurutan! 🚀**
