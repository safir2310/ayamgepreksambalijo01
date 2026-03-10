# Database Provider Switching

## Overview

This project uses different database providers for different environments:
- **SQLite**: For local development
- **PostgreSQL (Neon)**: For Vercel production

## Quick Switch

Use the provided script to switch between databases:

```bash
# Switch to SQLite (local development)
./scripts/switch-db.sh sqlite

# Switch to PostgreSQL (Vercel deployment)
./scripts/switch-db.sh postgresql
```

## Manual Switch

### For Local Development (SQLite)

1. Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Create/update `.env.local`:
```env
DATABASE_URL=file:./db/custom.db
```

3. Run:
```bash
bunx prisma generate
bunx prisma db push
bun run dev
```

### For Vercel Deployment (PostgreSQL)

1. Edit `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Ensure environment variables are set in Vercel:
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_HOST`
   - `POSTGRES_DATABASE`

3. Commit and push:
```bash
git add prisma/schema.prisma
git commit -m "chore: Switch to PostgreSQL for Vercel deployment"
git push
```

## Workflow

### Daily Development (SQLite)
```bash
./scripts/switch-db.sh sqlite
bunx prisma generate
bunx prisma db push
bun run dev
```

### Deploy to Vercel (PostgreSQL)
```bash
./scripts/switch-db.sh postgresql
git add .
git commit -m "feat: Deploy to Vercel"
git push

# After deploy, switch back to SQLite for continued development
./scripts/switch-db.sh sqlite
bunx prisma generate
bun run dev
```

## Important Notes

1. **Never commit `.env` or `.env.local`** - Use `.env.example` as template
2. **Database files are git-ignored** - `db/*.db` is in `.gitignore`
3. **Local and production databases are separate** - Changes in one don't affect the other
4. **Always regenerate Prisma Client** after switching providers

## Troubleshooting

### Error: "URL must start with postgresql://"
**Cause**: Schema uses PostgreSQL but .env uses SQLite

**Solution**: 
```bash
./scripts/switch-db.sh sqlite
bunx prisma generate
```

### Error: "Cannot connect to database"
**Cause**: Wrong provider for current environment

**Solution**:
- Local: Use SQLite
- Vercel: Use PostgreSQL (set environment variables)

### Build fails on Vercel
**Cause**: Schema still uses SQLite

**Solution**:
```bash
./scripts/switch-db.sh postgresql
git add prisma/schema.prisma
git commit -m "fix: Use PostgreSQL for Vercel"
git push
```
