import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, phone } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });

    return NextResponse.json({
      message: 'Profile berhasil diperbarui',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil profile' },
      { status: 500 }
    );
  }
}
