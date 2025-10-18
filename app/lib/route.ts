import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { createDatabaseConnection } from '@/app/lib/database';

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

    const conn = await createDatabaseConnection();
    await conn.execute(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, bookingId]
    );
    const [rows]: any = await conn.execute(
      `SELECT id, menu_item_id, start_time, end_time, user_id, customer_first_name, customer_last_name,
              customer_email, customer_phone, payment_confirmation, payment_method, payment_status,
              created_at, status
       FROM bookings WHERE id = ? LIMIT 1`,
      [bookingId]
    );
    await conn.end();
    const updatedBooking = rows?.[0] || null;
    return NextResponse.json(updatedBooking, { status: 200 });

  } catch (error: any) {
    console.error(`Error updating booking ${bookingId}:`, error);

    // If nothing updated, it may be missing
    // Note: mysql2 doesn't throw Prisma codes; optional: detect affectedRows

    return NextResponse.json({ message: 'An error occurred while updating the booking status.' }, { status: 500 });
  }
}