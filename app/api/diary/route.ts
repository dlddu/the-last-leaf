import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');

    // Parse and validate limit (default: 10, max: 50)
    let limit = 10;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, 50);
      }
    }

    // Build query options
    const queryOptions: any = {
      where: { user_id: userId },
      orderBy: { created_at: 'desc' as const },
      take: limit + 1, // Fetch one extra to check if there are more
    };

    // Add cursor if provided
    if (cursor && cursor.trim() !== '') {
      queryOptions.cursor = { diary_id: cursor };
      queryOptions.skip = 1; // Skip the cursor item
    }

    // Fetch diaries
    const diaries = await prisma.diary.findMany(queryOptions);

    // Check if there are more diaries
    const hasMore = diaries.length > limit;
    const items = hasMore ? diaries.slice(0, limit) : diaries;

    // Calculate next cursor
    const nextCursor = hasMore ? items[items.length - 1].diary_id : null;

    return NextResponse.json({
      diaries: items,
      nextCursor,
    });
  } catch (error) {
    console.error('Get diaries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate content
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Create diary entry
    const diary = await prisma.diary.create({
      data: {
        user_id: userId,
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

    return NextResponse.json(
      { diary_id: diary.diary_id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
