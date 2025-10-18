import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/utils/auth';
import { createDatabaseConnection } from '@/app/lib/database';

export async function POST(req: NextRequest) {
  try {
    const user = await auth();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, duration, categoryId } = await req.json();

    if (!name || !price || !duration || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const conn = await createDatabaseConnection();
    const [result]: any = await conn.execute(
      `INSERT INTO menu_items (name, description, price, duration, category_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        description ?? null,
        parseInt(price, 10),
        parseInt(duration, 10),
        parseInt(categoryId, 10),
      ]
    );
    const insertId = result?.insertId;
    const [rows]: any = await conn.execute(
      `SELECT id, name, description, price, duration, category_id, created_at
       FROM menu_items WHERE id = ? LIMIT 1`,
      [insertId]
    );
    await conn.end();
    const newMenuItem = rows?.[0] || null;
    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
