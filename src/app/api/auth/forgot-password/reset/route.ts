import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, newPassword } = body;

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: 'Username dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Update user password
    const updatedUser = await db.user.updateMany({
      where: {
        username: username,
      },
      data: {
        password: newPassword,
      },
    });

    if (updatedUser.count === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Password berhasil direset',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Gagal mereset password' },
      { status: 500 }
    );
  }
}
