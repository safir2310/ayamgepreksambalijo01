import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/shifts/[id]/close - Close a shift
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { closingBalance, notes } = body;

    // Get the shift
    const shift = await db.shift.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Check if shift is already closed
    if (shift.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Shift sudah ditutup' },
        { status: 400 }
      );
    }

    // Calculate payment method breakdown
    let cashPayments = 0;
    let cardPayments = 0;
    let ewalletPayments = 0;
    let qrisPayments = 0;
    let otherPayments = 0;

    shift.orders.forEach((order: any) => {
      const paymentMethod = order.paymentMethod?.toUpperCase() || '';
      if (paymentMethod === 'CASH' || paymentMethod === 'TUNAI') {
        cashPayments += order.total;
      } else if (paymentMethod.includes('KARTU') || paymentMethod.includes('DEBIT') || paymentMethod.includes('CREDIT CARD')) {
        cardPayments += order.total;
      } else if (paymentMethod.includes('E-WALLET') || paymentMethod.includes('GOPAY') || paymentMethod.includes('OVO') || paymentMethod.includes('DANA') || paymentMethod.includes('LINKAJA') || paymentMethod.includes('SHOPEEPAY')) {
        ewalletPayments += order.total;
      } else if (paymentMethod.includes('QRIS')) {
        qrisPayments += order.total;
      } else {
        otherPayments += order.total;
      }
    });

    // Calculate expected cash (only from sales, no opening balance)
    const expectedCash = cashPayments;
    const cashDifference = (closingBalance || 0) - expectedCash;

    // Close the shift
    const closedShift = await db.shift.update({
      where: { id },
      data: {
        status: 'CLOSED',
        endTime: new Date(),
        closingBalance: closingBalance || 0,
        cashReceived: cashPayments,
        expectedCash,
        cashDifference,
        totalOrders: shift.orders.length,
        totalSales: shift.orders.reduce((sum: number, order: any) => sum + order.total, 0),
        cardPayments,
        ewalletPayments,
        qrisPayments,
        notes: notes || shift.notes,
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
          include: {
            items: {
              include: {
                menu: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(closedShift);
  } catch (error) {
    console.error('Error closing shift:', error);
    return NextResponse.json({ error: 'Failed to close shift' }, { status: 500 });
  }
}
