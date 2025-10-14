import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '../../../utils/auth';
import { cookies } from 'next/headers'; // Import cookies

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    if (!user.is_verified) {
      return NextResponse.json({ message: 'Please verify your email before signing in.' }, { status: 403 });
    }

    const token = generateToken(user);

    // Set the token as an HTTP-only cookie
    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 60 * 60, // 1 hour
      path: '/', // Accessible across the entire application
    });

    return NextResponse.json({ message: 'Sign-in successful.' }, { status: 200 });

  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
};
