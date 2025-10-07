import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
// L'import di 'headers' non è più necessario

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const { cart, user } = await req.json();

  const lineItems = cart.map((item: any) => ({
    price_data: {
      currency: 'xof',
      product_data: {
        name: item.title,
      },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3000/payment-success`,
      cancel_url: `http://localhost:3000/cart`,
      metadata: {
        customer_name: user?.name || 'N/A',
      }
    };

    if (user && user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Errore durante la creazione della sessione di checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Errore Stripe: ${errorMessage}` }, { status: 500 });
  }
}