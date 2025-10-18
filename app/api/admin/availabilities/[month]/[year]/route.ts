import { NextResponse } from 'next/server';
import { auth } from '../../../../../utils/auth';
import { createDatabaseConnection } from '../../../../../lib/database';

export async function GET(
  request: Request,
  { params }: { params: { month: string; year: string } }
) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before destructuring, as suggested by Next.js error message
    const { month, year } = await params;

    console.log(`GET /api/admin/availabilities/${month}/${year} - Received month: ${month}, year: ${year}`);

    if (!month || !year) {
      console.log('Month or year is missing.');
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    console.log(`GET /api/admin/availabilities/${month}/${year} - Parsed month: ${parsedMonth}, parsed year: ${parsedYear}`);

    const conn = await createDatabaseConnection();
    const [rows]: any = await conn.execute(
      `SELECT id, month, year, availableDays, availableHours, created_at, updated_at
       FROM admin_availabilities WHERE month = ? AND year = ? LIMIT 1`,
      [parsedMonth, parsedYear]
    );
    await conn.end();
    const availability = rows?.[0];

    console.log(`GET /api/admin/availabilities/${month}/${year} - Prisma query result:`, availability);

    if (!availability) {
      console.log('Availability not found in DB.');
      return NextResponse.json({ message: 'Availability not found' }, { status: 404 });
    }

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { month: string; year: string } }
) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before destructuring, as suggested by Next.js error message
    const { month, year } = await params;

    if (!month || !year) {
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    await conn.execute(
      `DELETE FROM admin_availabilities WHERE month = ? AND year = ?`,
      [parseInt(month, 10), parseInt(year, 10)]
    );
    await conn.end();

    return NextResponse.json({ message: 'Availability deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { month: string; year: string } }
) {
  try {
    const authenticatedUser = await auth();

    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params before destructuring, as suggested by Next.js error message
    const { month, year } = await params;
    const body = await request.json();
    const { availableDays, availableHours } = body;

    if (!month || !year) {
      return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
    }

    if (!availableDays || !availableHours) {
      return NextResponse.json({ message: 'Available days and hours are required' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    await conn.execute(
      `UPDATE admin_availabilities
       SET availableDays = ?, availableHours = ?, updated_at = CURRENT_TIMESTAMP
       WHERE month = ? AND year = ?`,
      [availableDays, availableHours, parseInt(month, 10), parseInt(year, 10)]
    );
    const [rows]: any = await conn.execute(
      `SELECT id, month, year, availableDays, availableHours, created_at, updated_at
       FROM admin_availabilities WHERE month = ? AND year = ? LIMIT 1`,
      [parseInt(month, 10), parseInt(year, 10)]
    );
    await conn.end();
    const updatedAvailability = rows?.[0] || null;

    return NextResponse.json({ message: 'Availability updated successfully', availability: updatedAvailability }, { status: 200 });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
