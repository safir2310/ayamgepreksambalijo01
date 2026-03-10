# 🚀 Quick Deployment Reference Card

## ⚡ SEBELUM DEPLOY: 5 Langkah Wajib!

### 1️⃣ Switch ke PostgreSQL
```bash
./scripts/switch-db.sh postgresql
```

### 2️⃣ Set 7 Environment Variables di Vercel
```
Settings → Environment Variables → Add New

DATABASE_URL=postgresql://neondb_owner:npg_IUiS3d0nwlhA@ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=Sama dengan DATABASE_URL
POSTGRES_PRISMA_URL=Sama dengan DATABASE_URL (tambah &connect_timeout=15)
POSTGRES_USER=neondb_owner
POSTGRES_PASSWORD=npg_IUiS3d0nwlhA
POSTGRES_HOST=ep-ancient-paper-aiifvyrx-pooler.c-4.us-east-1.aws.neon.tech
POSTGRES_DATABASE=neondb

⚠️ CENTANG: Production ☑  Preview ☑  Development ☑
```

### 3️⃣ Commit & Push
```bash
git add .
git commit -m "chore: Deploy to Vercel"
git push
```

### 4️⃣ Setup Database (Setelah Deploy Berhasil)
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
bunx prisma db push
bun run db:seed
```

### 5️⃣ Redeploy & Test
```
Vercel Dashboard → Deployments → Redeploy

Test login: admin / 000000
```

---

## 🚨 5 Error Paling Umum & Cara Mencegahnya

| Error | Penyebab | Cara Mencegah |
|-------|----------|---------------|
| Environment variable not found | Variables belum ada saat build | Tambah 7 env vars SEBELUM build |
| Can't reach database server | Connection string salah / tidak ada ssl | Gunakan `?sslmode=require` |
| Schema not found | Database belum di-setup | Jalankan `prisma db push` & `db:seed` |
| Build failed: Prisma Client not generated | postinstall tidak jalan | Pastikan `postinstall: "prisma generate"` |
| Client-side exception | Database kosong / API error | Setup database sebelum test |

---

## ✅ Quick Checklist

### Pre-Deploy:
- [ ] Schema uses `postgresql` provider
- [ ] 7 env vars di Vercel (semua dicentang)
- [ ] No sensitive data in code
- [ ] Dependencies up-to-date

### Post-Deploy:
- [ ] `prisma db push` sudah dijalankan
- [ ] `db:seed` sudah dijalankan
- [ ] Redeploy sudah dilakukan
- [ ] Login admin berhasil
- [ ] API endpoints berfungsi

---

## 🔄 Local vs Production

### Local Development (SQLite):
```bash
./scripts/switch-db.sh sqlite
bunx prisma generate
bun run dev
```

### Production Deployment (PostgreSQL):
```bash
./scripts/switch-db.sh postgresql
git add . && git commit -m "deploy" && git push
# Setelah deploy, setup database lalu redeploy
```

---

## 📞 Emergency Rollback

### Quick Rollback:
```
Vercel Dashboard → Deployments → [Previous Working] → Redeploy
```

### Git Rollback:
```bash
git log --oneline
git checkout [commit-hash]
git push origin master --force
```

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/safir2310/ayamgepreksambalijo01
- **Neon Console**: https://console.neon.tech
- **GitHub Repo**: https://github.com/safir2310/ayamgepreksambalijo01
- **Full Guide**: `DEPLOYMENT_RECOMMENDATIONS.md`

---

## 💡 7 Aturan Emas

1. ✅ Set environment variables SEBELUM build
2. ✅ Use correct database provider for environment
3. ✅ Pastikan 7 env vars SEMUA ada di Vercel
4. ✅ JANGAN commit sensitive data
5. ✅ Setup database SETELAH deploy
6. ✅ Test locally SEBELUM deploy
7. ✅ Monitor logs di Vercel setelah deploy

---

**Print atau bookmark ini untuk quick reference! 📌**
