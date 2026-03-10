import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID diperlukan' }, { status: 400 });
    }

    // Get point transactions for the user
    const transactions = await db.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 transactions
    });

    // Format the response
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type,
      description: t.description,
      points: t.points,
      date: t.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedTransactions);

  } catch (error) {
    console.error('Error fetching point transactions:', error);
    return NextResponse.json({ error: 'Gagal mengambil riwayat transaksi poin' }, { status: 500 });
  }
}
