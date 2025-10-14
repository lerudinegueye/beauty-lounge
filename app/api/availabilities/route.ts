import { NextResponse } from 'next/server';
import { getAvailabilityData } from '@/app/lib/data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  // serviceType is now always 'menu' as all services are from menu_items
  const date = searchParams.get('date');

  if (!serviceId || !date) {
    return NextResponse.json({ message: 'Missing serviceId or date' }, { status: 400 });
  }

  try {
    // getAvailabilityData now returns the final list of formatted slots.
    const { availabilities } = await getAvailabilityData(date, serviceId, 'menu');
    return NextResponse.json(availabilities);

  } catch (error: any) {
    console.error('[API/availabilities] Failed to fetch availabilities:', error);
    return NextResponse.json({ message: error.message || 'Impossibile caricare gli orari.' }, { status: 500 });
  }
}
