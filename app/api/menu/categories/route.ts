import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        menuItems: true, // Include related menu items
      },
    });
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
