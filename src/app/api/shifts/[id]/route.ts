import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/shifts/[id] - Get shift details with report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shift = await db.shift.findUnique({
      where: { id },
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

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
    }

    // Calculate payment method breakdown from orders
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

    // Group orders by payment method for the report
    const paymentBreakdown = {
      cash: cashPayments,
      card: cardPayments,
      ewallet: ewalletPayments,
      qris: qrisPayments,
      other: otherPayments,
    };

    return NextResponse.json({
      ...shift,
      paymentBreakdown,
    });
  } catch (error) {
    console.error('Error fetching shift:', error);
    return NextResponse.json({ error: 'Failed to fetch shift' }, { status: 500 });
  }
}
