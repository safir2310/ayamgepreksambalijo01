#!/bin/bash

# Script to prepare the project for Vercel deployment
# This script changes the Prisma schema from SQLite to PostgreSQL

echo "=========================================="
echo "Preparing for Vercel Deployment"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    exit 1
fi

# Backup current .env
echo "📦 Backing up .env to .env.local.backup..."
cp .env .env.local.backup

# Change Prisma schema to PostgreSQL
echo "🔄 Changing Prisma schema to PostgreSQL..."
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma

echo ""
echo "✅ Preparation complete!"
echo ""
echo "Next steps:"
echo "1. Create a Neon database (or use your existing one)"
echo "2. Update the DATABASE_URL in Vercel environment variables"
echo "3. Push your code to GitHub"
echo "4. Vercel will automatically deploy"
echo ""
echo "To revert changes for local development:"
echo "  cp .env.local.backup .env"
echo "  sed -i 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma"
echo ""
