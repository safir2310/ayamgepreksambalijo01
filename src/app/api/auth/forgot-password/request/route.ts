import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email } = body;

    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username dan email wajib diisi' },
        { status: 400 }
      );
    }

    // Find user by username and email
    const user = await db.user.findFirst({
      where: {
        username: username,
        email: email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Username dan email tidak cocok' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Akun ditemukan',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Error in forgot password request:', error);
    return NextResponse.json(
      { error: 'Gagal memproses permintaan' },
      { status: 500 }
    );
  }
}
