import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/rewards - Get all active rewards
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Get active rewards
    const rewards = await db.rewardItem.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If userId is provided, check user's points
    let userPoints = 0;
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });
      if (user) {
        userPoints = user.points;
      }
    }

    return NextResponse.json({
      rewards,
      userPoints,
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

// POST /api/rewards/redeem - Redeem a reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rewardId, notes } = body;

    // Validate required fields
    if (!userId || !rewardId) {
      return NextResponse.json(
        { error: 'User ID and Reward ID are required' },
        { status: 400 }
      );
    }

    // Get user and reward
    const [user, reward] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
      }),
      db.rewardItem.findUnique({
        where: { id: rewardId },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    if (!reward.active) {
      return NextResponse.json(
        { error: 'Reward is not available' },
        { status: 400 }
      );
    }

    // Check if user has enough points
    if (user.points < reward.pointsCost) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Check stock (if not unlimited)
    if (reward.stock >= 0 && reward.stock === 0) {
      return NextResponse.json(
        { error: 'Reward is out of stock' },
        { status: 400 }
      );
    }

    // Generate a redeem code based on reward points (1 point = Rp 10 discount)
    const discountValue = reward.pointsCost * 10;
    const discountPercent = Math.min(50, Math.round((discountValue / 50000) * 100));

    // Generate random 8-character code (uppercase letters and numbers)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let redeemCode = generateCode();

    // Ensure code is unique
    let existingCode = await db.redeemCode.findUnique({
      where: { code: redeemCode }
    });
    let attempts = 0;
    while (existingCode && attempts < 10) {
      redeemCode = generateCode();
      existingCode = await db.redeemCode.findUnique({
        where: { code: redeemCode }
      });
      attempts++;
    }

    if (existingCode) {
      return NextResponse.json(
        { error: 'Gagal membuat kode redeem, silakan coba lagi' },
        { status: 500 }
      );
    }

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: reward.pointsCost,
          },
        },
      });

      // Decrease stock (if not unlimited)
      let updatedReward = reward;
      if (reward.stock >= 0) {
        updatedReward = await tx.rewardItem.update({
          where: { id: rewardId },
          data: {
            stock: {
              decrement: 1,
            },
          },
        });
      }

      // Create redemption record
      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          pointsUsed: reward.pointsCost,
          status: 'COMPLETED',
          notes,
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

      // Create point transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          type: 'REDEEMED',
          points: -reward.pointsCost,
          description: `Redeemed reward: ${reward.name}`,
        },
      });

      // Create redeem code for the user
      const createdRedeemCode = await tx.redeemCode.create({
        data: {
          code: redeemCode,
          userId,
          pointsUsed: reward.pointsCost,
          discountPercent,
          discountValue,
          expiresAt,
        }
      });

      return {
        user: updatedUser,
        reward: updatedReward,
        redemption,
        redeemCode: createdRedeemCode,
      };
    });

    return NextResponse.json({
      success: true,
      redemption: result.redemption,
      userPoints: result.user.points,
      redeemCode: {
        code: result.redeemCode.code,
        discountPercent: result.redeemCode.discountPercent,
        discountValue: result.redeemCode.discountValue,
        pointsUsed: result.redeemCode.pointsUsed,
        expiresAt: result.redeemCode.expiresAt.toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}
