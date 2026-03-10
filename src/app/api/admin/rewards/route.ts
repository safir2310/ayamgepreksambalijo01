import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/rewards - Get all rewards (including inactive)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');

    const where: any = {};
    if (active === 'true') {
      where.active = true;
    } else if (active === 'false') {
      where.active = false;
    }

    const rewards = await db.rewardItem.findMany({
      where,
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

// POST /api/admin/rewards - Create a new reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, pointsCost, stock, category, active } = body;

    // Validate required fields
    if (!name || !pointsCost) {
      return NextResponse.json(
        { error: 'Name and points cost are required' },
        { status: 400 }
      );
    }

    // Create reward
    const reward = await db.rewardItem.create({
      data: {
        name,
        description,
        image,
        pointsCost,
        stock: stock ?? 0,
        category: category ?? 'general',
        active: active ?? true,
      },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}
