import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, getVerificationToken, deleteVerificationToken } from '../../../utils/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token is missing.' }, { status: 400 });
  }

  try {
    const verificationData = await getVerificationToken(token);

    if (verificationData) {
      const isExpired = new Date(verificationData.expires_at) < new Date();
      if (isExpired) {
        return new Response(JSON.stringify({ message: 'Token has expired' }), { status: 400 });
      }

      try {
        await verifyUser(verificationData.user_id);
        await deleteVerificationToken(verificationData.token);

        return new Response(JSON.stringify({ message: 'Email verified successfully' }), { status: 200 });
      } catch (error) {
        return NextResponse.json({ message: 'Invalid token.' }, { status: 400 });
      }
    }

    return NextResponse.redirect(new URL('/signin?verified=true', req.url));
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred during verification.' }, { status: 500 });
  }
}