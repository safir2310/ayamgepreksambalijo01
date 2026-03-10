import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting cashier passwords with bcrypt...');

  // Get all cashiers
  const cashiers = await prisma.user.findMany({
    where: {
      role: 'cashier',
    },
  });

  console.log(`Found ${cashiers.length} cashier(s)`);

  for (const cashier of cashiers) {
    console.log(`\nProcessing cashier: ${cashier.username}`);

    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    const isHashed = cashier.password?.startsWith('$2a$') || cashier.password?.startsWith('$2b$');

    if (isHashed) {
      console.log(`  ✓ Password already hashed, skipping...`);
      continue;
    }

    // Hash the plain text password
    if (cashier.password) {
      const hashedPassword = await bcrypt.hash(cashier.password, 10);

      await prisma.user.update({
        where: { id: cashier.id },
        data: {
          password: hashedPassword,
        },
      });

      console.log(`  ✓ Password hashed successfully`);
    } else {
      console.log(`  ! No password found, setting default...`);

      const hashedPassword = await bcrypt.hash('000000', 10);

      await prisma.user.update({
        where: { id: cashier.id },
        data: {
          password: hashedPassword,
        },
      });

      console.log(`  ✓ Default password set to: 000000`);
    }
  }

  console.log('\n✅ All cashier passwords have been reset with bcrypt!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
