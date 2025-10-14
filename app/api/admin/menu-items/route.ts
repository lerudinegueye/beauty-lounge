import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/utils/auth';

const prisma = new PrismaClient();

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

    const newMenuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration, 10),
        category_id: parseInt(categoryId, 10),
      },
    });

    return NextResponse.json(newMenuItem, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
