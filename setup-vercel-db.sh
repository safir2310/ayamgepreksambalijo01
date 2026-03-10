#!/bin/bash

echo "=========================================="
echo "Setup Database Neon untuk Vercel"
echo "=========================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI belum terinstall."
    echo "Install dengan: npm i -g vercel"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI terinstall"
echo ""

# Pull environment variables
echo "📥 Pulling environment variables dari Vercel..."
vercel env pull .env.production

if [ $? -ne 0 ]; then
    echo "❌ Gagal pull environment variables"
    echo "Pastikan sudah login: vercel login"
    exit 1
fi

echo "✅ Environment variables berhasil di-pull"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ File .env.production tidak ditemukan"
    exit 1
fi

echo "📝 Isi .env.production:"
cat .env.production
echo ""

# Confirm
echo "=========================================="
read -p "Lanjutkan push schema ke Neon database? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Dibatalkan"
    exit 0
fi

echo ""
echo "🗄️  Pushing Prisma schema ke Neon database..."
bunx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Gagal push schema"
    exit 1
fi

echo "✅ Schema berhasil di-push"
echo ""

# Seed database
echo "🌱 Seeding database dengan admin accounts..."
bun run db:seed

if [ $? -ne 0 ]; then
    echo "⚠️  Seeding mungkin gagal atau sudah pernah dijalankan"
    echo "Tapi ini tidak masalah, schema sudah siap"
fi

echo ""
echo "=========================================="
echo "✅ Setup Database Selesai!"
echo "=========================================="
echo ""
echo "Langkah selanjutnya:"
echo "1. Buka Vercel Dashboard"
echo "2. Klik Deployments → Redeploy"
echo "3. Tunggu 2-3 menit"
echo "4. Test login: admin / 000000"
echo ""
