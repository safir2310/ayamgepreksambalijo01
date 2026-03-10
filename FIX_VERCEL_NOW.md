# 🚨 Perbaiki Error Vercel - Step by Step

## Masalah
Error: "Kesalahan aplikasi: terjadi pengecualian sisi klien saat memuat"

## Penyebab
Database Neon belum dibuat atau belum di-setup, sehingga aplikasi tidak bisa terkoneksi ke database.

---

## ✅ Langkah 1: Buat Database Neon (Wajib!)

### Cara Paling Mudah - Lewat Vercel (2 menit):

1. **Buka Project Vercel Anda:**
   - Klik link ini: https://vercel.com/safir2310/ayamgepreksambalijo01

2. **Buat Database:**
   - Klik **Storage** di sidebar kiri
   - Klik tombol **"Create Database"**
   - Pilih **Neon Postgres**
   - Klik **Continue**
   - Pilih region (pilih yang terdekat, misal Singapore)
   - Klik **Create Database**

3. **Tunggu proses selesai** (1-2 menit)

4. **Vercel akan otomatis:**
   - ✅ Membuat database Neon
   - ✅ Menambahkan environment variables
   - ✅ Membuat connection string
   - ✅ Redeploy aplikasi

**Setelah ini, coba refresh halaman Vercel Anda. Jika masih error, lanjut ke langkah 2.**

---

## 🔧 Langkah 2: Cek Environment Variables di Vercel

Jika langkah 1 sudah selesai tapi masih error:

1. Buka: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Klik **Settings** → **Environment Variables**
3. Pastikan SEMUA variables berikut ada:

| Variable | Apakah ada? |
|----------|-------------|
| `DATABASE_URL` | ☐ |
| `POSTGRES_URL` | ☐ |
| `POSTGRES_PRISMA_URL` | ☐ |
| `POSTGRES_USER` | ☐ |
| `POSTGRES_PASSWORD` | ☐ |
| `POSTGRES_HOST` | ☐ |
| `POSTGRES_DATABASE` | ☐ |

**Jika ada yang kosong:**

1. Klik **Add New**
2. Masukkan nama variable
3. Masukkan value (dari Neon Dashboard)
4. Centang ☑ Production, ☑ Preview, ☑ Development
5. Klik **Save**

**Ulangi untuk semua 7 variables!**

---

## 🗄️ Langkah 3: Setup Database Schema (PENTING!)

Setelah environment variables ada, Anda perlu membuat tabel-tabel di database.

### Cara A: Menggunakan Terminal Anda (Recommended)

Buka terminal di komputer Anda dan jalankan:

```bash
# 1. Install Vercel CLI (jika belum ada)
npm i -g vercel

# 2. Login ke Vercel
vercel login

# 3. Pull environment variables dari Vercel
vercel env pull .env.production

# 4. Cek file .env.production
cat .env.production
# Pastikan DATABASE_URL ada di sana

# 5. Push schema ke Neon database
bunx prisma db push

# 6. Seed database dengan admin accounts
bun run db:seed
```

### Cara B: Jika Tidak Bisa Install Vercel CLI

1. Buka https://console.neon.tech
2. Login ke Neon
3. Pilih database yang Anda buat
4. Klik **SQL Editor**
5. Jalankan perintah berikut untuk membuat semua tabel:

