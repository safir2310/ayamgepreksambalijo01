# 🚀 Rekomendasi Deployment Agar Tidak Terjadi Error

## 📋 Pre-Deployment Checklist

Sebelum deploy ke Vercel, pastikan SEMUA checklist ini terpenuhi:

### ✅ Checklist Code & Configuration

- [ ] **Schema Prisma sudah benar untuk environment target**
  - Local development: `provider = "sqlite"`
  - Vercel production: `provider = "postgresql"`

- [ ] **Environment variables sudah disiapkan**
  - Ada 7 variables untuk Vercel
  - Semua values sudah di-verify
  - Tidak ada sensitive data di commit ke Git

- [ ] **Build configuration sudah disederhanakan**
  - `vercel.json` tidak ada referensi env variables yang belum ada
  - Build script di `package.json` sudah sederhana dan reliable
  - Tidak ada perintah copy file yang bisa gagal

- [ ] **Dependencies sudah di-verify**
  - `package.json` sudah up-to-date
  - Tidak ada dependencies yang conflict
  - `bun.lock` atau `package-lock.json` sudah di-commit

- [ ] **TypeScript dan Linting**
  - Tidak ada critical type errors
  - ESLint sudah di-run dan clean
  - `next.config.ts` sudah di-set `ignoreBuildErrors: true` (untuk non-critical errors)

---

## 🎯 Best Practices untuk Vercel Deployment

### 1. Environment Variables Management

#### ❌ Yang TIDAK BOLEH Dilakukan:
```bash
# JANGAN commit .env ke Git!
DATABASE_URL=postgresql://...

# JANGAN hardcode credentials di code
const db = new PrismaClient({ url: "postgresql://..." })
```

#### ✅ Yang HARUS Dilakukan:
```bash
# Gunakan .env.example sebagai template
DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
POSTGRES_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
POSTGRES_PRISMA_URL=postgresql://[username]:[password]@[host]/[database]?connect_timeout=15&sslmode=require
POSTGRES_USER=[username]
POSTGRES_PASSWORD=[password]
POSTGRES_HOST=[host]
POSTGRES_DATABASE=[database]
```

#### ✅ Di Vercel Dashboard:
1. Settings → Environment Variables
2. Tambahkan SEMUA 7 variables
3. Centang: ☑ Production ☑ Preview ☑ Development
4. Set SEBELUM build dimulai

---

### 2. Database Strategy

#### ✅ Local Development (SQLite):
```bash
# .env.local
DATABASE_URL=file:./db/custom.db

# prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

#### ✅ Production (PostgreSQL - Neon):
```bash
# Vercel Environment Variables
DATABASE_URL=postgresql://neondb_owner:xxx@xxx-pooler.xxx.xxx.xxx.neon.tech/neondb?sslmode=require

# prisma/schema.prisma (untuk deploy)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### ✅ Workflow yang Benar:
```bash
# 1. Development dengan SQLite
./scripts/switch-db.sh sqlite
bunx prisma generate
bun run dev

# 2. Sebelum deploy, switch ke PostgreSQL
./scripts/switch-db.sh postgresql

# 3. Commit dan push
git add .
git commit -m "chore: Switch to PostgreSQL for deployment"
git push

# 4. Setelah deploy, kembali ke SQLite
./scripts/switch-db.sh sqlite
bunx prisma generate
bun run dev
```

---

### 3. Build Configuration yang Aman

#### ❌ Konfigurasi Bermasalah (JANGAN DIPAKAI):
```json
{
  "buildCommand": "prisma generate && next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/",
  "env": {
    "DATABASE_URL": "@database-url"  // Ini akan error jika belum ada!
  }
}
```

#### ✅ Konfigurasi yang Aman (GUNAKAN INI):
```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### ✅ package.json Build Script:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**Kenapa aman?**
- Prisma Client di-generate otomatis via `postinstall`
- Build tidak butuh koneksi database
- Tidak ada perintah copy file yang bisa gagal

---

## 🔍 Common Errors dan Cara Mencegahnya

### Error 1: "Environment variable not found"

**Penyebab:**
- Environment variables belum ada saat build
- Nama variable salah (case-sensitive)
- Variable hanya ada di satu environment (misal hanya Production)

**Cara Mencegah:**
```bash
# 1. Pastikan semua variables ada di Vercel SEBELUM build
# 2. Centang ketiga environment: Production, Preview, Development
# 3. Nama variable harus persis sama (case-sensitive):
#    ✅ DATABASE_URL
#    ❌ database_url
#    ❌ Database_Url
```

---

### Error 2: "Can't reach database server"

**Penyebab:**
- Connection string salah
- Tidak ada `?sslmode=require`
- Database belum dibuat atau suspend

**Cara Mencegah:**
```bash
# Selalu gunakan format ini:
DATABASE_URL=postgresql://[user]:[pass]@[host]/[db]?sslmode=require

