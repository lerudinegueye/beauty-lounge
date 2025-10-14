import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Removed .ts extension
import { auth } from '../../../utils/auth'; // Corrected path and removed .ts extension

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

    // Upsert (update or insert) the AdminAvailability record
    const adminAvailability = await prisma.adminAvailability.upsert({
      where: {
        month_year: {
          month: month,
          year: year,
        },
      },
      update: {
        availableDays: availableDays,
        availableHours: availableHours,
      },
      create: {
        month: month,
        year: year,
        availableDays: availableDays,
        availableHours: availableHours,
      },
    });

    console.log('Admin Availabilities POST: Upsert successful, result:', adminAvailability);
    return NextResponse.json(adminAvailability, { status: 200 });
  } catch (error: any) {
    console.error('Error setting admin availability:', error);
    // Provide more specific error message if available
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

    const adminAvailability = await prisma.adminAvailability.findUnique({
      where: {
        month_year: {
          month: month,
          year: year,
        },
      },
    });

    if (!adminAvailability) {
      return NextResponse.json({ message: 'Availability not found for this month/year' }, { status: 404 });
    }

    return NextResponse.json(adminAvailability, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
