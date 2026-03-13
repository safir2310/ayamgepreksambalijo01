import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      items,
      notes,
      address,
      paymentMethod,
      paymentStatus = 'PAID',
      subtotal,
      deliveryFee,
      discount,
      total,
    } = body;

    // Generate order number
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;

    // Find active shift for this cashier (if userId is a cashier)
    let activeShift: any = null;
    let shiftId: string | null = null;

    if (userId) {
      activeShift = await db.shift.findFirst({
        where: {
          cashierId: userId,
          status: 'OPEN',
        },
      });

      if (activeShift) {
        shiftId = activeShift.id;
      }
    }

    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        shiftId,
        status: 'PENDING',
        paymentMethod,
        paymentStatus,
        subtotal,
        deliveryFee: deliveryFee ?? 0,
        discount: discount ?? 0,
        total,
        notes,
        address,
        estimatedTime: 30,
        items: {
          create: items.map((item: any) => ({
            menuId: item.menuId,
            quantity: item.quantity,
            price: item.price,
            options: item.options ? JSON.stringify(item.options) : null,
            notes: item.notes,
          })),
        },
      },
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
