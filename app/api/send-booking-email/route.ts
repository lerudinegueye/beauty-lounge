import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail, sendBookingAdminNotificationEmail } from '@/utils/email';

export async function POST(req: NextRequest) {
  try {
    const { cardTitle, cardPrice, customerEmail, phoneNumber, firstName, lastName, bookingDate, bookingTime } = await req.json();

    if (!cardTitle || !cardPrice || !customerEmail || !phoneNumber || !firstName || !lastName || !bookingDate || !bookingTime) {
      return NextResponse.json({ error: 'Données manquantes dans la requête.' }, { status: 400 });
    }

    // 1. Send confirmation email to the customer
    await sendBookingConfirmationEmail(customerEmail, { cardTitle, cardPrice, firstName, bookingDate, bookingTime });

    // 2. Send notification email to the admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendBookingAdminNotificationEmail(adminEmail, { cardTitle, customerEmail, phoneNumber, firstName, lastName, bookingDate, bookingTime });
    } else {
      console.error('ADMIN_EMAIL not set in .env.local. Admin notification not sent.');
    }

    return NextResponse.json({ message: 'E-mails de réservation envoyés avec succès.' }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Erreur dans l'API d'envoi d'e-mail de réservation : ${errorMessage}`);
    return NextResponse.json({ error: `Erreur du serveur : ${errorMessage}` }, { status: 500 });
  }
}