# Cek di Neon Dashboard:
# - Database aktif (tidak suspend)
# - Connection string benar
# - Host menggunakan pooler: xxx-pooler.xxx
```

---

### Error 3: "Schema not found / Table doesn't exist"

**Penyebab:**
- Schema belum di-push ke database
- Prisma Client belum di-generate dengan schema terbaru

**Cara Mencegah:**
```bash
# Setelah deploy berhasil, SEGERA jalankan:
vercel env pull .env.production
bunx prisma db push
bun run db:seed

# Lalu redeploy:
# Vercel Dashboard → Deployments → Redeploy
```

---

### Error 4: "Build failed: Prisma Client not generated"

**Penyebab:**
- `postinstall` tidak berjalan
- `prisma generate` gagal
- Schema salah (provider mismatch)

**Cara Mencegah:**
```bash
# 1. Pastikan postinstall di package.json:
"postinstall": "prisma generate"

# 2. Test locally:
rm -rf node_modules/.prisma
bunx prisma generate

# 3. Cek apakah .next/client/generate.js ada
ls -la node_modules/@prisma/client/

# 4. Pastikan schema valid:
bunx prisma validate
```

---

### Error 5: "Client-side exception" di browser

**Penyebab:**
- Database belum di-setup
- API error karena database kosong
- Data yang dibutuhkan frontend tidak ada

**Cara Mencegah:**
```bash
# Setup database SEBELUM test aplikasi:
bunx prisma db push
bun run db:seed

# Pastikan data minimal:
# - Admin users ada
# - Menu items ada
# - Categories ada

# Cek API endpoint:
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/categories
```

---

## 🧪 Testing Sebelum Production

### 1. Local Testing Checklist

```bash
# 1. Clean install
rm -rf node_modules .next
bun install

# 2. Generate Prisma Client
bunx prisma generate

# 3. Push schema
bunx prisma db push

# 4. Seed database
bun run db:seed

# 5. Test build
bun run build

# 6. Test start production
bun start

# 7. Test API endpoints
curl http://localhost:3000/api/menu
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/auth/login -X POST -d '{"username":"admin","password":"000000"}'
```

### 2. Preview Deployment Checklist

```bash
# 1. Create preview branch
git checkout -b test-deploy

# 2. Switch to PostgreSQL
./scripts/switch-db.sh postgresql

# 3. Commit dan push
git add .
git commit -m "test: Preview deployment"
git push origin test-deploy

# 4. Test di Vercel Preview URL
# 5. Jika berhasil, merge ke master
# 6. Jika gagal, fix di branch ini
```

---

## 📊 Environment Variables Best Practices

### ✅ Template yang Lengkap:

```env
# ========================================
# REQUIRED FOR VERCEL (7 Variables)
# ========================================

# 1. Main database connection
DATABASE_URL=postgresql://[user]:[pass]@[host]/[db]?sslmode=require

# 2. PostgreSQL connection (alternative)
POSTGRES_URL=postgresql://[user]:[pass]@[host]/[db]?sslmode=require

# 3. Prisma-specific connection (with timeout)
POSTGRES_PRISMA_URL=postgresql://[user]:[pass]@[host]/[db]?connect_timeout=15&sslmode=require

# 4. Database credentials
POSTGRES_USER=[username]
POSTGRES_PASSWORD=[password]
POSTGRES_HOST=[hostname]
POSTGRES_DATABASE=[database_name]
```

### ✅ Checklist di Vercel:

- [ ] Semua 7 variables sudah ditambah
- [ ] Semua dicentang untuk Production, Preview, Development
- [ ] Nama variable persis sesuai (case-sensitive)
- [ ] Connection string menggunakan `?sslmode=require`
- [ ] Password tidak ada karakter khusus yang perlu escaping
- [ ] Host menggunakan pooler: `xxx-pooler.xxx` (bukan tanpa pooler)

---

## 🔄 Database Setup Best Practices

### 1. Gunakan Vercel Neon Integration (Recommended)

**Keuntungan:**
- ✅ Otomatis setup database
- ✅ Otomatis tambah environment variables
- ✅ No manual configuration needed

**Langkah:**
1. Vercel Dashboard → Storage → Create Database
2. Pilih Neon Postgres
3. Ikuti wizard - selesai!

### 2. Manual Setup dengan Script

Jika tidak bisa pakai integration:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Pull environment variables
vercel env pull .env.production

# 4. Verify .env.production
cat .env.production

# 5. Push schema
bunx prisma db push

# 6. Seed database
bun run db:seed

# 7. Verify
bunx prisma studio
```

---

## 🚨 Monitoring & Debugging

### 1. Cek Vercel Build Logs

```
Vercel Dashboard → Deployments → [Latest Deployment] → Build Logs
```

**Cari:**
- ✅ "✔ Build completed" - Build berhasil
- ❌ "Error:" - Ada error, baca pesannya
- ❌ "Failed" - Build gagal, cek error detail

### 2. Cek Vercel Function Logs

```
Vercel Dashboard → Deployments → [Latest Deployment] → Function Logs
```

