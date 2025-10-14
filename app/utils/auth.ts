import { Connection } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createDatabaseConnection } from '@/app/lib/database';
import { User, VerificationToken } from './definitions';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { cookies } from 'next/headers'; // Import cookies
import prisma from '../lib/prisma'; // Import Prisma client

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

// Define a type for the authenticated user, including isAdmin
interface AuthenticatedUser {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.username,
    isAdmin: (user as any).is_admin || false, // Assuming is_admin might be on the User type
  };
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

// New auth function to get the current authenticated user with admin status
export async function auth(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies(); // Await cookies()
  const token = cookieStore.get('token')?.value; // Get token from cookies

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number; email: string; name: string; isAdmin: boolean; };
    
    // Fetch the user from the database to ensure isAdmin is up-to-date
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        is_admin: true,
      },
    });

    if (!user) {
      console.log('Auth: User not found in DB for decoded ID:', decoded.id);
      return null;
    }

    const isAdminStatus = user.is_admin || false;
    console.log(`Auth: User ID ${user.id}, email ${user.email}, is_admin from DB: ${user.is_admin}, isAdmin status returned: ${isAdminStatus}`);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isAdmin: isAdminStatus,
    };

  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function createUser(username: string, email: string, password: string, isAdmin: boolean = false): Promise<{ id: number; email: string; }> {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)', 
      [username, email, hashedPassword, isAdmin]
    );
    return { id: result.insertId, email };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [rows] = await conn.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] as User | undefined;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [rows] = await conn.execute<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] as User | undefined;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (isPasswordValid) {
    return user;
  }

  return null;
}

export async function createVerificationToken(userId: number, token: string): Promise<number> {
  const expires_at = new Date(Date.now() + 3600 * 1000);
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expires_at]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating verification token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function createPasswordResetToken(userId: number, token: string): Promise<number> {
  const expires_at = new Date(Date.now() + 3600 * 1000);
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    
    // Delete existing tokens first
    await conn.execute('DELETE FROM password_resets WHERE user_id = ?', [userId]);
    
    // Insert new token
    const [result] = await conn.execute<ResultSetHeader>(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expires_at]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function getVerificationToken(token: string): Promise<VerificationToken | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [rows] = await conn.execute<RowDataPacket[]>('SELECT * FROM email_verifications WHERE token = ?', [token]);
    return rows[0] as VerificationToken | undefined;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function deleteVerificationToken(token: string): Promise<void> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    await conn.execute('DELETE FROM email_verifications WHERE token = ?', [token]);
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function verifyUser(userId: number): Promise<void> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    await conn.execute('UPDATE users SET is_verified = true WHERE id = ?', [userId]);
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function getPasswordResetToken(token: string): Promise<{ user_id: number; expires_at: string } | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    const [rows] = await conn.execute<RowDataPacket[]>('SELECT * FROM password_resets WHERE token = ?', [token]);
    return rows[0] as { user_id: number; expires_at: string } | undefined;
  } catch (error) {
    console.error('Error getting password reset token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    await conn.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    await conn.execute('DELETE FROM password_resets WHERE token = ?', [token]);
  } catch (error) {
    console.error('Error deleting password reset token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}
