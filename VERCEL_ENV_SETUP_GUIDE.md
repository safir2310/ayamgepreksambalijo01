# Vercel Environment Variables Setup Guide

## Problem:
```
Environment Variable "DATABASE_URL" references Secret "database-url", which does not exist.
```

## Cause:
The `vercel.json` file was referencing Vercel Secrets (like `@database-url`, `@postgres-url`) that don't exist in your Vercel account.

## Solution:
Remove `vercel.json` and set environment variables directly in Vercel Dashboard.

## Steps to Fix:

### Step 1: Open Vercel Dashboard
1. Go to: https://vercel.com/safir2310/ayamgepreksambalijo01
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar

### Step 2: Add Environment Variables

You need to add these 7 environment variables:

#### 1. DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: 
  ```
  postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Environments**: Select ALL (Production, Preview, Development)
- Click "Save"

#### 2. POSTGRES_URL
- **Name**: `POSTGRES_URL`
- **Value**: 
  ```
  postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Environments**: Select ALL
- Click "Save"

#### 3. POSTGRES_PRISMA_URL
- **Name**: `POSTGRES_PRISMA_URL`
- **Value**: 
  ```
  postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
  ```
- **Environments**: Select ALL
- Click "Save"

#### 4. POSTGRES_USER
- **Name**: `POSTGRES_USER`
- **Value**: `neondb_owner`
- **Environments**: Select ALL
- Click "Save"

#### 5. POSTGRES_PASSWORD
- **Name**: `POSTGRES_PASSWORD`
- **Value**: `npg_IUiS3d0nwlhA`
- **Environments**: Select ALL
- Click "Save"

#### 6. POSTGRES_HOST
- **Name**: `POSTGRES_HOST`
- **Value**: `ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech`
- **Environments**: Select ALL
- Click "Save"

#### 7. POSTGRES_DATABASE
- **Name**: `POSTGRES_DATABASE`
- **Value**: `neondb`
- **Environments**: Select ALL
- Click "Save"

### Step 3: Redeploy

After adding all environment variables:

1. Go to "Deployments" tab
2. Click on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## Alternative: Quick Copy-Paste

Here are all the values you need (copy each one):

```
DATABASE_URL=postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL=postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

POSTGRES_USER=neondb_owner

POSTGRES_PASSWORD=npg_IUiS3d0nwlhA

POSTGRES_HOST=ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech

POSTGRES_DATABASE=neondb
```

## Verification:

After deployment, the error should be gone:
- ✅ No more "Secret does not exist" error
- ✅ Database connection should work
- ✅ Application should load successfully

## What Was Changed:

### Removed:
- `vercel.json` file (was referencing non-existent Vercel Secrets)

### Result:
- Environment variables must be set directly in Vercel Dashboard
- No more dependency on Vercel Secrets
- Simpler configuration

## Important Notes:

1. **Select ALL Environments**: Make sure to select Production, Preview, and Development for each variable
2. **Wait for Deployment**: After adding variables, trigger a new deployment
3. **Database is Ready**: Your Neon PostgreSQL database is already set up and working
4. **Security**: These credentials are for Neon PostgreSQL database

## Troubleshooting:

### If deployment still fails after adding variables:

1. **Check spelling**: Ensure variable names match exactly (case-sensitive)
2. **Check values**: Ensure no extra spaces or line breaks in values
3. **Check environment selections**: Make sure ALL environments are selected
4. **Redeploy**: Manually trigger a new deployment after adding variables

### If you want to use Vercel Secrets instead:

If you prefer using Vercel Secrets for better security:

1. Go to Vercel Dashboard → Settings → Environment Variables → Secrets
2. Create these secrets:
   - `database-url`
   - `postgres-url`
   - `postgres-prisma-url`
   - `postgres-user`
   - `postgres-password`
   - `postgres-host`
   - `postgres-database`
3. Update `vercel.json` to reference them (using `@` prefix)

But for now, using direct environment variables is simpler and works perfectly.

---

Last updated: March 13, 2025
Status: vercel.json removed, need to set env vars in Vercel Dashboard
