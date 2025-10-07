import mysql, { Connection } from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createDatabaseConnection } from './data';
import { User, VerificationToken } from './definitions';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.username,
  };
  return jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
}

export async function createUser(username: string, email: string, password: string): Promise<{ id: number; email: string; }> {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (error, results) => {
        if (error) return reject(error);
        resolve({ id: results.insertId, email });
      });
    });
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
    return await new Promise((resolve, reject) => {
      conn!.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] as User | undefined);
      });
    });
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
    return await new Promise((resolve, reject) => {
      conn!.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] as User | undefined);
      });
    });
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

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (isPasswordValid) {
    return user;
  }

  return null;
}

export async function createVerificationToken(userId: number, token: string) {
    const expires_at = new Date(Date.now() + 3600 * 1000); // 1 hour from now
    let conn: Connection | null = null;
    try {
        conn = await createDatabaseConnection();
        return await new Promise((resolve, reject) => {
            conn!.query(
                'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)',
                [userId, token, expires_at],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results.insertId);
                }
            );
        });
    } catch (error) {
        console.error('Error creating verification token:', error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}

export async function createPasswordResetToken(userId: number, token: string) {
    const expires_at = new Date(Date.now() + 3600 * 1000); // 1 ora da adesso
    let conn: Connection | null = null;
    try {
        conn = await createDatabaseConnection();
        // Inizia eliminando i token esistenti per questo utente
        await new Promise<void>((resolve, reject) => {
            conn!.query('DELETE FROM password_resets WHERE user_id = ?', [userId], (error) => {
                if (error) return reject(error);
                resolve();
            });
        });

        // Inserisci il nuovo token
        return await new Promise((resolve, reject) => {
            conn!.query(
                'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
                [userId, token, expires_at],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results.insertId);
                }
            );
        });
    } catch (error) {
        console.error('Errore durante la creazione del token di reset password:', error);
        throw error;
    } finally {
        if (conn) conn.end();
    }
}

export async function getVerificationToken(token: string): Promise<VerificationToken | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('SELECT * FROM email_verifications WHERE token = ?', [token], (error, results) => {
        if (error) return reject(error);
        resolve(results[0] as VerificationToken | undefined);
      });
    });
  } catch (error) {
    console.error('Database query failed:', error);
  } finally {
    if (conn) conn.end();
  }
}

export async function deleteVerificationToken(token: string) {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('DELETE FROM email_verifications WHERE token = ?', [token], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  } catch (error) {
    console.error('Database query failed:', error);
  } finally {
    if (conn) conn.end();
  }
}

export async function verifyUser(userId: number) {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('UPDATE users SET is_verified = true WHERE id = ?', [userId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  } catch (error) {
    console.error('Database query failed:', error);
    // We don't re-throw here to avoid crashing the server on db errors.
  } finally {
    if (conn) conn.end();
  }
}

// Aggiungi queste funzioni, preferibilmente dopo la funzione createPasswordResetToken
// o comunque insieme alle altre funzioni esportate.

export async function getPasswordResetToken(token: string): Promise<{ user_id: number; expires_at: string } | undefined> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('SELECT * FROM password_resets WHERE token = ?', [token], (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  } catch (error) {
    console.error('Error getting password reset token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
  let conn: Connection | null = null;
  try {
    conn = await createDatabaseConnection();
    return await new Promise((resolve, reject) => {
      conn!.query('UPDATE users SET password = ? WHERE id = ?', [password, userId], (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
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
    return await new Promise((resolve, reject) => {
      conn!.query('DELETE FROM password_resets WHERE token = ?', [token], (error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  } catch (error) {
    console.error('Error deleting password reset token:', error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}