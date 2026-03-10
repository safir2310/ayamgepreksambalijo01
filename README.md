# 🍗 Ayam Geprek Sambal Ijo - POS System

Sistem Point of Sale (POS) modern untuk restoran Ayam Geprek Sambal Ijo dengan fitur lengkap untuk manajemen pesanan, menu, pelanggan, dan laporan keuangan.

## ✨ Fitur Utama

### 🛒 Fitur Pelanggan
- **Browse Menu**: Lihat menu dengan kategori dan filter
- **Order Online**: Pesan langsung dari aplikasi
- **Cart Management**: Kelola keranjang belanja
- **Point System**: Kumpulkan poin dari setiap pembelian
- **Redeem Code**: Tukarkan poin untuk diskon
- **Rewards**: Tukarkan poin dengan produk gratis
- **Order History**: Lihat riwayat pesanan
- **Profile Management**: Kelola data diri dan alamat

### 👨‍💼 Fitur Kasir
- **Shift Management**: Buka/tutup shift kasir
- **POS Interface**: Interface kasir yang cepat dan mudah
- **Quick Order**: Buat pesanan dengan cepat
- **Cash Management**: Hitung kembalian otomatis
- **Print Receipt**: Cetak struk otomatis setelah pembayaran

### 🔧 Fitur Admin
- **Dashboard**: Overview statistik dan performance
- **Menu Management**: Tambah, edit, hapus menu
- **Order Management**: Kelola pesanan masuk
- **Financial Report**: Laporan keuangan lengkap
- **Reward Management**: Kelola hadiah dan reward
- **Cashier Management**: Kelola akun kasir

## 🚀 Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Neon) for production, SQLite for local
- **ORM**: Prisma
- **State Management**: Zustand
- **Authentication**: Custom auth system
- **Icons**: Lucide React

## 📦 Installation

### Local Development

```bash
# Install dependencies
bun install

# Setup database (SQLite for local)
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment ke Vercel

Project sudah dikonfigurasi untuk deployment ke Vercel!

### Langkah Cepat:

1. **Buat Database Neon**
   - Opsi A (Mudah): Di Vercel Dashboard → Storage → Create Database → Neon Postgres
   - Opsi B (Manual): Buka https://neon.tech dan buat project baru

2. **Tambah Environment Variables di Vercel**

   Settings → Environment Variables → Add:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Neon connection string dengan `?sslmode=require` |
   | `POSTGRES_URL` | Sama dengan DATABASE_URL |
   | `POSTGRES_PRISMA_URL` | Sama dengan DATABASE_URL |
   | `POSTGRES_USER` | Neon username |
   | `POSTGRES_PASSWORD` | Neon password |
   | `POSTGRES_HOST` | Neon host |
   | `POSTGRES_DATABASE` | Neon database name |

   **PENTING**: Centang Production, Preview, dan Development!

3. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "feat: Configure for Vercel deployment"
   git push
   ```

4. **Setup Database**
   ```bash
   # Pull environment variables
   vercel env pull .env.production

   # Push schema ke Neon
   bunx prisma db push

   # Seed admin accounts
   bun run db:seed
   ```

5. **Redeploy di Vercel**
   - Buka Vercel Dashboard
   - Deployments → Redeploy

6. **Test Deployment**
   - Buka URL Vercel
   - Login dengan: `admin` / `000000`

### 📚 Panduan Lengkap

Baca **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** untuk panduan lengkap dengan troubleshooting!

## 👥 Admin Accounts

Default admin accounts (setelah seeding):

| Username | Password | Role |
|----------|----------|------|
| `admin` | `000000` | Super Admin |
| `deaflud` | `000000` | Admin |

## 📂 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── menu/           # Menu management
│   │   ├── orders/         # Order management
│   │   ├── rewards/        # Reward system
│   │   └── redeem-code/    # Redeem code system
│   └── page.tsx            # Main page
├── components/
│   ├── restaurant/         # Main app components
│   │   ├── home-view.tsx
│   │   ├── menu-view.tsx
│   │   ├── cart-view.tsx
│   │   ├── checkout-view.tsx
│   │   ├── profile-view.tsx
│   │   ├── admin-*.tsx     # Admin components
│   │   └── cashier-*.tsx   # Cashier components
│   └── ui/                 # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
│   └── db.ts               # Prisma client
└── store/                   # Zustand stores
prisma/
├── schema.prisma           # Database schema
└── seed.ts                # Database seed script
```

## 🗄️ Database Schema

### Models:
- **User**: Pelanggan, admin, dan kasir
- **MenuItem**: Menu restoran
- **Category**: Kategori menu
- **Order**: Pesanan pelanggan
- **OrderItem**: Item dalam pesanan
- **CartItem**: Keranjang belanja
- **Address**: Alamat tersimpan
- **Favorite**: Menu favorit
- **Promo**: Voucher dan promo
- **PointTransaction**: Transaksi poin
- **RewardItem**: Produk reward
- **RewardRedemption**: Riwayat redeem reward
- **RedeemCode**: Kode redeem dari poin
- **Shift**: Shift kasir

## 🎯 Point System

### Cara Kerja:
1. **Earn Points**: Pelanggan mendapatkan poin dari setiap pembelian
2. **Redeem Points**: Tukarkan poin untuk kode redeem
3. **Use Redeem Code**: Gunakan kode redeem di keranjang untuk diskon
4. **Get Rewards**: Tukarkan poin dengan produk gratis

### Konversi:
- 1 Poin = Rp 10 diskon
- Maksimal diskon: 50% dari total
- Kode redeem berlaku 7 hari

## 🔐 Environment Variables

### Production (Vercel):
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `POSTGRES_URL`: Alternative connection string
- `POSTGRES_PRISMA_URL`: Prisma-specific connection string
- `POSTGRES_USER`: Database username
- `POSTGRES_PASSWORD`: Database password
- `POSTGRES_HOST`: Database host
- `POSTGRES_DATABASE`: Database name

### Local Development:
- `DATABASE_URL`: `file:./db/custom.db`

## 📱 Screenshots

Coming soon...

## 🧪 Testing

```bash
# Run linter
bun run lint

# Build for production
bun run build
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma Client |
| `bun run db:seed` | Seed database with sample data |
| `bun run db:reset` | Reset and seed database |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

Jika ada masalah dengan deployment ke Vercel:
1. Baca [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. Baca [FIX_VERCEL_ERROR.md](./FIX_VERCEL_ERROR.md)
3. Cek Vercel Build Logs
4. Cek Neon Dashboard untuk database status

---

Built with ❤️ for Ayam Geprek Sambal Ijo
