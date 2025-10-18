import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createDatabaseConnection } from '@/app/lib/database';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export async function GET(request: Request) {
  try {
    // Auth via cookie token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: number };

  const url = new URL(request.url);
  const sortField = (url.searchParams.get('sortField') || 'start_time');
  const sortOrder = (url.searchParams.get('sortOrder') || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const status = url.searchParams.get('status') || 'all';
  const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSizeParam = parseInt(url.searchParams.get('pageSize') || '10', 10);

  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 && pageSizeParam <= 100 ? pageSizeParam : 10;
  const offset = (page - 1) * pageSize;

    // Only allow specific sort fields to avoid SQL injection
    const allowedSort = new Set(['start_time', 'created_at']);
    const sortCol = allowedSort.has(sortField) ? sortField : 'start_time';

    const conn = await createDatabaseConnection();
    try {
      // Check admin rights
      const [userRows]: any = await conn.execute('SELECT is_admin FROM users WHERE id = ? LIMIT 1', [decoded.id]);
      const isAdmin = userRows?.[0]?.is_admin ? true : false;
      if (!isAdmin) {
        await conn.end();
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
      }

      const params: any[] = [];
      let where = '';
      if (status !== 'all') {
        where = 'WHERE b.status = ?';
        params.push(status);
      }

      // Check if notes column exists to avoid breaking before migration
      const [notesCol]: any = await conn.execute(
        `SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'notes' LIMIT 1`
      );
      const hasNotes = Array.isArray(notesCol) ? notesCol.length > 0 : false;

      const notesSelect = hasNotes ? 'b.notes' : 'NULL AS notes';

      // Total count for pagination
      const [countRows]: any = await conn.execute(
        `SELECT COUNT(*) AS total FROM bookings b ${where}`,
        params
      );
      const total = countRows?.[0]?.total ?? 0;

      // Paged rows
      const [rows]: any = await conn.execute(
        `SELECT 
            b.id, b.menu_item_id, b.start_time, b.end_time, b.user_id,
            b.customer_first_name, b.customer_last_name, b.customer_email, b.customer_phone,
            b.payment_confirmation, b.payment_method, b.payment_status,
            b.created_at, b.status,
            ${notesSelect},
            mi.id AS mi_id, mi.name AS mi_name, mi.price AS mi_price, mi.duration AS mi_duration
         FROM bookings b
         JOIN menu_items mi ON mi.id = b.menu_item_id
         ${where}
         ORDER BY b.${sortCol} ${sortOrder}
         LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      );

      const mapped = rows.map((r: any) => ({
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
      }));

      await conn.end();
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      return NextResponse.json({ data: mapped, total, page, pageSize, totalPages }, { status: 200 });
    } catch (err) {
      try { await (await createDatabaseConnection()).end(); } catch {}
      throw err;
    }
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération des réservations' }, { status: 500 });
  }
}
