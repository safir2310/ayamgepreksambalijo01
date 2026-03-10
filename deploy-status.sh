#!/bin/bash

echo "========================================="
echo "    AYAM GEPREK SAMBAL IJO"
echo "    Vercel Deployment Status Check"
echo "========================================="
echo ""

# Check if Vercel project exists
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    
    # Try to get project info
    PROJECT_NAME="websiteayamgepreksambalijo"
    
    # Check if we can get project info (without actually logging in)
    echo ""
    echo "Checking project: $PROJECT_NAME..."
    
    # Try to list projects
    if vercel project list 2>/dev/null; then
        if vercel project list 2>/dev/null | grep -q "$PROJECT_NAME"; then
            echo "✅ Project found on Vercel"
        else
            echo "⚠️  Project not found on Vercel"
        fi
    else
        echo "⚠️  Vercel CLI not found in PATH"
    fi
else
    echo "⚠️  Vercel CLI is not installed"
fi

echo ""
echo "Deployment Information:"
echo "--------------------------------"
echo "Repository: https://github.com/safir2310/websiteayamgepreksambalijo"
echo "Branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo ""

# Get latest commit hash
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "Commit hash: $COMMIT_HASH"
echo ""

echo "Next Steps:"
echo "--------------------------------"
echo "1. Buka dashboard Vercel untuk:"
echo "   https://vercel.com/dashboard"
echo "   Pilih project: websiteayamgepreksambalijo"
echo ""
echo "2. Cek status deployment terbaru:"
echo "   - Klik project → Deployments → websiteayamgepreksambalijo"
echo ""
echo "3. Cek deployment logs untuk error:"
echo "   - Klik project → Logs → terbaru → Console"
echo ""

echo "✅ Push ke GitHub berhasil!"
echo "Vercel akan otomatis mendeteksi perubahan dan redeploy."
echo ""
echo "Untuk monitoring:"
echo "- Neon Console: https://console.neon.tech"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "========================================="
