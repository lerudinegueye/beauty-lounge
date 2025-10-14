import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { auth } from '../../../../utils/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    await prisma.bookings.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      menu_item_id,
      start_time,
      end_time,
      user_id,
      customer_first_name,
      customer_last_name,
      customer_email,
      customer_phone,
    } = body;

    if (!id) {
      return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id: parseInt(id) },
      data: {
        menu_item_id,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        user_id: user_id ? parseInt(user_id) : null,
        customer_first_name,
        customer_last_name,
        customer_email,
        customer_phone,
      },
    });

    return NextResponse.json({ message: 'Booking updated successfully', booking: updatedBooking }, { status: 200 });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
