import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    // Get diary id from params
    const { id } = await params;

    // Fetch diary with ownership check
    const diary = await prisma.diary.findUnique({
      where: {
        diary_id: id,
        user_id: userId,
      },
    });

    if (!diary) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      diary_id: diary.diary_id,
      content: diary.content,
      created_at: diary.created_at,
      updated_at: diary.updated_at,
    });
  } catch (error) {
    console.error('Get diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
