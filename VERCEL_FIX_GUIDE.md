# Fix Vercel Deployment Client-Side Exception

## Problem

Your Vercel deployment at `ayamgepreksambalijo01.vercel.app` is showing a client-side exception because:

1. **Database Configuration Issue**: The app is trying to use SQLite (file-based database) on Vercel, but Vercel's serverless environment doesn't support persistent file storage.

2. **Missing Environment Variables**: Vercel deployment requires PostgreSQL database connection variables.

## Solution

You need to configure the app to use PostgreSQL (Neon) on Vercel. Follow these steps:

---

## Step 1: Change Prisma Schema to PostgreSQL for Vercel

Before deploying to Vercel, you need to change the database provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

**For local development**, keep it as `sqlite` and use:
```env
DATABASE_URL=file:./db/custom.db
```

---

## Step 2: Set Up Neon Database (or another PostgreSQL)

### Option A: Use Vercel Neon Integration (Recommended)

1. Go to your Vercel project: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Click **Storage** in the sidebar
3. Click **"Create Database"**
4. Select **Neon Postgres**
5. Follow the setup wizard
6. Vercel will automatically add environment variables

### Option B: Manual Neon Setup

1. Go to https://neon.tech and sign up/login
2. Create a new project
3. Copy the connection string (looks like: `postgresql://username:password@host/database?sslmode=require`)

---

## Step 3: Add Environment Variables in Vercel

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://[your-neon-connection-string]?sslmode=require` |
| `POSTGRES_URL` | Same as DATABASE_URL |
| `POSTGRES_PRISMA_URL` | Same as DATABASE_URL with `&connect_timeout=15` |
| `POSTGRES_USER` | Your Neon username |
| `POSTGRES_PASSWORD` | Your Neon password |
| `POSTGRES_HOST` | Your Neon host |
| `POSTGRES_DATABASE` | Your Neon database name |

**Important**: Select all environments (Production, Preview, Development) when adding variables.

---

## Step 4: Update and Push Code to GitHub

After making changes:

```bash
# Change Prisma schema to PostgreSQL for production
# Edit prisma/schema.prisma and change:
# provider = "sqlite" → provider = "postgresql"

# Commit and push
git add .
git commit -m "Fix: Update database to PostgreSQL for Vercel deployment"
git push origin main
```

Vercel will automatically redeploy when you push.

---

## Step 5: Push Schema to Neon Database

After Vercel deployment completes, you need to push the database schema:

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.production

# Push schema to Neon
DATABASE_URL="postgresql://[your-connection-string]?sslmode=require" bunx prisma db push

# Seed database with admin accounts
DATABASE_URL="postgresql://[your-connection-string]?sslmode=require" bun run db:seed
```

### Option B: Using Neon Dashboard

1. Go to https://console.neon.tech
2. Select your database
3. Click **SQL Editor**
4. Copy the schema from `prisma/schema.prisma` or run `prisma db push` locally with Neon connection string

---

## Step 6: Verify Deployment

1. Go to your Vercel deployment URL
2. Try logging in with admin credentials:
   - Username: `admin`
   - Password: `000000`

If you still see errors, check Vercel logs:
- Go to your Vercel project
- Click **Deployments** → click on the latest deployment
- Click **Build Logs** or **Function Logs**

---

## Alternative: Use Supabase or PlanetScale

If Neon doesn't work, you can use other PostgreSQL providers:

### Supabase
1. Create account at https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add to Vercel environment variables

### PlanetScale (MySQL)
1. Change Prisma schema provider to `mysql`
2. Create account at https://planetscale.com
3. Create database
4. Add connection string to Vercel

---

## Quick Troubleshooting

### Error: "Cannot read properties of undefined"
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Make sure Prisma schema uses `postgresql` provider

### Error: "Database connection failed"
- Check that database URL includes `?sslmode=require`
- Verify database credentials are correct
- Make sure database is active (not suspended)

### Error: "Schema not found"
- Run `prisma db push` with the production DATABASE_URL
- Make sure to redeploy after pushing schema

---

## Development Workflow

### For Local Development (SQLite):
```env
# .env
DATABASE_URL=file:./db/custom.db
```

```prisma
# prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### For Production (Vercel - PostgreSQL):
```env
# Vercel Environment Variables
DATABASE_URL=postgresql://neon-connection-string?sslmode=require
```

```prisma
# prisma/schema.prisma (commit this for production)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
- Check Vercel deployment logs for detailed error messages
