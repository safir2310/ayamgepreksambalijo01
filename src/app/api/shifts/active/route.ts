import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shifts/active - Get active shift for cashier
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cashierId = searchParams.get('cashierId');

    if (!cashierId) {
      return NextResponse.json({ error: 'Cashier ID is required' }, { status: 400 });
    }

    const shift = await db.shift.findFirst({
      where: {
        cashierId,
        status: 'OPEN',
      },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            paymentMethod: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shift) {
      return NextResponse.json({ shift: null }, { status: 200 });
    }

    return NextResponse.json({ shift });
  } catch (error) {
    console.error('Error fetching active shift:', error);
    return NextResponse.json({ error: 'Failed to fetch active shift' }, { status: 500 });
  }
}
