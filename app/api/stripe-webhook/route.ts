import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from '@/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Normalizza la valuta in 'CFA' se è 'xof'
    const currency = (session.currency || '').toLowerCase() === 'xof' ? 'CFA' : session.currency;

    const orderDetails = {
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: currency,
      };

    // 1. Invia l'email di conferma al cliente
    if (session.customer_email) {
      await sendOrderConfirmationEmail(session.customer_email, orderDetails);
    } else {
      console.error("Customer email is missing in checkout session. Confirmation email not sent.");
    }

    // 2. Invia l'email di notifica all'amministratore
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendAdminNotificationEmail(adminEmail, orderDetails);
    } else {
      console.error('ADMIN_EMAIL not set in .env.local. Admin notification not sent.');
    }
  }

  return NextResponse.json({ received: true });
}