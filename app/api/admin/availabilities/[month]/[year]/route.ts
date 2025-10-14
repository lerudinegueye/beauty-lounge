import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { auth } from '../../../../../utils/auth';

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

    const availability = await prisma.adminAvailability.findUnique({
      where: {
        month_year: {
          month: parsedMonth,
          year: parsedYear,
        },
      },
    });

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

    await prisma.adminAvailability.delete({
      where: {
        month_year: {
          month: parseInt(month),
          year: parseInt(year),
        },
      },
    });

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

    const updatedAvailability = await prisma.adminAvailability.update({
      where: {
        month_year: {
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      data: {
        availableDays,
        availableHours,
      },
    });

    return NextResponse.json({ message: 'Availability updated successfully', availability: updatedAvailability }, { status: 200 });
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
