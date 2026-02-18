import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
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

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { content } = body;

    // Fetch diary for ownership check (without user_id filter to allow 403 vs 404 distinction)
    const diary = await prisma.diary.findUnique({
      where: {
        diary_id: id,
      },
    });

    if (!diary) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (diary.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Update diary entry
    const updatedDiary = await prisma.diary.update({
      where: {
        diary_id: id,
      },
      data: {
        content,
      },
    });

    // Update user's last_active_at
    try {
      await prisma.user.update({
        where: { user_id: userId },
        data: { last_active_at: new Date() },
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to update last_active_at:', error);
    }

    return NextResponse.json({
      diary_id: updatedDiary.diary_id,
      content: updatedDiary.content,
      created_at: updatedDiary.created_at,
      updated_at: updatedDiary.updated_at,
    });
  } catch (error) {
    console.error('Update diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
