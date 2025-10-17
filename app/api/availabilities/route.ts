// app/api/availabilities/route.ts

import { NextResponse } from 'next/server';
import { getDay } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { createDatabaseConnection } from '@/app/lib/database';
const timeZone = process.env.SALON_TIMEZONE || 'Europe/Rome'; // Fuso del salone (configurabile)

const generateTimeSlots = (
    serviceDuration: number,
    openingHour: number,
    closingHour: number,
    lunchStartHour: number,
    lunchEndHour: number
) => {
    const slots: string[] = [];
    const startMin = openingHour * 60;
    const endMin = closingHour * 60;
    const lunchStartMin = lunchStartHour * 60;
    const lunchEndMin = lunchEndHour * 60;

    for (let m = startMin; m + serviceDuration <= endMin; m += 15) {
        const slotEnd = m + serviceDuration;
        const overlapsLunch = Math.max(m, lunchStartMin) < Math.min(slotEnd, lunchEndMin);
        if (!overlapsLunch) {
            const hh = String(Math.floor(m / 60)).padStart(2, '0');
            const mm = String(m % 60).padStart(2, '0');
            slots.push(`${hh}:${mm}`);
        }
    }

    return slots;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // es: "2025-10-17"
    const serviceId = searchParams.get('serviceId');

    if (!dateStr || !serviceId) {
        return NextResponse.json({ error: 'Date and serviceId are required' }, { status: 400 });
    }

    let conn;
    try {
        // 1) Calcola i limiti della giornata nel fuso del salone e convertili in UTC per interrogare il DB
        const startOfDayUtc = fromZonedTime(`${dateStr}T00:00:00`, timeZone);
        const endOfDayUtc = fromZonedTime(`${dateStr}T23:59:59`, timeZone);

    // Calcola giorno della settimana nel fuso del salone (1=Lunedì ... 7=Domenica)
    const dayOfWeekTz = Number(formatInTimeZone(startOfDayUtc, timeZone, 'i'));

                conn = await createDatabaseConnection();
                // Recupera la durata del servizio
                const [serviceRows]: any = await conn.execute(
                    'SELECT duration FROM menu_items WHERE id = ? LIMIT 1',
                    [parseInt(serviceId, 10)]
                );
                const service = serviceRows?.[0];

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // 2) Recupera le prenotazioni esistenti nella giornata locale (query in UTC)
        // Recupera le prenotazioni esistenti nella giornata
                const [bookingRows]: any = await conn.execute(
                    'SELECT start_time FROM bookings WHERE menu_item_id = ? AND start_time >= ? AND start_time < ?',
                    [parseInt(serviceId, 10), startOfDayUtc, endOfDayUtc]
                );
        
        // Mappa gli orari prenotati nel fuso del salone in formato HH:mm
                        const bookedTimes = bookingRows.map((b: any) =>
                            formatInTimeZone(new Date(b.start_time), timeZone, 'HH:mm')
                        );

    const openingTime = 9;
    const closingTime = 19;
    const lunchBreakStart = 13;
    const lunchBreakEnd = 14;

                // 3) Se è Domenica nel fuso del salone, non ci sono slot
                                if (dayOfWeekTz === 7) {
                    return NextResponse.json({ allTimes: [], availableTimes: [] });
                }

                // 4) Genera gli slot per il giorno selezionato (indipendente dal fuso)
                        const allPossibleSlots = generateTimeSlots(
                    service.duration,
                    openingTime,
                    closingTime,
                    lunchBreakStart,
                    lunchBreakEnd
                );
        
        const availableSlots = allPossibleSlots.filter(slot => !bookedTimes.includes(slot));

                        return NextResponse.json({ allTimes: allPossibleSlots, availableTimes: availableSlots });

    } catch (error) {
        console.error('Error fetching availabilities:', error);
        return NextResponse.json({ error: 'Error fetching availabilities' }, { status: 500 });
    } finally {
        // Chiude la connessione MySQL
        // @ts-ignore - conn può essere undefined se si interrompe prima
        if (conn) await conn.end();
    }
}