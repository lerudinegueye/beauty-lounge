import { NextResponse } from 'next/server';
import { auth } from '../../../utils/auth'; // Adjust path as necessary

export async function GET() {
  try {
    const currentUser = await auth();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Return user data, excluding sensitive info like password hash
    return NextResponse.json({ user: currentUser }, { status: 200 });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
