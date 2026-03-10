import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/menu/[id] - Get single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menuItem = await db.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil menu' },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, category, image, spicyLevel, isPopular, available } = body;

    // Find the existing item to get the categoryId
    const existingItem = await db.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    // Handle category update
    let updateData: any = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(image !== undefined && { image }),
      ...(spicyLevel !== undefined && { spicyLevel }),
      ...(isPopular !== undefined && { isPopular }),
      ...(available !== undefined && { available }),
    };

    // If category is being updated, handle categoryId
    if (category !== undefined && category !== existingItem.category) {
      // Try to find existing category by name
      const existingCategory = await db.category.findFirst({
        where: { name: category },
      });

      if (existingCategory) {
        updateData.categoryId = existingCategory.id;
      } else {
        // Create new category
        const categorySlug = generateSlug(category);
        const newCategory = await db.category.create({
          data: {
            name: category,
            slug: categorySlug,
          },
        });
        updateData.categoryId = newCategory.id;
      }

      updateData.category = category;

      // Update slug if name is also being updated
      if (name) {
        const newSlug = generateSlug(name);
        // Check if slug already exists (excluding current item)
        const existingSlug = await db.menuItem.findFirst({
          where: {
            slug: newSlug,
            id: { not: id },
          },
        });

        if (!existingSlug) {
          updateData.slug = newSlug;
        }
      }
    } else if (name && name !== existingItem.name) {
      // Update slug if name changed but category didn't
      const newSlug = generateSlug(name);
      const existingSlug = await db.menuItem.findFirst({
        where: {
          slug: newSlug,
          id: { not: id },
        },
      });

      if (!existingSlug) {
        updateData.slug = newSlug;
      }
    }

    // Update menu item
    const updatedItem = await db.menuItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Menu berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus menu' },
      { status: 500 }
    );
  }
}
