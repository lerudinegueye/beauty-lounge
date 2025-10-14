import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { auth } from '../../../utils/auth';

export async function GET(request: Request) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await prisma.bookings.findMany({
      include: {
        menu_items: true, // Include related menu item details
        users: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        start_time: 'desc',
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
