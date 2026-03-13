#!/bin/bash

# Quick Deploy Script for Vercel
# This script will deploy the fixed version to Vercel

set -e

echo "========================================="
echo "Ayam Geprek Sambal Ijo - Quick Deploy"
echo "========================================="
echo ""

echo "Step 1: Generating Prisma Client..."
bunx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "Step 2: Checking lint..."
bun run lint || echo "⚠️  Some linting warnings found (ignoring)"
echo "✅ Lint check complete"
echo ""

echo "Step 3: Building Next.js application..."
bun run build
echo "✅ Build complete"
echo ""

echo "Step 4: Deploying to Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod
  echo "✅ Deployed to Vercel"
else
  echo "❌ Vercel CLI not found. Installing..."
  bun install -g vercel
  vercel --prod
  echo "✅ Deployed to Vercel"
fi
echo ""

echo "========================================="
echo "✅ Deployment complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Wait for Vercel to finish deploying"
echo "2. Visit your Vercel URL to verify"
echo "3. Check browser console for any errors"
echo ""
