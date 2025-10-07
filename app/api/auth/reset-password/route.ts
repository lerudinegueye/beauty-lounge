import { NextRequest, NextResponse } from 'next/server';
import { getPasswordResetToken, updateUserPassword, deletePasswordResetToken } from '../../../utils/auth';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Le jeton et le mot de passe sont requis.' }, { status: 400 });
    }

    const resetToken = await getPasswordResetToken(token);

    if (!resetToken || new Date() > new Date(resetToken.expires_at)) {
      // È buona norma eliminare i token scaduti per pulizia
      if (resetToken) {
        await deletePasswordResetToken(token);
      }
      return NextResponse.json({ message: 'Jeton invalide ou expiré.' }, { status: 400 });
    }

    // La password dovrebbe avere una lunghezza minima
    if (password.length < 6) {
        return NextResponse.json({ message: 'Le mot de passe doit comporter au moins 6 caractères.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(resetToken.user_id, hashedPassword);
    await deletePasswordResetToken(token);

    return NextResponse.json({ message: 'Votre mot de passe a été réinitialisé avec succès.' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ message: 'Une erreur inattendue est survenue.' }, { status: 500 });
  }
}