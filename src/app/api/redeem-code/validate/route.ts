import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body;

    if (!code) {
      return NextResponse.json({ error: 'Kode redeem diperlukan' }, { status: 400 });
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

    // If userId provided, check if it belongs to that user
    if (userId && redeemCode.userId !== userId) {
      return NextResponse.json({ error: 'Kode redeem tidak dapat digunakan oleh user lain' }, { status: 403 });
    }

    // Return discount info
    return NextResponse.json({
      success: true,
      code: redeemCode.code,
      discountPercent: redeemCode.discountPercent,
      discountValue: redeemCode.discountValue,
      pointsUsed: redeemCode.pointsUsed,
    });

  } catch (error) {
    console.error('Error validating redeem code:', error);
    return NextResponse.json({ error: 'Gagal memvalidasi kode redeem' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Kode redeem diperlukan' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      discountPercent: redeemCode.discountPercent,
      discountValue: redeemCode.discountValue,
      expiresAt: redeemCode.expiresAt,
    });

  } catch (error) {
    console.error('Error getting redeem code info:', error);
    return NextResponse.json({ error: 'Gagal mengambil info kode redeem' }, { status: 500 });
  }
}