**Cari:**
- ✅ Status 200 - API berhasil
- ❌ Status 500 - Server error
- ❌ Error messages - Baca dan perbaiki

### 3. Cek Neon Dashboard

```
https://console.neon.tech → [Your Database]
```

**Cari:**
- ✅ CPU usage normal
- ✅ Storage ada space
- ✅ No connection errors
- ✅ Tables created

---

## 🛡️ Backup & Rollback Strategies

### 1. Database Backup

```bash
# Backup schema
bunx prisma db pull

# Backup data (manual via Neon Dashboard)
# Neon Dashboard → [Database] → Branches → Create backup
```

### 2. Rollback Deployment

```
Vercel Dashboard → Deployments → [Previous Working Deployment] → Redeploy
```

### 3. Git Rollback

```bash
# Rollback ke commit sebelumnya
git log --oneline
git checkout [commit-hash]
git push origin master --force
```

---

## 📝 Deployment Workflow yang Direkomendasikan

### Workflow Harian (Development):

```bash
# 1. Pastikan pakai SQLite
./scripts/switch-db.sh sqlite

# 2. Generate Prisma Client
bunx prisma generate

# 3. Start dev server
bun run dev

# 4. Test di browser
# 5. Commit perubahan
git add .
git commit -m "feat: Add new feature"
git push
```

### Workflow Deployment (Production):

```bash
# 1. Create deployment branch
git checkout -b deploy-$(date +%Y%m%d)

# 2. Switch ke PostgreSQL
./scripts/switch-db.sh postgresql

# 3. Verify schema
bunx prisma validate

# 4. Commit
git add .
git commit -m "chore: Switch to PostgreSQL for deployment"

# 5. Push
git push origin deploy-$(date +%Y%m%d)

# 6. Test di Vercel Preview URL
# 7. Jika berhasil, merge ke master
# 8. Jika gagal, fix di branch ini
```

### Setup Database Setelah Deploy:

```bash
# 1. Pull env vars
vercel env pull .env.production

# 2. Push schema
bunx prisma db push

# 3. Seed database
bun run db:seed

# 4. Test API
curl https://your-app.vercel.app/api/menu
```

---

## ⚡ Quick Deployment Checklist

Sebelum klik "Deploy", pastikan:

### Code:
- [ ] Prisma schema menggunakan provider yang benar (sqlite for local, postgresql for deploy)
- [ ] Tidak ada sensitive data di code
- [ ] Dependencies up-to-date
- [ ] No critical errors

### Environment:
- [ ] 7 environment variables sudah ada di Vercel
- [ ] Semua dicentang untuk Production, Preview, Development
- [ ] Connection string menggunakan `?sslmode=require`
- [ ] Values sudah di-verify

### Database:
- [ ] Database Neon sudah dibuat
- [ ] Database aktif (tidak suspend)
- [ ] Schema siap di-push setelah deploy

### Testing:
- [ ] Build berhasil locally (`bun run build`)
- [ ] API endpoints berhasil di-test
- [ ] Login admin berhasil
- [ ] Fitur utama berfungsi

---

## 🎯 Summary: 7 Aturan Emas

1. **SELALU set environment variables di Vercel SEBELUM build**
   - Ini penyebab error #1!

2. **GUNAKAN database provider yang benar untuk environment**
   - Local: SQLite
   - Production: PostgreSQL

3. **PASTIKAN 7 environment variables SEMUA ada**
   - DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL
   - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DATABASE

4. **JANGAN commit sensitive data**
   - Use .env.example as template
   - .env and .env.local in .gitignore

5. **SETUP database SETELAH deploy berhasil**
   - prisma db push
   - bun run db:seed

6. **TEST secara lokal SEBELUM deploy**
   - bun run build
   - bun start
   - Test API endpoints

7. **MONITOR logs di Vercel setelah deploy**
   - Build Logs
   - Function Logs
   - Fix errors immediately

---

## 📞 Jika Error Tetap Terjadi

### Step 1: Cek Build Logs
```
Vercel Dashboard → Deployments → [Latest] → Build Logs
```

### Step 2: Cek Environment Variables
```
Vercel Dashboard → Settings → Environment Variables
```
Pastikan semua 7 variables ada dan benar.

### Step 3: Cek Database Status
```
https://console.neon.tech → [Your Database]
```
Pastikan database aktif dan connection string benar.

### Step 4: Rebuild with Clean Cache
```
Vercel Dashboard → Deployments → Redeploy
```
Atau commit dummy change untuk trigger rebuild.

### Step 5: Rollback jika perlu
```
Vercel Dashboard → Deployments → [Previous Working] → Redeploy
```

---

## ✨ Final Tips

1. **Gunakan Vercel Neon Integration** - Paling mudah dan least error-prone
2. **Follow checklist di atas** - Jangan skip!
3. **Test di preview branch** - Sebelum production
4. **Monitor setelah deploy** - Fix issues immediately
5. **Keep documentation updated** - Catat semua issues dan solusinya

---

**Follow rekomendasi ini dan deployment Anda akan bebas error! 🚀**
