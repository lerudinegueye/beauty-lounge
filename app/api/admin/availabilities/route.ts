import { NextResponse } from 'next/server';
import { auth } from '../../../utils/auth';
import { createDatabaseConnection } from '../../../lib/database';

export async function POST(request: Request) {
  // Implement admin authentication/authorization here
  // For example, check if the user is authenticated and has an 'admin' role
  const currentUser = await auth(); // Placeholder for getting current user/session
  console.log('Admin Availabilities POST: currentUser:', currentUser);
  console.log('Admin Availabilities POST: currentUser.isAdmin:', currentUser?.isAdmin);
  if (!currentUser || !currentUser.isAdmin) { // Assuming currentUser has an isAdmin property
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { month, year, availableDays, availableHours } = await request.json();
    console.log('Admin Availabilities POST: Received data:', { month, year, availableDays, availableHours });

    if (!month || !year || !availableDays || !availableHours) {
      console.error('Admin Availabilities POST: Missing required fields');
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    try {
      // Upsert using unique(month,year)
      await conn.execute(
        `INSERT INTO admin_availabilities (month, year, availableDays, availableHours)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE availableDays = VALUES(availableDays), availableHours = VALUES(availableHours), updated_at = CURRENT_TIMESTAMP`
      , [month, year, availableDays, availableHours]);

      const [rows]: any = await conn.execute(
        `SELECT id, month, year, availableDays, availableHours, created_at, updated_at
         FROM admin_availabilities
         WHERE month = ? AND year = ?
         LIMIT 1`,
        [month, year]
      );
      await conn.end();
      const rec = rows?.[0];
      console.log('Admin Availabilities POST: Upsert successful, result:', rec);
      return NextResponse.json(rec, { status: 200 });
    } catch (e: any) {
      try { await (await createDatabaseConnection()).end(); } catch {}
      throw e;
    }
  } catch (error: any) {
    console.error('Error setting admin availability:', error);
    return NextResponse.json({ message: `Internal server error: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}

// Optionally, add a GET route to retrieve admin availabilities
export async function GET(request: Request) {
  // Implement admin authentication/authorization here if needed for GET
  // Or, if this is for public consumption, no auth check might be needed.
  // For now, let's assume it's admin-only for consistency.
  const currentUser = await auth();
  if (!currentUser || !currentUser.isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '', 10);
    const year = parseInt(searchParams.get('year') || '', 10);

    if (!month || !year) {
      return NextResponse.json({ message: 'Missing month or year' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    const [rows]: any = await conn.execute(
      `SELECT id, month, year, availableDays, availableHours, created_at, updated_at
       FROM admin_availabilities WHERE month = ? AND year = ? LIMIT 1`,
      [month, year]
    );
    await conn.end();

    const adminAvailability = rows?.[0];
    if (!adminAvailability) {
      return NextResponse.json({ message: 'Availability not found for this month/year' }, { status: 404 });
    }

    return NextResponse.json(adminAvailability, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
