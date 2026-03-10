import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: ' startDate dan endDate diperlukan' },
        { status: 400 }
      );
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    // Get all completed orders within the date range
    const orders = await db.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date and calculate totals
    const dailyData: { [key: string]: any } = {};

    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const paymentMethod = (order.paymentMethod || '').toLowerCase();

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalOrders: 0,
          totalRevenue: 0,
          cashPayments: 0,
          cardPayments: 0,
          ewalletPayments: 0,
          qrisPayments: 0,
        };
      }

      dailyData[dateKey].totalOrders += 1;
      dailyData[dateKey].totalRevenue += order.total;

      // Categorize payments by method
      if (paymentMethod.includes('cash') || paymentMethod.includes('tunai')) {
        dailyData[dateKey].cashPayments += order.total;
      } else if (paymentMethod.includes('kartu') || paymentMethod.includes('debit') || paymentMethod.includes('card')) {
        dailyData[dateKey].cardPayments += order.total;
      } else if (paymentMethod.includes('qris')) {
        dailyData[dateKey].qrisPayments += order.total;
      } else if (paymentMethod.includes('ewallet') || paymentMethod.includes('gopay') || paymentMethod.includes('ovo') || paymentMethod.includes('dana') || paymentMethod.includes('shopee')) {
        dailyData[dateKey].ewalletPayments += order.total;
      }
    });

    // Convert to array and calculate average order value
    const result = Object.values(dailyData).map((item: any) => ({
      ...item,
      avgOrderValue: item.totalOrders > 0 ? item.totalRevenue / item.totalOrders : 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching financial report:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil laporan keuangan' },
      { status: 500 }
    );
  }
}
