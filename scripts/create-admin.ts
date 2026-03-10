import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        username: 'admin',
      },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Updating password...');

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

      console.log('Admin password updated successfully!');
    } else {
      // Create new admin user
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          password: '000000',
          name: 'Administrator',
          email: 'admin@ayamgeprek.com',
          role: 'admin',
          points: 0,
        },
      });

      console.log('Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: 000000');
      console.log('Admin ID:', admin.id);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
