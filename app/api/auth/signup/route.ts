import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, createVerificationToken, getUserByUsername } from '../../../utils/auth';
import { sendVerificationEmail } from '../../../utils/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Username, email, and password are required.' }, { status: 400 });
    }

    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
        if (existingUserByEmail.is_verified) {
            return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
        }
        return NextResponse.json({ message: 'User with this email exists but is not verified. Please check your email.' }, { status: 409 });
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
        return NextResponse.json({ message: 'Username is already taken.' }, { status: 409 });
    }

    const user = await createUser(username, email, password);
    const token = crypto.randomBytes(32).toString('hex');
    
    await createVerificationToken(user.id, token);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: 'User created. Please check your email to verify your account.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}