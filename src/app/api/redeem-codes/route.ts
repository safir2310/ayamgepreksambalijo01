import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    // Get redeem codes for the user
    const redeemCodes = await db.redeemCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to last 20 codes
    });

    // Format the response
    const formattedCodes = redeemCodes.map(rc => ({
      code: rc.code,
      discountPercent: rc.discountPercent,
      discountValue: rc.discountValue,
      pointsUsed: rc.pointsUsed,
      expiresAt: rc.expiresAt.toISOString(),
      isUsed: rc.isUsed,
      usedAt: rc.usedAt?.toISOString(),
    }));

    return NextResponse.json(formattedCodes);

  } catch (error) {
    console.error('Error fetching redeem codes:', error);
    return NextResponse.json({ error: 'Gagal mengambil kode redeem' }, { status: 500 });
  }
}
