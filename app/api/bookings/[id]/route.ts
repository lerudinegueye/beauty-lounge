import { NextResponse } from 'next/server';
import { createDatabaseConnection } from '@/app/lib/database';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const bookingId = parseInt(id, 10);
  if (Number.isNaN(bookingId)) {
    return NextResponse.json({ message: 'Invalid booking id' }, { status: 400 });
  }

  let conn: any;
  try {
    conn = await createDatabaseConnection();
    const [rows]: any = await conn.execute(
      'SELECT id, payment_confirmation, status FROM bookings WHERE id = ? LIMIT 1',
      [bookingId]
    );
    await conn.end();

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    const r = rows[0];
    return NextResponse.json({
      id: r.id,
      payment_confirmation: r.payment_confirmation ?? null,
      status: r.status ?? null,
    }, { status: 200 });
  } catch (error) {
    try { if (conn) await conn.end(); } catch {}
    console.error('Error fetching booking status:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
