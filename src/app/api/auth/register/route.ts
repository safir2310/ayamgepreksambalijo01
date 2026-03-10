import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, phone } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findFirst({
      where: {
        username: username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await db.user.create({
      data: {
        username: username,
        password: hashedPassword,
        name: name || username,
        phone: phone || null,
        email: `${username}@ayamgeprek.local`,
        points: 0,
      },
    });

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Registrasi gagal' },
      { status: 500 }
    );
  }
}
