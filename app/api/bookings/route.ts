import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseConnection } from '@/app/lib/database';
import { RowDataPacket, Connection } from 'mysql2/promise';
import { sendBookingConfirmationEmail, sendBookingAdminNotificationEmail } from '@/app/utils/email';

// Interfacce per i dati dal DB
interface ServiceRow extends RowDataPacket {
    id: number;
    duration: number;
    name?: string;
    tipo?: string;
}

interface BookingRow extends RowDataPacket {
    id: number;
}

interface UserRow extends RowDataPacket {
    id: number;
}

export async function POST(request: NextRequest) {
    let connection: Connection | null = null;
    try {
        const body = await request.json();        
        const { menu_item_id, start_time, end_time, firstName, lastName, email, phoneNumber } = body;

        // 1. Validazione dell'input
        if (!menu_item_id || !start_time || !end_time || !firstName || !lastName || !email) {
            return NextResponse.json({ message: 'Tutti i campi sono obbligatori' }, { status: 400 });
        }

        const bookingTime = new Date(start_time);
        const bookingEndTime = new Date(end_time);
        connection = await createDatabaseConnection();
        await connection.beginTransaction();

        // 2. Troviamo il servizio e la sua durata
        const serviceTable = 'menu_items';
        const nameColumn = 'name';
        const [serviceRows] = await connection.execute<ServiceRow[]>(
            `SELECT id, duration, ${nameColumn} as name FROM ${serviceTable} WHERE id = ?`,
            [menu_item_id]
        );

        if (serviceRows.length === 0) {
            throw new Error('Servizio non trovato');
        }
        const service = serviceRows[0];

        // 3. Controlliamo se esiste già una prenotazione che si sovrappone
        const [existingBookings] = await connection.execute<BookingRow[]>(
            `SELECT id FROM bookings WHERE ? < end_time AND ? > start_time`,
            [bookingTime, bookingEndTime]
        );

        if (existingBookings.length > 0) {
            throw new Error('Questo orario non è più disponibile.');
        }

        // 4. Verifica se l'utente esiste (per utenti autenticati)
        let [userRows] = await connection.execute<UserRow[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        let userId: number | null = userRows.length > 0 ? userRows[0].id : null;

        // 5. Creiamo la prenotazione con i dati del cliente
        const [newBookingResult] = await connection.execute<any>(
            'INSERT INTO bookings (user_id, menu_item_id, start_time, end_time, customer_first_name, customer_last_name, customer_email, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, service.id, bookingTime, bookingEndTime, firstName, lastName, email, phoneNumber]
        );
        const newBookingId = newBookingResult.insertId;

        await connection.commit();

        // 6. Inviamo le email di conferma
        const serviceName = service.name || 'Servizio';
        const bookingDate = bookingTime.toISOString().split('T')[0];
        const bookingTimeFormatted = bookingTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Email al cliente
        try {
            await sendBookingConfirmationEmail(email, {
                cardTitle: serviceName,
                cardPrice: 0, // Prezzo non disponibile nel contesto attuale
                firstName: firstName,
                bookingDate: bookingDate,
                bookingTime: bookingTimeFormatted
            });
        } catch (emailError) {
            console.error('Errore invio email al cliente:', emailError);
            // Non blocchiamo la risposta se l'email fallisce
        }

        // Email all'amministratore
        try {
            await sendBookingAdminNotificationEmail('noreply.beautylounge@gmail.com', {
                cardTitle: serviceName,
                customerEmail: email,
                phoneNumber: phoneNumber,
                firstName: firstName,
                lastName: lastName,
                bookingDate: bookingDate,
                bookingTime: bookingTimeFormatted
            });
        } catch (emailError) {
            console.error('Errore invio email all\'amministratore:', emailError);
            // Non blocchiamo la risposta se l'email fallisce
        }

        // 7. Se la transazione ha successo, restituiamo una risposta positiva
        return NextResponse.json({
            message: 'Prenotazione creata con successo!',
            bookingId: newBookingId
        }, { status: 201 });

    } catch (error: any) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Errore durante la creazione della prenotazione:', error);

        if (error.message.includes('non è più disponibile')) {
            return NextResponse.json({ message: error.message }, { status: 409 }); // 409 Conflict
        }
        if (error.message.includes('Servizio non trovato')) {
            return NextResponse.json({ message: error.message }, { status: 404 }); // 404 Not Found
        }

        return NextResponse.json({ message: 'Si è verificato un errore durante il processo di prenotazione.' }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
