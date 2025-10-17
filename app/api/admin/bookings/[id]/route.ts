import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { createDatabaseConnection } from '@/app/lib/database';

function getJwtSecret(): string {
  const secretPath = path.join(process.cwd(), 'jwt-secret.txt');
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf8');
  }
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  throw new Error('JWT secret not found');
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { ok: false as const, reason: 'Non autorisé' };
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    const conn = await createDatabaseConnection();
    try {
      const [rows]: any = await conn.execute('SELECT is_admin FROM users WHERE id = ? LIMIT 1', [decoded.id]);
      const isAdmin = rows?.[0]?.is_admin ? true : false;
      await conn.end();
      if (!isAdmin) return { ok: false as const, reason: 'Non autorisé' };
      return { ok: true as const };
    } catch (e) {
      try { await (await createDatabaseConnection()).end(); } catch {}
      throw e;
    }
  } catch (e) {
    return { ok: false as const, reason: 'Non autorisé' };
  }
}

// PATCH: update booking fields (status, payment_confirmation, notes)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ message: admin.reason }, { status: 401 });
  }

  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ message: 'ID de réservation invalide' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, payment_confirmation, notes } = body as {
      status?: string;
      payment_confirmation?: string | null;
      notes?: string | null;
    };

    const fields: string[] = [];
    const values: any[] = [];

    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      fields.push('status = ?');
      values.push(status);
    }
    if (payment_confirmation && ['pending', 'confirmed', 'not_applicable'].includes(payment_confirmation)) {
      fields.push('payment_confirmation = ?');
      values.push(payment_confirmation);
    }
    if (notes !== undefined) {
      // Check if notes column exists before trying to update it
      const connCheck = await createDatabaseConnection();
      try {
        const [notesCol]: any = await connCheck.execute(
          `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'notes' LIMIT 1`
        );
        const hasNotes = Array.isArray(notesCol) ? notesCol.length > 0 : false;
        if (hasNotes) {
          fields.push('notes = ?');
          values.push(notes);
        }
      } finally {
        await connCheck.end();
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ message: 'Aucune donnée à mettre à jour' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    try {
      const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
      values.push(bookingId);
      const [result]: any = await conn.execute(sql, values);
      if (result.affectedRows === 0) {
        await conn.end();
        return NextResponse.json({ message: 'Réservation non trouvée' }, { status: 404 });
      }

      // Return the updated booking (shape similar to admin GET)
      const [notesCol]: any = await conn.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'notes' LIMIT 1`
      );
      const hasNotes = Array.isArray(notesCol) ? notesCol.length > 0 : false;
      const notesSelect = hasNotes ? 'b.notes' : 'NULL AS notes';

      const [rows]: any = await conn.execute(
        `SELECT 
            b.id, b.menu_item_id, b.start_time, b.end_time, b.user_id,
            b.customer_first_name, b.customer_last_name, b.customer_email, b.customer_phone,
            b.payment_confirmation, b.payment_method, b.payment_status,
            b.created_at, b.status, ${notesSelect},
            mi.id AS mi_id, mi.name AS mi_name, mi.price AS mi_price, mi.duration AS mi_duration
         FROM bookings b
         JOIN menu_items mi ON mi.id = b.menu_item_id
         WHERE b.id = ?
         LIMIT 1`,
        [bookingId]
      );
      await conn.end();

      if (!rows || rows.length === 0) {
        return NextResponse.json({ message: 'Réservation non trouvée' }, { status: 404 });
      }

      const r = rows[0];
      const mapped = {
        id: r.id,
        menu_item_id: r.menu_item_id,
        start_time: r.start_time,
        end_time: r.end_time,
        user_id: r.user_id,
        customer_first_name: r.customer_first_name,
        customer_last_name: r.customer_last_name,
        customer_email: r.customer_email,
        customer_phone: r.customer_phone,
        payment_confirmation: r.payment_confirmation,
        payment_method: r.payment_method,
        payment_status: r.payment_status,
        created_at: r.created_at,
        status: r.status,
        notes: r.notes ?? null,
        menu_items: {
          id: r.mi_id,
          name: r.mi_name,
          price: r.mi_price,
          duration: r.mi_duration,
        },
        users: null,
      };

      return NextResponse.json(mapped, { status: 200 });
    } catch (error) {
      try { await (await createDatabaseConnection()).end(); } catch {}
      console.error(`Error updating booking ${bookingId}:`, error);
      return NextResponse.json({ message: 'Une erreur est survenue lors de la mise à jour de la réservation.' }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error parsing request for booking ${bookingId}:`, error);
    return NextResponse.json({ message: 'Requête invalide' }, { status: 400 });
  }
}

// DELETE: remove a booking by id
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ message: admin.reason }, { status: 401 });
  }

  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return NextResponse.json({ message: 'ID de réservation invalide' }, { status: 400 });
  }

  try {
    const conn = await createDatabaseConnection();
    try {
      const [result]: any = await conn.execute('DELETE FROM bookings WHERE id = ?', [bookingId]);
      await conn.end();
      if (result.affectedRows === 0) {
        return NextResponse.json({ message: 'Réservation non trouvée' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Réservation supprimée avec succès' }, { status: 200 });
    } catch (error) {
      try { await (await createDatabaseConnection()).end(); } catch {}
      console.error(`Error deleting booking ${bookingId}:`, error);
      return NextResponse.json({ message: 'Une erreur est survenue lors de la suppression de la réservation.' }, { status: 500 });
    }
  } catch (error) {
    console.error(`Error preparing deletion for booking ${bookingId}:`, error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}