import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shifts - List shifts for a cashier
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cashierId = searchParams.get('cashierId');

    if (!cashierId) {
      return NextResponse.json({ error: 'Cashier ID is required' }, { status: 400 });
    }

    const status = searchParams.get('status'); // 'OPEN', 'CLOSED', or null for all

    const where: any = { cashierId };
    if (status) {
      where.status = status;
    }

    const shifts = await db.shift.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

// POST /api/shifts - Open a new shift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cashierId, openingBalance } = body;

    if (!cashierId) {
      return NextResponse.json({ error: 'Cashier ID is required' }, { status: 400 });
    }

    if (openingBalance === undefined || openingBalance < 0) {
      return NextResponse.json({ error: 'Valid opening balance is required' }, { status: 400 });
    }

    // Check if cashier already has an open shift
    const existingOpenShift = await db.shift.findFirst({
      where: {
        cashierId,
        status: 'OPEN',
      },
    });

    if (existingOpenShift) {
      return NextResponse.json(
        {
          error: 'Anda sudah memiliki shift yang sedang berjalan',
          shift: existingOpenShift,
        },
        { status: 400 }
      );
    }

    // Generate shift number (e.g., SHF-2024-001)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Count shifts for this month
    const monthShifts = await db.shift.count({
      where: {
        createdAt: {
          gte: new Date(year, now.getMonth(), 1),
          lt: new Date(year, now.getMonth() + 1, 1),
        },
      },
    });

    const shiftNumber = `SHF-${year}-${month}-${String(monthShifts + 1).padStart(3, '0')}`;

    const shift = await db.shift.create({
      data: {
        shiftNumber,
        cashierId,
        openingBalance,
        cashReceived: 0,
        totalOrders: 0,
        totalSales: 0,
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
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}
