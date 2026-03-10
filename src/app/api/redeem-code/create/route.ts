import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pointsToRedeem } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    if (!pointsToRedeem || pointsToRedeem < 200) {
      return NextResponse.json({ error: 'Minimum poin untuk ditukar adalah 200' }, { status: 400 });
    }

    // Get user current points
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true, name: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.points < pointsToRedeem) {
      return NextResponse.json({ error: 'Poin tidak mencukupi' }, { status: 400 });
    }

    // Calculate discount (1 point = Rp 10 discount)
    const discountValue = pointsToRedeem * 10;
    const discountPercent = Math.min(50, Math.round((discountValue / 50000) * 100)); // Max 50% discount, based on Rp50,000

    // Generate random 8-character code (uppercase letters and numbers)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code = generateCode();

    // Ensure code is unique
    let existingCode = await db.redeemCode.findUnique({
      where: { code }
    });
    let attempts = 0;
    while (existingCode && attempts < 10) {
      code = generateCode();
      existingCode = await db.redeemCode.findUnique({
        where: { code }
      });
      attempts++;
    }

    if (existingCode) {
      return NextResponse.json({ error: 'Gagal membuat kode redeem, silakan coba lagi' }, { status: 500 });
    }

    // Calculate expiry date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create redeem code
    const redeemCode = await db.redeemCode.create({
      data: {
        code,
        userId,
        pointsUsed: pointsToRedeem,
        discountPercent,
        discountValue,
        expiresAt,
      }
    });

    // Deduct points from user
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: pointsToRedeem
        }
      }
    });

    // Create point transaction record
    await db.pointTransaction.create({
      data: {
        userId,
        type: 'REDEEMED',
        points: -pointsToRedeem,
        description: `Tukar poin menjadi kode redeem: ${code}`,
      }
    });

    return NextResponse.json({
      success: true,
      code: redeemCode.code,
      discountPercent: redeemCode.discountPercent,
      discountValue: redeemCode.discountValue,
      pointsUsed: redeemCode.pointsUsed,
      expiresAt: redeemCode.expiresAt
    });

  } catch (error) {
    console.error('Error creating redeem code:', error);
    return NextResponse.json({ error: 'Gagal membuat kode redeem' }, { status: 500 });
  }
}
