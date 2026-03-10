import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDeafludAdmin() {
  try {
    // Check if deaflud admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        username: 'deaflud',
      },
    });

    if (existingAdmin) {
      console.log('Admin user "deaflud" already exists. Updating password and role...');

      // Update existing admin
      await prisma.user.update({
        where: {
          id: existingAdmin.id,
        },
        data: {
          password: '000000',
          role: 'admin',
        },
      });

      console.log('Admin "deaflud" updated successfully!');
    } else {
      // Create new admin user
      const admin = await prisma.user.create({
        data: {
          username: 'deaflud',
          password: '000000',
          name: 'Deaflud',
          email: 'deaflud@ayamgeprek.com',
          role: 'admin',
          points: 0,
        },
      });

      console.log('Admin user "deaflud" created successfully!');
      console.log('Username: deaflud');
      console.log('Password: 000000');
      console.log('Admin ID:', admin.id);
    }
  } catch (error) {
    console.error('Error creating deaflud admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDeafludAdmin();
