import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Calculate points earned from order total
function calculatePoints(orderTotal: number): number {
  // 1 point per Rp 1.000
  return Math.floor(orderTotal / 1000);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status diperlukan' },
        { status: 400 }
      );
    }

    // Get the current order to check if status is changing to COMPLETED
    const currentOrder = await db.order.findUnique({
      where: { id },
      select: { status: true, userId: true, total: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
        ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            points: true,
          },
        },
        items: {
          include: {
            menu: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Award points when order is completed and has a user
    if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED' && currentOrder.userId) {
      const pointsEarned = calculatePoints(updatedOrder.total);

      if (pointsEarned > 0) {
        // Update user's points
        await db.user.update({
          where: { id: currentOrder.userId },
          data: {
            points: {
              increment: pointsEarned,
            },
          },
        });

        // Create point transaction record
        await db.pointTransaction.create({
          data: {
            userId: currentOrder.userId,
            orderId: updatedOrder.id,
            type: 'EARNED',
            points: pointsEarned,
            description: `Point dari pesanan ${updatedOrder.orderNumber}`,
          },
        });

        // If order has a redeem code, mark it as used
        if (updatedOrder.redeemCodeId) {
          const redeemCode = await db.redeemCode.findUnique({
            where: { id: updatedOrder.redeemCodeId }
          });

          if (redeemCode && !redeemCode.isUsed) {
            await db.redeemCode.update({
              where: { id: redeemCode.id },
              data: { isUsed: true, usedAt: new Date() }
            });

            // Create point transaction for redeem code usage
            await db.pointTransaction.create({
              data: {
                userId: currentOrder.userId,
                orderId: updatedOrder.id,
                type: 'REDEEMED',
                points: -redeemCode.pointsUsed,
                description: `Menggunakan kode redeem: ${redeemCode.code} untuk pesanan ${updatedOrder.orderNumber}`
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Status pesanan berhasil diperbarui',
      order: updatedOrder,
      pointsEarned: status === 'COMPLETED' && currentOrder.status !== 'COMPLETED' ? calculatePoints(updatedOrder.total) : 0,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui pesanan' },
      { status: 500 }
    );
  }
}
