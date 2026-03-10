#!/bin/bash

# Script untuk switch database provider di Prisma schema
# SQLite untuk local development
# PostgreSQL untuk Vercel deployment

echo "=========================================="
echo "Switch Database Provider"
echo "=========================================="
echo ""

if [ -z "$1" ]; then
    echo "Usage: ./scripts/switch-db.sh [sqlite|postgresql]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/switch-db.sh sqlite     # For local development"
    echo "  ./scripts/switch-db.sh postgresql # For Vercel deployment"
    echo ""
    exit 1
fi

PROVIDER=$1

# Validate input
if [ "$PROVIDER" != "sqlite" ] && [ "$PROVIDER" != "postgresql" ]; then
    echo "❌ Error: Provider must be 'sqlite' or 'postgresql'"
    echo ""
    exit 1
fi

# Check if prisma/schema.prisma exists
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found"
    echo ""
    exit 1
fi

echo "🔄 Switching to $PROVIDER..."
echo ""

# Update prisma/schema.prisma
if [ "$PROVIDER" = "sqlite" ]; then
    # Switch to SQLite
    sed -i 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma
    
    # Create/update .env.local for SQLite
    echo "# Local Development with SQLite" > .env.local
    echo "DATABASE_URL=file:./db/custom.db" >> .env.local
    
    echo "✅ Switched to SQLite"
    echo "📝 Environment: .env.local (DATABASE_URL=file:./db/custom.db)"
    echo ""
    echo "Next steps:"
    echo "  bunx prisma generate"
    echo "  bunx prisma db push"
    echo "  bun run dev"
    
elif [ "$PROVIDER" = "postgresql" ]; then
    # Switch to PostgreSQL
    sed -i 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
    
    # Note about .env
    echo "✅ Switched to PostgreSQL"
    echo "⚠️  Make sure DATABASE_URL is set to PostgreSQL connection string"
    echo ""
    echo "For Vercel deployment, ensure environment variables are set:"
    echo "  - DATABASE_URL"
    echo "  - POSTGRES_URL"
    echo "  - POSTGRES_PRISMA_URL"
    echo "  - POSTGRES_USER"
    echo "  - POSTGRES_PASSWORD"
    echo "  - POSTGRES_HOST"
    echo "  - POSTGRES_DATABASE"
    echo ""
    echo "Next steps:"
    echo "  git add prisma/schema.prisma"
    echo "  git commit -m 'chore: Switch to PostgreSQL for Vercel deployment'"
    echo "  git push"
fi

echo ""
echo "=========================================="