```sql
-- Buat tabel User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "password" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- Buat tabel Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- Buat tabel MenuItem
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "spicyLevel" INTEGER DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isPromo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "MenuItem_slug_key" ON "MenuItem"("slug");

-- Buat tabel Order
CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "shiftId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "redeemCodeId" TEXT,
    "total" INTEGER NOT NULL,
    "notes" TEXT,
    "address" TEXT,
    "estimatedTime" INTEGER,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- Buat tabel OrderItem
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "options" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("menuId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Buat tabel CartItem
CREATE TABLE IF NOT EXISTS "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "menuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "options" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("menuId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Buat tabel Address
CREATE TABLE IF NOT EXISTS "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "address" TEXT NOT NULL,
    "district" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Buat tabel Favorite
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("menuId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("userId", "menuId")
);

-- Buat tabel Promo
CREATE TABLE IF NOT EXISTS "Promo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "minOrder" INTEGER DEFAULT 0,
    "maxDiscount" INTEGER,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Promo_code_key" ON "Promo"("code");

-- Buat tabel PointTransaction
CREATE TABLE IF NOT EXISTS "PointTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel RewardItem
CREATE TABLE IF NOT EXISTS "RewardItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "pointsCost" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT DEFAULT 'general',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Buat tabel RewardRedemption
CREATE TABLE IF NOT EXISTS "RewardRedemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pointsUsed" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("rewardId") REFERENCES "RewardItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Buat tabel RedeemCode
CREATE TABLE IF NOT EXISTS "RedeemCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pointsUsed" INTEGER NOT NULL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "discountValue" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "RedeemCode_code_key" ON "RedeemCode"("code");

-- Buat tabel Shift
CREATE TABLE IF NOT EXISTS "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shiftNumber" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "openingBalance" INTEGER NOT NULL DEFAULT 0,
    "closingBalance" INTEGER,
    "cashReceived" INTEGER NOT NULL DEFAULT 0,
    "expectedCash" INTEGER,
    "cashDifference" INTEGER,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "cardPayments" INTEGER NOT NULL DEFAULT 0,
    "ewalletPayments" INTEGER NOT NULL DEFAULT 0,
    "qrisPayments" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Shift_shiftNumber_key" ON "Shift"("shiftNumber");
```

6. Setelah tabel dibuat, jalankan perintah ini untuk membuat admin accounts:

```sql
-- Buat Admin User (password: 000000)
INSERT INTO "User" ("id", "username", "password", "name", "role", "points", "createdAt", "updatedAt")
VALUES
  ('admin-id-001', 'admin', '$2a$10$YourHashedPasswordHere', 'Administrator', 'admin', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Note: Anda perlu mengenerate hashed password menggunakan bcryptjs
-- Atau gunakan cara A (CLI) untuk auto-seeding
```

**Cara A jauh lebih mudah dan recommended!**

---

## 🔄 Langkah 4: Trigger Redeploy

Setelah database setup selesai:

1. Buka: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Klik **Deployments** di sidebar
3. Cari deployment terbaru (paling atas)
4. Klik tombol **Redeploy** (ikon refresh)
5. Tunggu 2-3 menit

---

## ✅ Langkah 5: Test Deployment

1. Buka URL Vercel Anda
2. Refresh halaman
3. Coba login dengan:
   - **Username**: `admin`
   - **Password**: `000000`

4. Jika berhasil, coba beberapa fitur:
   - Klik menu
   - Lihat categories
   - Coba register akun baru

---

## 🔍 Cek Error di Vercel

Jika masih error setelah semua langkah di atas:

1. Buka: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Klik **Deployments** → klik deployment terbaru
3. Cek **Build Logs** dan **Function Logs**
4. Screenshot error tersebut untuk troubleshooting

---

## 📋 Checklist

- [ ] Database Neon sudah dibuat (via Vercel Storage)
- [ ] 7 Environment variables sudah ada di Vercel
- [ ] Prisma schema sudah di-push ke Neon (`prisma db push`)
- [ ] Database sudah di-seed (`bun run db:seed`)
- [ ] Redeploy sudah di-trigger
- [ ] Login admin berhasil

---

## ❓ Jika Masih Error

### Error: "Connection refused"
- Cek `DATABASE_URL` di Vercel environment variables
- Pastikan database Neon aktif

### Error: "Schema not found"
- Jalankan `bunx prisma db push` lagi
- Pastikan tidak ada error

### Error: "Cannot read properties of undefined"
- Cek Function Logs di Vercel
- Pastikan semua environment variables ada

---

## 🆞 Butuh Bantuan?

Jika masih error, berikan saya informasi berikut:
1. Screenshot error dari Vercel Function Logs
2. Screenshot dari Vercel Environment Variables
3. Apakah database Neon sudah dibuat?

---

**Mulai dari Langkah 1 di atas, dan ikuti secara berurutan! 🚀**
