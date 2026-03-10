import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
    const user = await db.user.findFirst({
      where: {
        username: username,
      },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login gagal' },
      { status: 500 }
    );
  }
}
