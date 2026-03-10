import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing categories and menu items
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  console.log('🗑️ Cleared existing data...');

  // Create categories
  const categories = [
    {
      name: 'Ayam Geprek',
      slug: 'ayam-geprek',
      icon: '🍗',
      description: 'Ayam geprek dengan berbagai pilihan sambal',
      order: 1,
    },
    {
      name: 'Paket Hemat',
      slug: 'paket-hemat',
      icon: '🍱',
      description: 'Paket makan lengkap dengan harga hemat',
      order: 2,
    },
    {
      name: 'Minuman',
      slug: 'minuman',
      icon: '🥤',
      description: 'Berbagai pilihan minuman segar',
      order: 3,
    },
    {
      name: 'Sambal Level',
      slug: 'sambal-level',
      icon: '🌶️',
      description: 'Pilihan level kepedasan sambal',
      order: 4,
    },
    {
      name: 'Pelengkap',
      slug: 'pelengkap',
      icon: '🥗',
      description: 'Menu tambahan pelengkap makan',
      order: 5,
    },
  ];

  const createdCategories: any[] = [];
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    });
    createdCategories.push(created);
    console.log(`✅ Created category: ${category.name}`);
  }

  // Helper function to get category ID and name by slug
  const getCategory = (slug: string) => {
    const cat = createdCategories.find(c => c.slug === slug);
    return cat ? { id: cat.id, name: cat.name } : null;
  };

  // Create menu items
  const menuItems = [
    // Ayam Geprek
    {
      name: 'Ayam Geprek Original',
      slug: 'ayam-geprek-original',
      description: 'Ayam goreng crispy yang digeprek dengan sambal bawang merah khas. Gurih, pedas, dan nikmat!',
      price: 18000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 3,
      isPopular: true,
      rating: 4.8,
      reviewCount: 234,
      image: null,
    },
    {
      name: 'Ayam Geprek Keju',
      slug: 'ayam-geprek-keju',
      description: 'Ayam geprek dengan taburan keju mozzarella yang lumer. Perpaduan pedas dan creamy yang sempurna.',
      price: 22000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 3,
      isPopular: true,
      rating: 4.9,
      reviewCount: 189,
      image: null,
    },
    {
      name: 'Ayam Geprek Mozzarella',
      slug: 'ayam-geprek-mozzarella',
      description: 'Ayam geprek dengan keju mozzarella yang dipanggang hingga meleleh. Sensasi keju lumer di setiap gigitan.',
      price: 25000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 3,
      isPopular: true,
      rating: 4.9,
      reviewCount: 312,
      image: null,
    },
    {
      name: 'Ayam Geprek Sambal Matah',
      slug: 'ayam-geprek-sambal-matah',
      description: 'Ayam geprek dengan sambal matah khas Bali yang segar dan aromatik.',
      price: 20000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 2,
      rating: 4.7,
      reviewCount: 156,
      image: null,
    },
    {
      name: 'Ayam Geprek Sambal Ijo',
      slug: 'ayam-geprek-sambal-ijo',
      description: 'Ayam geprek dengan sambal ijo pedas yang segar dan nikmat.',
      price: 20000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 4,
      isPopular: true,
      rating: 4.8,
      reviewCount: 267,
      image: null,
    },
    {
      name: 'Ayam Geprek Super Pedas',
      slug: 'ayam-geprek-super-pedas',
      description: 'Ayam geprek level 10 untuk pecinta pedas sejati. Hati-hati, benar-benar pedas!',
      price: 20000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 10,
      rating: 4.6,
      reviewCount: 98,
      image: null,
    },
    {
      name: 'Ayam Geprek Krispi',
      slug: 'ayam-geprek-krispi',
      description: 'Ayam geprek dengan kulit super krispi dan sambal bawang yang nendang.',
      price: 19000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 3,
      rating: 4.7,
      reviewCount: 145,
      image: null,
    },
    {
      name: 'Ayam Geprek Telur',
      slug: 'ayam-geprek-telur',
      description: 'Ayam geprek dengan telur mata sapi atau dadar yang digeprek bersama.',
      price: 20000,
      category: 'Ayam Geprek',
      categoryId: getCategory('ayam-geprek')!.id,
      spicyLevel: 3,
      rating: 4.5,
      reviewCount: 87,
      image: null,
    },

    // Paket Hemat
    {
      name: 'Paket Nasi Ayam Geprek',
      slug: 'paket-nasi-ayam-geprek',
      description: 'Ayam geprek original + nasi + es teh manis. Paket lengkap dan mengenyangkan!',
      price: 28000,
      category: 'Paket Hemat',
      categoryId: getCategory('paket-hemat')!.id,
      spicyLevel: 3,
      isPopular: true,
      rating: 4.8,
      reviewCount: 423,
      image: null,
    },
    {
      name: 'Paket Jumbo',
      slug: 'paket-jumbo',
      description: '2 ayam geprek + nasi besar + 2 es teh. Cocok untuk berdua!',
      price: 45000,
      category: 'Paket Hemat',
      categoryId: getCategory('paket-hemat')!.id,
      spicyLevel: 3,
      isPromo: true,
      discountPercent: 10,
      rating: 4.9,
      reviewCount: 234,
      image: null,
    },
    {
      name: 'Paket Keluarga',
      slug: 'paket-keluarga',
      description: '4 ayam geprek + 4 nasi + 4 es teh. Cocok untuk makan bersama keluarga!',
      price: 85000,
      category: 'Paket Hemat',
      categoryId: getCategory('paket-hemat')!.id,
      spicyLevel: 3,
      isPromo: true,
      discountPercent: 15,
      rating: 4.9,
      reviewCount: 167,
      image: null,
    },
    {
      name: 'Paket Hemat 1',
      slug: 'paket-hemat-1',
      description: 'Ayam geprek original + nasi. Hemat dan mengenyangkan.',
      price: 24000,
      category: 'Paket Hemat',
      categoryId: getCategory('paket-hemat')!.id,
      spicyLevel: 3,
      isPromo: true,
      discountPercent: 5,
      rating: 4.6,
      reviewCount: 189,
      image: null,
    },

    // Minuman
    {
      name: 'Es Teh Manis',
      slug: 'es-teh-manis',
      description: 'Es teh manis segar yang menyegarkan.',
      price: 5000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      isPopular: true,
      rating: 4.5,
      reviewCount: 567,
      image: null,
    },
    {
      name: 'Es Jeruk',
      slug: 'es-jeruk',
      description: 'Es jeruk peras asli yang segar dan sehat.',
      price: 8000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      rating: 4.6,
      reviewCount: 234,
      image: null,
    },
    {
      name: 'Teh Tarik',
      slug: 'teh-tarik',
      description: 'Teh tarik creamy dengan rasa teh susu yang khas.',
      price: 10000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      isPopular: true,
      rating: 4.7,
      reviewCount: 345,
      image: null,
    },
    {
      name: 'Thai Tea',
      slug: 'thai-tea',
      description: 'Thai tea dengan rasa teh thai yang otentik dan creamy.',
      price: 12000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      isPopular: true,
      rating: 4.8,
      reviewCount: 412,
      image: null,
    },
    {
      name: 'Es Kelapa Muda',
      slug: 'es-kelapa-muda',
      description: 'Es kelapa muda segar dengan daging kelapa yang manis.',
      price: 10000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      rating: 4.6,
      reviewCount: 189,
      image: null,
    },
    {
      name: 'Jus Alpukat',
      slug: 'jus-alpukat',
      description: 'Jus alpukat creamy dengan susu coklat.',
      price: 15000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      rating: 4.7,
      reviewCount: 278,
      image: null,
    },
    {
      name: 'Kopi Hitam',
      slug: 'kopi-hitam',
      description: 'Kopi hitam robusta yang kuat dan nikmat.',
      price: 8000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      rating: 4.4,
      reviewCount: 123,
      image: null,
    },
    {
      name: 'Es Campur',
      slug: 'es-campur',
      description: 'Es campur dengan berbagai buah dan sirup merah.',
      price: 15000,
      category: 'Minuman',
      categoryId: getCategory('minuman')!.id,
      spicyLevel: 0,
      rating: 4.5,
      reviewCount: 234,
      image: null,
    },

    // Pelengkap
    {
      name: 'Nasi Putih',
      slug: 'nasi-putih',
      description: 'Nasi putih hangat.',
      price: 5000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 0,
      rating: 4.3,
      reviewCount: 456,
      image: null,
    },
    {
      name: 'Extra Nasi',
      slug: 'extra-nasi',
      description: 'Porsi nasi tambahan yang lebih besar.',
      price: 8000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 0,
      rating: 4.4,
      reviewCount: 234,
      image: null,
    },
    {
      name: 'Tahu Tempe Goreng',
      slug: 'tahu-tempe-goreng',
      description: 'Tahu dan tempe goreng crispy.',
      price: 8000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 0,
      rating: 4.5,
      reviewCount: 178,
      image: null,
    },
    {
      name: 'Kerupuk',
      slug: 'kerupuk',
      description: 'Kerupuk udang atau ikan yang renyah.',
      price: 5000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 0,
      rating: 4.3,
      reviewCount: 345,
      image: null,
    },
    {
      name: 'Lalapan',
      slug: 'lalapan',
      description: 'Lalapan segar: kemangi, selada, timun, tomat.',
      price: 5000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 0,
      rating: 4.4,
      reviewCount: 234,
      image: null,
    },
    {
      name: 'Sambal Extra',
      slug: 'sambal-extra',
      description: 'Sambal tambahan untuk yang suka pedas.',
      price: 3000,
      category: 'Pelengkap',
      categoryId: getCategory('pelengkap')!.id,
      spicyLevel: 5,
      rating: 4.6,
      reviewCount: 567,
      image: null,
    },
  ];

  for (const item of menuItems) {
    // Get the category name from categoryId
    const category = createdCategories.find(c => c.id === item.categoryId)?.name || 'Uncategorized';

    await prisma.menuItem.create({
      data: {
        ...item,
        category,
      },
    });
    console.log(`✅ Created menu item: ${item.name}`);
  }

  // Create or update admin users
  const adminUsers = [
    {
      username: 'admin',
      password: '000000',
      name: 'Administrator',
      email: 'admin@ayamgeprek.com',
      role: 'admin',
    },
    {
      username: 'deaflud',
      password: '000000',
      name: 'Deaflud',
      email: 'deaflud@ayamgeprek.com',
      role: 'admin',
    },
  ];

  for (const adminData of adminUsers) {
    const existingAdmin = await prisma.user.findFirst({
      where: { username: adminData.username },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    if (existingAdmin) {
      console.log(`✅ Admin "${adminData.username}" already exists. Updating...`);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          password: hashedPassword,
          role: adminData.role as any,
          ...(adminData.name && { name: adminData.name }),
          ...(adminData.email && { email: adminData.email }),
        },
      });
      console.log(`   ✨ Updated admin "${adminData.username}"`);
    } else {
      await prisma.user.create({
        data: {
          username: adminData.username,
          password: hashedPassword,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role as any,
          points: 0,
        },
      });
      console.log(`   ✨ Created admin "${adminData.username}"`);
    }
  }

  // Create some sample users
  const sampleUsers = [
    {
      username: 'user1',
      password: '123456',
      name: 'Budi Santoso',
      email: 'budi@email.com',
      phone: '081234567890',
      role: 'user',
    },
    {
      username: 'user2',
      password: '123456',
      name: 'Siti Rahayu',
      email: 'siti@email.com',
      phone: '082345678901',
      role: 'user',
    },
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findFirst({
      where: { username: userData.username },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          ...userData,
          role: userData.role as any,
          points: 100, // Give them some initial points
        },
      });
      console.log(`   ✨ Created user "${userData.username}"`);
    }
  }

  // Create reward items
  const rewardItems = [
    {
      name: 'Es Teh Manis Gratis',
      description: 'Tukar 50 poin untuk mendapatkan es teh manis gratis',
      pointsCost: 50,
      stock: -1, // unlimited
      category: 'minuman',
    },
    {
      name: 'Diskon Rp5.000',
      description: 'Tukar 100 poin untuk mendapatkan diskon Rp5.000',
      pointsCost: 100,
      stock: -1,
      category: 'diskon',
    },
    {
      name: 'Ayam Geprek Gratis',
      description: 'Tukar 300 poin untuk mendapatkan ayam geprek original gratis',
      pointsCost: 300,
      stock: 50,
      category: 'makanan',
    },
    {
      name: 'Diskon Rp10.000',
      description: 'Tukar 200 poin untuk mendapatkan diskon Rp10.000',
      pointsCost: 200,
      stock: -1,
      category: 'diskon',
    },
    {
      name: 'Paket Hemat Diskon 20%',
      description: 'Tukar 250 poin untuk mendapatkan diskon 20% paket hemat',
      pointsCost: 250,
      stock: -1,
      category: 'diskon',
    },
  ];

  for (const reward of rewardItems) {
    await prisma.rewardItem.create({
      data: reward,
    });
    console.log(`✅ Created reward: ${reward.name}`);
  }

  console.log('✅ Seed completed successfully!');
  console.log('   Admin accounts:');
  console.log('   - Username: admin, Password: 000000');
  console.log('   - Username: deaflud, Password: 000000');
  console.log('   Sample user accounts:');
  console.log('   - Username: user1, Password: 123456');
  console.log('   - Username: user2, Password: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
