import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust path as necessary

export async function GET(request: Request, { params }: { params: { category: string } }) {
  const categoryName = decodeURIComponent(params.category); // Decode the category name
  console.log(`[API/menu/[category]] Received category: ${categoryName}`); // Log the received category name

  try {
    // Find the category ID based on the category name
    const category = await prisma.menuCategory.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      console.error(`[API/menu/[category]] Category not found for name: ${categoryName}`);
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    // Fetch menu items for the found category
    const menuItems = await prisma.menuItem.findMany({
      where: { category_id: category.id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
