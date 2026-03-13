import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/redemptions/[id] - Get redemption by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const redemption = await db.rewardRedemption.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            phone: true,
            avatar: true,
            points: true,
          },
        },
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            pointsCost: true,
            category: true,
          },
        },
      },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: 'Redemption not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(redemption);
  } catch (error) {
    console.error('Error fetching redemption:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemption' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/redemptions/[id] - Update redemption status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if redemption exists
    const existingRedemption = await db.rewardRedemption.findUnique({
      where: { id },
    });

    if (!existingRedemption) {
      return NextResponse.json(
        { error: 'Redemption not found' },
        { status: 404 }
      );
    }

    // If rejecting, refund points
    if (status === 'REJECTED' && existingRedemption.status !== 'REJECTED') {
      await db.$transaction(async (tx) => {
        // Refund points to user
        await tx.user.update({
          where: { id: existingRedemption.userId },
          data: {
            points: {
              increment: existingRedemption.pointsUsed,
            },
          },
        });

        // Create point transaction
        await tx.pointTransaction.create({
          data: {
            userId: existingRedemption.userId,
            type: 'ADJUSTED',
            points: existingRedemption.pointsUsed,
            description: `Refund for rejected redemption: ${existingRedemption.rewardId}`,
          },
        });
      });
    }

    // Update redemption
    const redemption = await db.rewardRedemption.update({
      where: { id },
      data: {
        status,
        notes,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            phone: true,
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
    });

    return NextResponse.json(redemption);
  } catch (error) {
    console.error('Error updating redemption:', error);
    return NextResponse.json(
      { error: 'Failed to update redemption' },
      { status: 500 }
    );
  }
}
