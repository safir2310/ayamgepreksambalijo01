import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/menu - Get all menu items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const popular = searchParams.get('popular');
    const available = searchParams.get('available');

    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (popular === 'true') {
      where.isPopular = true;
    }

    if (available === 'true') {
      where.available = true;
    }

    const menuItems = await db.menuItem.findMany({
      where,
      include: {
        categoryRel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/menu - Create a new menu item (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      image,
      price,
      category,
      categoryId,
      available,
      spicyLevel,
      isPopular,
    } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    // Handle category - create or find existing
    let finalCategoryId = categoryId;
    if (!finalCategoryId && category) {
      // Try to find existing category by name
      const existingCategory = await db.category.findFirst({
        where: { name: category },
      });

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        // Create new category
        const categorySlug = generateSlug(category);
        const newCategory = await db.category.create({
          data: {
            name: category,
            slug: categorySlug,
          },
        });
        finalCategoryId = newCategory.id;
      }
    }

    if (!finalCategoryId) {
      return NextResponse.json(
        { error: 'Category or categoryId is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check if slug already exists
    const existingSlug = await db.menuItem.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Menu item with this name already exists' },
        { status: 400 }
      );
    }

    const menuItem = await db.menuItem.create({
      data: {
        name,
        slug: finalSlug,
        description,
        image,
        price,
        categoryId: finalCategoryId,
        category: category || 'Uncategorized',
        available: available ?? true,
        spicyLevel: spicyLevel ?? 0,
        isPopular: isPopular ?? false,
      },
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
