import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Calculate points earned from order total
function calculatePoints(orderTotal: number): number {
  // 1 point per Rp 1.000
  return Math.floor(orderTotal / 1000);
}

// GET /api/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    // Get the current order to check if status is changing to COMPLETED
    const currentOrder = await db.order.findUnique({
      where: { id },
      select: { status: true, userId: true, total: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Award points when order is completed and has a user
    if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED' && currentOrder.userId) {
      const pointsEarned = calculatePoints(order.total);

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
            orderId: order.id,
            type: 'EARNED',
            points: pointsEarned,
            description: `Point dari pesanan ${order.orderNumber}`,
          },
        });
      }
    }

    return NextResponse.json({
      ...order,
      pointsEarned: status === 'COMPLETED' && currentOrder.status !== 'COMPLETED' ? calculatePoints(order.total) : 0,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
