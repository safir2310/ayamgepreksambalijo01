import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/admin/cashiers/[id] - Get cashier by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cashier = await db.user.findFirst({
      where: {
        id: params.id,
        role: 'cashier',
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!cashier) {
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cashier);
  } catch (error) {
    console.error('Error fetching cashier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cashier' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cashiers/[id] - Update cashier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { username, password, name, email, phone, avatar } = body;

    // Check if cashier exists
    const existingCashier = await db.user.findFirst({
      where: {
        id: params.id,
        role: 'cashier',
      },
    });

    if (!existingCashier) {
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    // Check if username already exists (if changed)
    if (username && username !== existingCashier.username) {
      const existingUsername = await db.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }
    }

    // Check if email already exists (if changed)
    if (email && email !== existingCashier.email) {
      const existingEmail = await db.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Check if phone already exists (if changed)
    if (phone && phone !== existingCashier.phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return NextResponse.json(
          { error: 'Phone number already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update cashier
    const cashier = await db.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(cashier);
  } catch (error) {
    console.error('Error updating cashier:', error);
    return NextResponse.json(
      { error: 'Failed to update cashier' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cashiers/[id] - Delete cashier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if cashier exists
    const existingCashier = await db.user.findFirst({
      where: {
        id: params.id,
        role: 'cashier',
      },
    });

    if (!existingCashier) {
      return NextResponse.json(
        { error: 'Cashier not found' },
        { status: 404 }
      );
    }

    // Delete cashier
    await db.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cashier:', error);
    return NextResponse.json(
      { error: 'Failed to delete cashier' },
      { status: 500 }
    );
  }
}
