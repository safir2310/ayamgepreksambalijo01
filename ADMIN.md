# Admin Accounts

## Default Admin Users

The application has two default admin accounts that are created automatically when the database is seeded:

### 1. Admin Account
- **Username**: `admin`
- **Password**: `000000`
- **Email**: admin@ayamgeprek.com
- **Role**: admin

### 2. Deaflud Account
- **Username**: `deaflud`
- **Password**: `000000`
- **Email**: deaflud@ayamgeprek.com
- **Role**: admin

## Database Seeding

### Manual Seeding

To manually seed the database with admin accounts:

```bash
bun run db:seed
```

### Automatic Seeding with Database Push

To push schema changes and seed the database in one command:

```bash
bun run db:push:seed
```

## Deployment

### Pre-deployment Setup

Before deploying, ensure the admin accounts are created:

```bash
# Option 1: Push schema and seed
bun run db:push:seed

# Option 2: Generate Prisma client and seed
bun run db:generate
bun run db:seed
```

### Build Process

The build process includes Prisma client generation:

```bash
bun run build
```

### Production Deployment

For production deployment:

1. **Set up environment variables** (if needed):
   - `DATABASE_URL` - Database connection string

2. **Seed the database**:
   ```bash
   bun run db:seed
   ```

3. **Build the application**:
   ```bash
   bun run build
   ```

4. **Start the production server**:
   ```bash
   bun run start
   ```

## Admin Features

When logged in as an admin, users have access to:

- **Dashboard**: Overview of orders, revenue, and statistics
- **Order Management**: View, filter, and update order status
- **Menu Management**: Add, edit, and delete menu items

## Security Notes

⚠️ **IMPORTANT**: Change the default passwords in production environment!

To update admin passwords, you can:

1. Use the "Lupa Password" feature in the app
2. Manually update in the database
3. Update the seed script and re-seed

## Troubleshooting

### Admin accounts not appearing after deployment

Run the seed command:
```bash
bun run db:seed
```

### Database connection errors

Ensure `DATABASE_URL` is set correctly in `.env` file:
```
DATABASE_URL="file:./db/custom.db"
```

### Seed command fails

1. Ensure Prisma client is generated:
   ```bash
   bun run db:generate
   ```

2. Check database file permissions in `db/` directory

3. Ensure TypeScript is properly configured
