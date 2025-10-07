import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createPasswordResetToken } from '../../../utils/auth';
import { sendPasswordResetEmail } from '../../../utils/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await createPasswordResetToken(user.id, token);
      await sendPasswordResetEmail(email, token);
    }

    // Per motivi di sicurezza, inviamo sempre una risposta generica
    // per non rivelare se un utente è registrato o meno.
    return NextResponse.json({ message: 'Si un compte avec cet e-mail existe, un lien de réinitialisation de mot de passe a été envoyé.' }, { status: 200 });

  } catch (error) {
    console.error('Request password reset error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}