import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/redemptions - Get all redemptions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const redemptions = await db.rewardRedemption.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            phone: true,
            avatar: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            pointsCost: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}
