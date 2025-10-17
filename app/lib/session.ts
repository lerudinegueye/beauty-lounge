import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// Define the structure of your session data
export interface SessionData {
  isLoggedIn: boolean;
  id: number;
  email: string;
  isAdmin: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'beauty-lounge-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This is the function your API routes will use to get the session
export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}