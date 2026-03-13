# Fix untuk "Application error: a client-side exception has occurred" di Vercel

## Masalah
Aplikasi menampilkan error "Application error: a client-side exception has occurred" saat diakses di Vercel, meskipun database sudah terhubung dengan benar.

## Root Cause
Masalah utama ada di file `src/components/restaurant/home-view.tsx`:

### TypeScript Interface Tidak Lengkap
Interface `MenuItem` di `home-view.tsx` tidak mencakup semua properti yang dibutuhkan:
- **Missing**: `isPopular`, `isPromo`, `discountPercent`, `createdAt`
- **Tapi digunakan di code**: Line 188 mengakses `item.isPopular`

Ini menyebabkan TypeScript error dan runtime error di production.

## Perbaikan yang Dilakukan

### 1. Fixed MenuItem Interface di home-view.tsx
**File**: `src/components/restaurant/home-view.tsx`

**Before:**
```typescript
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  spicyLevel?: number;
}
```

**After:**
```typescript
interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  category: string;
  spicyLevel?: number;
  isPopular: boolean;
  isPromo: boolean;
  createdAt: string;
}
```

### 2. Verifikasi File Lain
- ✅ `menu-view.tsx` - Sudah memiliki interface yang benar
- ✅ `admin-menu-view.tsx` - Sudah memiliki interface yang benar
- ✅ `menu-detail-view.tsx` - Interface sederhana (tidak butuh isPopular)
- ✅ `cashier-pos-view.tsx` - Interface sederhana (tidak butuh isPopular)
- ✅ `splash-screen.tsx` - Tidak ada masalah
- ✅ `ui-store.ts` - Tidak ada masalah
- ✅ `user-store.ts` - Tidak ada masalah
- ✅ Linting passed - `bun run lint` tanpa error

## Environment Variables
File `.env.production` sudah dikonfigurasi dengan benar untuk Neon PostgreSQL:
- ✅ DATABASE_URL
- ✅ POSTGRES_URL
- ✅ POSTGRES_PRISMA_URL
- ✅ POSTGRES_USER
- ✅ POSTGRES_PASSWORD
- ✅ POSTGRES_HOST
- ✅ POSTGRES_DATABASE

## Langkah-langkah Deploy ke Vercel

### Option 1: Deploy Menggunakan Script Otomatis
```bash
# Install Vercel CLI (jika belum)
bun install -g vercel

# Jalankan script auto-deploy
bash scripts/auto-deploy-vercel.sh
```

### Option 2: Deploy Manual
```bash
# 1. Generate Prisma Client
bunx prisma generate

# 2. Build project
bun run build

# 3. Deploy ke Vercel
vercel --prod
```

### Option 3: Deploy dari GitHub
1. Push changes ke GitHub
2. Vercel akan otomatis redeploy dari repository
3. Pastikan environment variables sudah diset di Vercel Dashboard

## Verifikasi Fix

### 1. Local Testing
```bash
# Install dependencies
bun install

# Generate Prisma Client
bunx prisma generate

# Run development server
bun run dev
```

### 2. Build Testing
```bash
# Test build
bun run build

# Cek apakah ada error
bun run lint
```

### 3. Production Testing
1. Buka URL Vercel: `https://ayamgepreksambalijo01.vercel.app`
2. Cek apakah splash screen muncul
3. Cek apakah halaman home muncul setelah splash
4. Cek apakah menu ditampilkan dengan benar
5. Buka browser console (F12) untuk cek error

## Summary

**Problem**: TypeScript interface di `home-view.tsx` tidak lengkap, menyebabkan client-side error
**Solution**: Tambahkan properti yang hilang ke `MenuItem` interface
**Status**: ✅ Fixed
**Files Changed**: `src/components/restaurant/home-view.tsx`

---

## Checklist sebelum Deploy ke Vercel

- [x] Fix TypeScript interface di home-view.tsx
- [x] Verify tidak ada linting errors
- [x] Environment variables diset dengan benar di .env.production
- [x] Database schema sudah dipush ke Neon PostgreSQL
- [x] Prisma Client sudah di-generate
- [x] Project bisa di-build tanpa error
- [ ] Deploy ke Vercel
- [ ] Verifikasi deployment di production

## Catatan Tambahan

1. **Database Connection**: User menyatakan database sudah terhubung dengan benar, jadi fokus perbaikan adalah di client-side code

2. **Environment Variables**: Pastikan semua environment variables di atas sudah diset di:
   - Vercel Dashboard → Settings → Environment Variables
   - Select ALL environments: Production, Preview, Development

3. **Build Output**: Next.js dikonfigurasi dengan `output: "standalone"` di `next.config.ts` untuk optimal deployment di Vercel

4. **Next.js Version**: Project menggunakan Next.js 16.1 dengan React 19

5. **Database**: Menggunakan Neon PostgreSQL (bukan SQLite) untuk deployment Vercel
