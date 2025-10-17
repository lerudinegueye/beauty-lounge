import { NextResponse } from 'next/server';
import { createDatabaseConnection } from '@/app/lib/database';

export async function GET() {
  let conn: any;
  try {
    conn = await createDatabaseConnection();
    const [rows]: any = await conn.execute('SELECT id, name FROM menu_categories ORDER BY name ASC');
    await conn.end();
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    try { if (conn) await conn.end(); } catch {}
    console.error('Error fetching menu categories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
