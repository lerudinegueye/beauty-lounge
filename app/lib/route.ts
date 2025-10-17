import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  // In a real app, you'd also check if session.user.isAdmin
  if (!session?.isLoggedIn || !session.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const bookingId = parseInt(params.id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    const updatedBooking = await prisma.bookings.update({
      where: { id: bookingId },
      data: { status: status },
    });

    // Here you could also trigger a confirmation email to the user

    return NextResponse.json(updatedBooking, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating booking ${bookingId}:`, error);

    // Handle case where booking is not found by Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'An error occurred while updating the booking status.' }, { status: 500 });
  }
}