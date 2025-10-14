import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, getUserByUsername, createVerificationToken } from '../../../utils/auth';
import { sendVerificationEmail } from '../../../utils/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return NextResponse.json({ message: 'This username is already taken.' }, { status: 409 });
    }

    const newUser = await createUser(username, email, password);

    const token = crypto.randomBytes(32).toString('hex');
    await createVerificationToken(newUser.id, token);

    await sendVerificationEmail(newUser.email, token);

    return NextResponse.json({ message: 'Signup successful. Please check your email to verify your account.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}