import { db } from '@/lib/db';

async function seed() {
  console.log('🌱 Starting seed...');

  // Create categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: 'ayam-geprek' },
      update: {},
      create: {
        name: 'Ayam Geprek',
        slug: 'ayam-geprek',
        description: 'Ayam goreng crispy dengan sambal geprek',
        icon: '🍗',
        order: 1,
      },
    }),
    db.category.upsert({
      where: { slug: 'paket-hemat' },
      update: {},
      create: {
        name: 'Paket Hemat',
        slug: 'paket-hemat',
        description: 'Paket makan lengkap dengan harga terjangkau',
        icon: '🍱',
        order: 2,
      },
    }),
    db.category.upsert({
      where: { slug: 'minuman' },
      update: {},
      create: {
        name: 'Minuman',
        slug: 'minuman',
        description: 'Berbagai pilihan minuman segar',
        icon: '🥤',
        order: 3,
      },
    }),
    db.category.upsert({
      where: { slug: 'sambal-level' },
      update: {},
      create: {
        name: 'Sambal Level',
        slug: 'sambal-level',
        description: 'Pilihan level kepedasan sambal',
        icon: '🌶️',
        order: 4,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Get category IDs
  const ayamGeprekCategory = categories.find(c => c.slug === 'ayam-geprek')!;
  const paketHematCategory = categories.find(c => c.slug === 'paket-hemat')!;
  const minumanCategory = categories.find(c => c.slug === 'minuman')!;

  // Create menu items
  const menuItems = await Promise.all([
    // Ayam Geprek
    db.menuItem.upsert({
      where: { slug: 'ayam-geprek-original' },
      update: {},
      create: {
        name: 'Ayam Geprek Original',
        slug: 'ayam-geprek-original',
        description: 'Ayam goreng crispy dengan sambal geprek original',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a72c7e5f2d?w=400&h=300&fit=crop',
        price: 18000,
        categoryId: ayamGeprekCategory.id,
        category: 'Ayam Geprek',
        spicyLevel: 3,
        isPopular: true,
        available: true,
        rating: 4.5,
        reviewCount: 128,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'ayam-geprek-mozzarella' },
      update: {},
      create: {
        name: 'Ayam Geprek Mozzarella',
        slug: 'ayam-geprek-mozzarella',
        description: 'Ayam geprek dengan topping keju mozzarella lumer',
        image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400&h=300&fit=crop',
        price: 25000,
        categoryId: ayamGeprekCategory.id,
        category: 'Ayam Geprek',
        spicyLevel: 2,
        isPopular: true,
        available: true,
        rating: 4.8,
        reviewCount: 96,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'ayam-geprek-level-10' },
      update: {},
      create: {
        name: 'Ayam Geprek Level 10',
        slug: 'ayam-geprek-level-10',
        description: 'Ayam geprek dengan sambal super pedas level 10',
        image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop',
        price: 20000,
        categoryId: ayamGeprekCategory.id,
        category: 'Ayam Geprek',
        spicyLevel: 10,
        isPopular: true,
        available: true,
        rating: 4.3,
        reviewCount: 72,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'ayam-geprek-keju' },
      update: {},
      create: {
        name: 'Ayam Geprek Keju',
        slug: 'ayam-geprek-keju',
        description: 'Ayam geprek dengan taburan keju melimpah',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
        price: 22000,
        categoryId: ayamGeprekCategory.id,
        category: 'Ayam Geprek',
        spicyLevel: 3,
        isPopular: false,
        available: true,
        rating: 4.4,
        reviewCount: 85,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'ayam-geprek-sambal-matah' },
      update: {},
      create: {
        name: 'Ayam Geprek Sambal Matah',
        slug: 'ayam-geprek-sambal-matah',
        description: 'Ayam geprek dengan sambal matah khas Bali',
        image: 'https://images.unsplash.com/photo-1585703900468-13c7a978ad86?w=400&h=300&fit=crop',
        price: 21000,
        categoryId: ayamGeprekCategory.id,
        category: 'Ayam Geprek',
        spicyLevel: 4,
        isPopular: false,
        available: true,
        rating: 4.6,
        reviewCount: 64,
      },
    }),

    // Paket Hemat
    db.menuItem.upsert({
      where: { slug: 'paket-ayam-nasi-atau-minum' },
      update: {},
      create: {
        name: 'Paket Ayam + Nasi + Es Teh',
        slug: 'paket-ayam-nasi-atau-minum',
        description: '1 Ayam Geprek + Nasi + Es Teh Manis',
        image: 'https://images.unsplash.com/photo-1594222685396-56e0c9b06e9b?w=400&h=300&fit=crop',
        price: 25000,
        categoryId: paketHematCategory.id,
        category: 'Paket Hemat',
        spicyLevel: 0,
        isPopular: true,
        available: true,
        rating: 4.7,
        reviewCount: 156,
      },
    }),

    // Minuman
    db.menuItem.upsert({
      where: { slug: 'es-teh-manis' },
      update: {},
      create: {
        name: 'Es Teh Manis',
        slug: 'es-teh-manis',
        description: 'Es teh manis segar',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        price: 5000,
        categoryId: minumanCategory.id,
        category: 'Minuman',
        spicyLevel: 0,
        isPopular: false,
        available: true,
        rating: 4.2,
        reviewCount: 89,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'es-jeruk' },
      update: {},
      create: {
        name: 'Es Jeruk',
        slug: 'es-jeruk',
        description: 'Es jeruk segar',
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop',
        price: 6000,
        categoryId: minumanCategory.id,
        category: 'Minuman',
        spicyLevel: 0,
        isPopular: false,
        available: true,
        rating: 4.3,
        reviewCount: 67,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'teh-tarik' },
      update: {},
      create: {
        name: 'Teh Tarik',
        slug: 'teh-tarik',
        description: 'Teh tarik creamy',
        image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop',
        price: 8000,
        categoryId: minumanCategory.id,
        category: 'Minuman',
        spicyLevel: 0,
        isPopular: false,
        available: true,
        rating: 4.5,
        reviewCount: 78,
      },
    }),
    db.menuItem.upsert({
      where: { slug: 'thai-tea' },
      update: {},
      create: {
        name: 'Thai Tea',
        slug: 'thai-tea',
        description: 'Thai tea dengan susu',
        image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=400&h=300&fit=crop',
        price: 10000,
        categoryId: minumanCategory.id,
        category: 'Minuman',
        spicyLevel: 0,
        isPopular: false,
        available: true,
        rating: 4.6,
        reviewCount: 92,
      },
    }),
  ]);

  console.log(`✅ Created ${menuItems.length} menu items`);

  // Create a promo
  const promo = await db.promo.upsert({
    where: { code: 'HEMAT20' },
    update: {},
    create: {
      code: 'HEMAT20',
      name: 'Diskon 20%',
      description: 'Dapatkan diskon 20% untuk semua menu',
      type: 'PERCENTAGE',
      value: 20,
      minOrder: 50000,
      maxDiscount: 20000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      active: true,
    },
  });

  console.log(`✅ Created promo: ${promo.code}`);

  console.log('🎉 Seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
