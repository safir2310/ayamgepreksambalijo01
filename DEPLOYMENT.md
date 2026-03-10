# 🍗 Ayam Geprek Sambal Ijo - Food Delivery App

Aplikasi pemesanan makanan online untuk Ayam Geprek Sambal Ijo dengan fitur lengkap termasuk manajemen pesanan, menu, dan sistem admin.

## 🚀 Quick Start

### Prerequisites
- Bun runtime
- Node.js 18+
- SQLite (included with Prisma)

### Installation

```bash
# Install dependencies
bun install

# Setup database and create admin accounts
bun run db:push:seed

# Start development server
bun run dev
```

Visit `http://localhost:3000` to view the application.

## 👤 Admin Accounts

### Default Admin Users

The application includes two admin accounts created automatically:

| Username | Password | Role |
|----------|----------|------|
| admin | 000000 | Administrator |
| deaflud | 000000 | Administrator |

### Creating Admin Accounts

Admin accounts are created automatically when you seed the database:

```bash
# Manual seeding
bun run db:seed

# Or with database push
bun run db:push:seed
```

### Admin Features

When logged in as admin, you have access to:

- **Dashboard**: Overview of orders, revenue, and statistics
- **Order Management**: View, filter, and update order statuses
- **Menu Management**: Add, edit, and delete menu items

## 📦 Available Scripts

### Development

```bash
bun run dev          # Start development server
bun run lint          # Run ESLint
```

### Database

```bash
bun run db:push       # Push schema changes to database
bun run db:push:seed  # Push schema and seed admin accounts
bun run db:generate   # Generate Prisma client
bun run db:seed       # Seed database with admin accounts
bun run db:migrate    # Run database migrations
bun run db:reset      # Reset database
```

### Build & Deploy

```bash
bun run build         # Build for production
bun run start         # Start production server
bun run deploy        # Full deployment with admin setup
```

## 🚀 Deployment

### Automated Deployment

Use the deploy script for a complete setup:

```bash
bun run deploy
```

This command will:
1. Install dependencies
2. Generate Prisma client
3. Push schema to database
4. Seed admin accounts
5. Build the application

### Manual Deployment

```bash
# 1. Install dependencies
bun install

# 2. Setup database
bun run db:push
bun run db:seed

# 3. Build application
bun run build

# 4. Start production server
bun run start
```

## 🔐 Security Notes

⚠️ **IMPORTANT**: Change default admin passwords in production!

### To Change Admin Passwords

**Option 1 - Via Forgot Password Feature:**
1. Login to the app
2. Use the "Lupa Password" feature with the admin's username and email
3. Set a new password

**Option 2 - Update Seed Script:**
1. Edit `prisma/seed.ts`
2. Change the password for admin users
3. Re-run: `bun run db:seed`

**Option 3 - Direct Database Update:**
Update the password directly in the database using a database tool.

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed script
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   └── store/            # State management (Zustand)
├── db/                   # SQLite database files
└── scripts/              # Utility scripts
```

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM + SQLite
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## 📱 Features

### Customer Features
- Browse menu with categories
- Search and filter menu items
- Add to cart with custom options (spicy level, extras)
- Multiple payment methods
- Order tracking
- Saved addresses
- Points & rewards system
- User profile management

### Admin Features
- Dashboard with statistics
- Order management (view, filter, update status)
- Menu management (CRUD operations)
- Real-time order updates

## 🏪 Brand Identity

- **Primary Color**: #E53935 (Red Chili)
- **Secondary Color**: #FFC107 (Yellow)
- **Fonts**: Poppins, Inter
- **Store Name**: AYAM GEPREK SAMBAL IJO

## 📞 Contact

- **Address**: Jl. Medan - Banda Aceh, Simpang Camat, Gampong Tijue, Kec. Pidie, Kab. Pidie, 24151
- **Hours**: 10:00 - 22:00 WIB
- **WhatsApp**: 0852-6081-2758

## 📄 License

Copyright © 2026 Ayam Geprek Sambal Ijo. All rights reserved.

## 🆘 Troubleshooting

### Database Issues

```bash
# Reset database
bun run db:reset

# Or manually delete db/custom.db and re-seed
rm db/custom.db
bun run db:push:seed
```

### Admin Accounts Missing

```bash
# Re-seed database
bun run db:seed
```

### Build Errors

```bash
# Clean and rebuild
rm -rf .next
bun run build
```

For more information, see [ADMIN.md](./ADMIN.md) for admin account details and [scripts/README.md](./scripts/README.md) for utility scripts.
