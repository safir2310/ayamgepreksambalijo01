import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get today's date start and end
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Total orders
    const totalOrders = await db.order.count();

    // Today's orders
    const todayOrders = await db.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    });

    // Total revenue
    const completedOrders = await db.order.findMany({
      where: {
        status: 'COMPLETED',
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

    // Today's revenue
    const todayRevenue = completedOrders
      .filter(order => order.createdAt >= todayStart && order.createdAt < todayEnd)
      .reduce((sum, order) => sum + order.total, 0);

    // Orders by status
    const pendingOrders = await db.order.count({ where: { status: 'PENDING' } });
    const processingOrders = await db.order.count({ where: { status: 'PROCESSING' } });
    const completedOrdersCount = await db.order.count({ where: { status: 'COMPLETED' } });
    const cancelledOrders = await db.order.count({ where: { status: 'CANCELLED' } });

    // Total users
    const totalUsers = await db.user.count();

    return NextResponse.json({
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      pendingOrders,
      processingOrders,
      completedOrders: completedOrdersCount,
      cancelledOrders,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil statistik' },
      { status: 500 }
    );
  }
}
