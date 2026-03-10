import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            menuItems: {
              where: { available: true },
            },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, icon, order } = body;

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        order: order ?? 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
