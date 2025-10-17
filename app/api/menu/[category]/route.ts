import { NextResponse } from 'next/server';
import { createDatabaseConnection } from '@/app/lib/database';

// GET /api/menu/[category]
// Returns all menu items for the given category name
export async function GET(
  request: Request,
  context: { params: Promise<{ category: string }> }
) {
  const { category } = await context.params; // Await params for Next.js dynamic routes
  const categoryName = decodeURIComponent(category);

  let conn;
  try {
    conn = await createDatabaseConnection();
    const [rows] = await conn.execute(
      `SELECT mi.id, mi.name, mi.description, mi.price, mi.duration, mi.category_id, mi.created_at,
              mc.id AS category_id, mc.name AS category_name
         FROM menu_items mi
         JOIN menu_categories mc ON mc.id = mi.category_id
        WHERE mc.name = ?
        ORDER BY mi.name ASC`,
      [categoryName]
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error(`[API/menu/[category]] Error fetching items for ${categoryName}:`, error);
    return NextResponse.json(
      { error: `Error fetching services for category ${categoryName}` },
      { status: 500 }
    );
  } finally {
    if (conn) await conn.end();
  }
}