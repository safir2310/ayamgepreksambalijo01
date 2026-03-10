import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, orderId } = body;

    if (!code) {
      return NextResponse.json({ error: 'Kode redeem diperlukan' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    // Find the redeem code
    const redeemCode = await db.redeemCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!redeemCode) {
      return NextResponse.json({ error: 'Kode redeem tidak valid' }, { status: 404 });
    }

    // Check if code is expired
    if (new Date() > redeemCode.expiresAt) {
      return NextResponse.json({ error: 'Kode redeem sudah kadaluarsa' }, { status: 400 });
    }

    // Check if code is already used
    if (redeemCode.isUsed) {
      return NextResponse.json({ error: 'Kode redeem sudah digunakan' }, { status: 400 });
    }

    // Check if code belongs to the user
    if (redeemCode.userId !== userId) {
      return NextResponse.json({ error: 'Kode redeem tidak dapat digunakan oleh user lain' }, { status: 403 });
    }

    // Mark code as used
    const updatedCode = await db.redeemCode.update({
      where: { id: redeemCode.id },
      data: {
        isUsed: true,
        usedAt: new Date()
      }
    });

    // If orderId provided, update order with redeem code
    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: {
          redeemCodeId: redeemCode.id,
          discount: redeemCode.discountValue,
        }
      });
    }

    return NextResponse.json({
      success: true,
      id: updatedCode.id,
      code: updatedCode.code,
      discountPercent: updatedCode.discountPercent,
      discountValue: updatedCode.discountValue,
    });

  } catch (error) {
    console.error('Error using redeem code:', error);
    return NextResponse.json({ error: 'Gagal menggunakan kode redeem' }, { status: 500 });
  }
}
