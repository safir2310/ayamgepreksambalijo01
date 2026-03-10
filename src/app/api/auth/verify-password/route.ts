import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/auth/verify-password - Verify cashier password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify password using bcrypt (same as login route)
    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Gagal verifikasi password' },
      { status: 500 }
    );
  }
}
