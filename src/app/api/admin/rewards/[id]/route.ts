import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/rewards/[id] - Get reward by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reward = await db.rewardItem.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
        redemptions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error fetching reward:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/rewards/[id] - Update reward
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, image, pointsCost, stock, category, active } = body;

    // Check if reward exists
    const existingReward = await db.rewardItem.findUnique({
      where: { id: params.id },
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Update reward
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (pointsCost !== undefined) updateData.pointsCost = pointsCost;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;

    const reward = await db.rewardItem.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error updating reward:', error);
    return NextResponse.json(
      { error: 'Failed to update reward' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/rewards/[id] - Delete reward
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if reward exists
    const existingReward = await db.rewardItem.findUnique({
      where: { id: params.id },
    });

    if (!existingReward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    // Delete reward
    await db.rewardItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reward:', error);
    return NextResponse.json(
      { error: 'Failed to delete reward' },
      { status: 500 }
    );
  }
}
