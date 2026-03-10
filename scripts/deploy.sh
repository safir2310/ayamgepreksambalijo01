#!/bin/bash

# Deployment script for Ayam Geprek Sambal Ijo App
# This script ensures admin accounts are created during deployment

set -e

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
bun install

# Step 2: Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

# Step 3: Push schema to database
echo "💾 Pushing schema to database..."
bun run db:push

# Step 4: Seed database with admin accounts
echo "🌱 Seeding database with admin accounts..."
bun run db:seed

# Step 5: Build the application
echo "🏗️  Building application..."
bun run build

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Admin Accounts:"
echo "   - Username: admin, Password: 000000"
echo "   - Username: deaflud, Password: 000000"
echo ""
echo "🎉 You can now start the application with: bun run start"
