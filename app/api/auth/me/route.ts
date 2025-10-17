import { NextResponse } from 'next/server';
import { auth } from '../../../utils/auth'; // Adjust path as necessary

export async function GET() {
  try {
    const currentUser = await auth();

    if (!currentUser) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Normalize shape for frontend: expose 'name' (from username) and isAdmin
    const mappedUser = {
      id: (currentUser as any).id,
      email: (currentUser as any).email,
      name: (currentUser as any).name ?? (currentUser as any).username ?? '',
      isAdmin: (currentUser as any).isAdmin ?? (currentUser as any).is_admin ?? false,
    };
    return NextResponse.json({ user: mappedUser }, { status: 200 });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
