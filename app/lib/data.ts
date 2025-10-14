import 'server-only';
import { createDatabaseConnection } from './database';
import { MenuCard, MenuRowData, BookingRow, MenuItemRow } from '@/app/utils/definitions';
import { Connection, RowDataPacket } from 'mysql2/promise'; // Keep for getMenu if not refactored
import prisma from './prisma'; // Import Prisma client

// Define AvailabilityRow locally as it's no longer imported from definitions
interface AvailabilityRow {
    start_time: string;
    end_time: string;
    is_booked?: boolean;
}

export async function getMenu(): Promise<MenuCard[]> {
    let conn: Connection | null = null;
    try {
        conn = await createDatabaseConnection();
        const sqlQuery = `
            SELECT 
                mi.id, 
                mi.name, 
                mi.description, 
                mi.price, 
                mc.name as category 
            FROM menu_items mi
            JOIN menu_categories mc ON mi.category_id = mc.id
        `;
        const [rows] = await conn.execute<MenuRowData[]>(sqlQuery);

        return rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                price: row.price,
                category: row.category,
            };
        });
    } catch (error) {
        console.error('An error occurred in getMenu:', error);
        return [];
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

export async function getAvailabilityData(dateString: string, serviceId: string, serviceType: string) {
    try {
        // Use Prisma to fetch service duration
        const service = await prisma.menuItem.findUnique({
            where: { id: parseInt(serviceId, 10) },
            select: { duration: true },
        });

        if (!service || service.duration === null) {
            throw new Error('Service not found or duration not set');
        }
        const serviceDuration = service.duration;

        // --- NEW LOGIC: Fetch availabilities from AdminAvailability ---
        // Use UTC to avoid timezone-related date shifts.
        // Append 'T00:00:00Z' to treat the date string as UTC.
        const date = new Date(dateString + 'T00:00:00Z');
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();

        console.log(`[getAvailabilityData] Fetching availability for date: ${dateString}, month: ${month}, year: ${year}`);

        const adminAvailability = await prisma.adminAvailability.findUnique({
            where: {
                month_year: {
                    month: month,
                    year: year,
                },
            },
        });

        console.log(`[getAvailabilityData] AdminAvailability found:`, adminAvailability);

        const allPossibleSlots: AvailabilityRow[] = [];
        if (adminAvailability) {
            // --- FIX: Correct parsing of availableDays ---
            // Assuming availableDays stores comma-separated day names like "Monday,Tuesday"
            // Attempt to handle different languages for day names.
            // We'll try to map common French day names to English for comparison.
            const adminDayNamesRaw = adminAvailability.availableDays.split(',').map(day => day.trim().toLowerCase());
            const dayOfWeekEnglish = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' }).format(date).toLowerCase();
            const dayOfWeekFrench = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date); // Get French day name

            // Create a mapping for common day names
            const dayNameMap: { [key: string]: string } = {
                'Monday': 'Monday', 'Lundi': 'Monday',
                'Tuesday': 'Tuesday', 'Mardi': 'Tuesday',
                'Wednesday': 'Wednesday', 'Mercredi': 'Wednesday',
                'Thursday': 'Thursday', 'Jeudi': 'Thursday',
                'Friday': 'Friday', 'Vendredi': 'Friday',
                'Saturday': 'Saturday', 'Samedi': 'Saturday',
                'Sunday': 'Sunday', 'Dimanche': 'Sunday',
            };

            // Normalize admin-entered day names to English
            const normalizedAdminDayNames = adminDayNamesRaw.map(day => dayNameMap[day.charAt(0).toUpperCase() + day.slice(1)]?.toLowerCase() || day);

            console.log(`[getAvailabilityData] Checking if day '${dayOfWeekEnglish}' (or '${dayOfWeekFrench}') is in normalized availableDays:`, normalizedAdminDayNames);

            // Check if the English or French day name (or its normalized English equivalent) is in the list
            if (normalizedAdminDayNames.includes(dayOfWeekEnglish)) {
                // --- FIX: Correct parsing of availableHours ---
                const rawAvailableHours = adminAvailability.availableHours; // Log the raw value
                console.log(`[getAvailabilityData] Raw availableHours from DB: "${rawAvailableHours}"`);

                const timeRanges = rawAvailableHours.split(','); // e.g., ["09:00-12:00", "14:00-18:00"]
                console.log(`[getAvailabilityData] timeRanges after split by comma:`, timeRanges);

                for (const range of timeRanges) {
                    console.log(`[getAvailabilityData] Processing range: "${range}"`);
                    const [startTimeStr, endTimeStr] = range.split('-'); // e.g., ["09:00", "12:00"]
                    console.log(`[getAvailabilityData] startTimeStr: "${startTimeStr}", endTimeStr: "${endTimeStr}"`);

                    if (startTimeStr && endTimeStr) {
                        const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
                        let [endHours, endMinutes] = endTimeStr.split(':').map(Number);

                        // Create Date objects for the start and end of the availability window for the specific date
                        // Use Date.UTC to ensure consistent handling across timezones.
                        // The month parameter for Date.UTC is 0-indexed, so we use parsedMonth - 1.
                        const dailyAvailabilityStart = new Date(date);
                        dailyAvailabilityStart.setUTCHours(startHours, startMinutes, 0, 0);

                        const dailyAvailabilityEnd = new Date(date);

                        // Handle "24:00" as 00:00 of the next day
                        if (endHours === 24 && endMinutes === 0) {
                            dailyAvailabilityEnd.setUTCDate(dailyAvailabilityEnd.getUTCDate() + 1);
                            dailyAvailabilityEnd.setUTCHours(0, 0, 0, 0);
                        } else {
                            dailyAvailabilityEnd.setUTCHours(endHours, endMinutes, 0, 0);
                        }

                        let currentSlotStart = new Date(dailyAvailabilityStart);
                        while (currentSlotStart.getTime() < dailyAvailabilityEnd.getTime()) {
                            const slotEndTime = new Date(currentSlotStart.getTime() + 15 * 60000); // 15-minute interval

                            console.log(`[getAvailabilityData] Loop Iteration: currentSlotStart=${currentSlotStart.toISOString()}, slotEndTime=${slotEndTime.toISOString()}, dailyAvailabilityEnd=${dailyAvailabilityEnd.toISOString()}`); // Added detailed logging for comparison
                            console.log(`[getAvailabilityData] Comparison: slotEndTime.getTime() <= dailyAvailabilityEnd.getTime() is ${slotEndTime.getTime() <= dailyAvailabilityEnd.getTime()}`); // Log the result of the condition

                            // Ensure the slot does not extend beyond the daily availability end
                            if (slotEndTime.getTime() <= dailyAvailabilityEnd.getTime()) {
                                console.log(`[getAvailabilityData] Pushing slot: start=${currentSlotStart.toISOString()}, end=${slotEndTime.toISOString()}`); // Log before pushing
                                allPossibleSlots.push({
                                    start_time: currentSlotStart.toISOString(),
                                    end_time: slotEndTime.toISOString(),
                                });
                            }
                            currentSlotStart = slotEndTime; // Move to the next 15-minute slot
                        }
                    } else {
                        console.log(`[getAvailabilityData] Skipping range "${range}" due to invalid format.`);
                    }
                }
                console.log(`[getAvailabilityData] Generated all possible 15-min slots:`, allPossibleSlots);
            } else {
                console.log(`[getAvailabilityData] Day '${dayOfWeekEnglish}' is not in availableDays.`);
            }
        } else {
            console.log(`[getAvailabilityData] No AdminAvailability record found for month ${month}, year ${year}.`);
        }

        const startOfDay = new Date(dateString + 'T00:00:00.000Z');
        const endOfDay = new Date(dateString + 'T23:59:59.999Z');

        const bookingRows = await prisma.bookings.findMany({
            where: {
                start_time: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const bookings = bookingRows.map(b => ({ booking_time: b.start_time, service_duration: (b.end_time.getTime() - b.start_time.getTime()) / 60000 }));
        console.log(`[getAvailabilityData] Fetched bookings for ${dateString}:`, bookings);
        console.log(`[getAvailabilityData] Service Duration: ${serviceDuration}`); // Log service duration

        // Mark booked slots
        allPossibleSlots.forEach(slot => {
            const slotStart = new Date(slot.start_time).getTime();
            const slotEnd = new Date(slot.end_time).getTime();
            for (const booking of bookings) {
                const bookingStart = new Date(booking.booking_time).getTime();
                const bookingEnd = bookingStart + booking.service_duration * 60000;
                if (slotStart < bookingEnd && slotEnd > bookingStart) {
                    slot.is_booked = true;
                    break; // No need to check other bookings for this slot
                }
            }
        });

        const availableSlots: AvailabilityRow[] = [];
        const slotsNeeded = Math.ceil(serviceDuration / 15);

        for (let i = 0; i <= allPossibleSlots.length - slotsNeeded; ) {
            const potentialSlotSequence = allPossibleSlots.slice(i, i + slotsNeeded);
            const isSequenceAvailable = potentialSlotSequence.every(s => !s.is_booked);

            if (isSequenceAvailable) {
                availableSlots.push(potentialSlotSequence[0]); // Add the start time of the valid sequence
                i += slotsNeeded; // Jump to the next possible non-overlapping slot
            } else {
                i++; // Check the next slot
            }
        }

        // Format the slots for the frontend, which expects an array of time strings (e.g., "10:00")
        const formattedSlots = availableSlots.map(slot => {
            const date = new Date(slot.start_time);
            // Use UTC hours and minutes to avoid timezone shifts during formatting
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        });

        console.log(`[getAvailabilityData] Final formatted slots for duration ${serviceDuration}min:`, formattedSlots);

        return {
            availabilities: formattedSlots,
            bookings,
            serviceDuration
        };
    } catch (error) {
        console.error('Error fetching availability data:', error);
        throw new Error('Failed to fetch availability data.');
    }
}
