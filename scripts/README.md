# Scripts Directory

This directory contains utility scripts for the Ayam Geprek Sambal Ijo application.

## Available Scripts

### create-admin.ts
Creates or updates the default admin account.
- **Username**: admin
- **Password**: 000000

Usage:
```bash
bun run scripts/create-admin.ts
```

### create-deaflud-admin.ts
Creates or updates the Deaflud admin account.
- **Username**: deaflud
- **Password**: 000000

Usage:
```bash
bun run scripts/create-deaflud-admin.ts
```

### deploy.sh
Deployment script that performs the following steps:
1. Installs dependencies
2. Generates Prisma client
3. Pushes schema to database
4. Seeds database with admin accounts
5. Builds the application

Usage:
```bash
bash scripts/deploy.sh
```

Or use the npm script:
```bash
bun run deploy
```

## Notes

- These scripts are primarily for development and manual setup
- For production deployment, use `bun run deploy`
- The seed script (`prisma/seed.ts`) is the recommended way to ensure admin accounts exist
