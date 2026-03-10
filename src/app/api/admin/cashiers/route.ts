import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/admin/cashiers - Get all cashiers
export async function GET(request: NextRequest) {
  try {
    const cashiers = await db.user.findMany({
      where: {
        role: 'cashier',
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        points: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cashiers);
  } catch (error) {
    console.error('Error fetching cashiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cashiers' },
      { status: 500 }
    );
  }
}

// POST /api/admin/cashiers - Create a new cashier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email, phone, avatar } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
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

    // Check if phone already exists (if provided)
    if (phone) {
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create cashier
    const cashier = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || username,
        email,
        phone,
        avatar,
        role: 'cashier',
        points: 0,
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

    return NextResponse.json(cashier, { status: 201 });
  } catch (error) {
    console.error('Error creating cashier:', error);
    return NextResponse.json(
      { error: 'Failed to create cashier' },
      { status: 500 }
    );
  }
}
